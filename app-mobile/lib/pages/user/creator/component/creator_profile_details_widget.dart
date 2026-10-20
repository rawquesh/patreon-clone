import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:patreon_clone/config/index.dart';
import 'package:patreon_clone/styles/styles.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/creator/creator_model.dart';
import 'package:patreon_clone/models/subscription/subscription_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/utils/my_toast.dart';
import 'package:patreon_clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon_clone/backend/creator/my_creator_controller.dart';
import 'package:patreon_clone/backend/creator/my_creator_provider.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:provider/provider.dart';
import 'package:patreon_clone/pages/user/creator/component/report_user_dialog.dart';

class CreatorProfileDetailsWidget extends StatefulWidget {
  final CreatorModel creatorModel;
  final ScrollController? scrollController;

  const CreatorProfileDetailsWidget({
    super.key,
    required this.creatorModel,
    this.scrollController,
  });

  @override
  State<CreatorProfileDetailsWidget> createState() => _CreatorProfileDetailsWidgetState();
}

class _CreatorProfileDetailsWidgetState extends State<CreatorProfileDetailsWidget> with MySafeState {
  late MyCreatorController myCreatorController;
  late MyCreatorProvider myCreatorProvider;

  String websiteUrl = '';

  void getData({isRefresh = false, isFromCache = false, isNotify = true}) async {
    MyPrint.printOnConsole("getData called with isRefresh: $isRefresh, isFromCache: $isFromCache, isNotify: $isNotify",
        tag: "CreatorProfileGetData");
    await myCreatorController.getUserSubscribedMembershipsPaginatedList(
      isRefresh: true,
      isFromCache: false,
      isNotify: true,
    );

    await myCreatorController.getCreatorStats(
      creatorId: widget.creatorModel.id,
      isRefresh: false,
      isFromCache: true,
      isNotify: true,
    );
  }

  void _handleJoinPressed() async {
    MyPrint.printOnConsole("Join button pressed for creator: ${widget.creatorModel.id}");
    myCreatorProvider.setSubscriptionStatusLoading(true);
    Map<String, dynamic> result = await myCreatorController.joinCreatorFree(
      creatorId: widget.creatorModel.id,
    );
    myCreatorProvider.setSubscriptionStatusLoading(false);

    if (result['success'] == true) {
      await myCreatorController.getUserSubscribedMembershipsPaginatedList(
        isRefresh: true,
        isFromCache: false,
        isNotify: true,
      );
    }

    if (result['success'] == true) {
      if (mounted) {
        MyToast.showSuccess(context: context, msg: "Successfully joined!");
      }
    } else {
      if (mounted) {
        MyToast.showError(
          context: context,
          msg: result['message'] ?? 'Failed to join',
        );
      }
    }
  }

  @override
  void initState() {
    super.initState();
    myCreatorProvider = context.read<MyCreatorProvider>();
    myCreatorController = MyCreatorController(myCreatorProvider: myCreatorProvider);

    if (myCreatorProvider.statsCacheCreatorId.get() != widget.creatorModel.id) {
      myCreatorProvider.clearCreatorStats(isNotify: false);
    }

    getData(
      isRefresh: false,
      isFromCache: true,
      isNotify: true,
    );
  }

  @override
  void dispose() {
    myCreatorProvider.clearSubscriptionStatusForViewedCreator();
    myCreatorProvider.clearCreatorPosts(isNotify: false);
    myCreatorProvider.clearMemberships();
    // myCreatorProvider.clearUserSubscriptions(isNotify: false);
    myCreatorProvider.clearCreatorStats(isNotify: false);

    super.dispose();
  }

  bool _isCreatorSubscribed(MyCreatorProvider provider) {
    APIDocumentsPaginatedListModel<SubscriptionModel> paginationModel = provider.userSubscriptionsPaginationModel.get();

    List<SubscriptionModel> subscriptions = paginationModel.contentsList.getList();

    // Get all active subscription creator IDs
    List<String> activeCreatorIds = subscriptions
        .where((subscription) => subscription.status.toLowerCase() == 'active')
        .map((subscription) => subscription.creator?.id ?? subscription.membership?.creator ?? '')
        .toList();

    // Print check details
    MyPrint.printOnConsole("[SUBSCRIPTION CHECK] For creatorId: ${widget.creatorModel.id} | Active: $activeCreatorIds");

    // Check if any active subscription has this creator's ID
    bool isSubscribed = activeCreatorIds.contains(widget.creatorModel.id);

    MyPrint.printOnConsole("[SUBSCRIPTION CHECK] isSubscribed to ${widget.creatorModel.id}: $isSubscribed");

    return isSubscribed;
  }

  // Helper method to get responsive sizes
  double _getResponsiveSize(double baseSize) {
    double screenWidth = MediaQuery.of(context).size.width;
    double scaleFactor = screenWidth / 375; // Base width (iPhone X)
    return baseSize * scaleFactor.clamp(0.8, 1.2);
  }

  // Helper method for responsive padding
  EdgeInsets _getResponsivePadding(EdgeInsets basePadding) {
    double screenWidth = MediaQuery.of(context).size.width;
    double scaleFactor = screenWidth / 375;
    return EdgeInsets.only(
      left: basePadding.left * scaleFactor.clamp(0.8, 1.2),
      right: basePadding.right * scaleFactor.clamp(0.8, 1.2),
      top: basePadding.top * scaleFactor.clamp(0.8, 1.2),
      bottom: basePadding.bottom * scaleFactor.clamp(0.8, 1.2),
    );
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    MyPrint.printOnConsole("Building CreatorProfileDetailsWidget for creator: ${widget.creatorModel.toMap().toString()}");

    final screenSize = MediaQuery.of(context).size;
    final screenHeight = screenSize.height;

    return MultiProvider(
      providers: [
        ChangeNotifierProvider<APIDocumentsPaginatedListModel<SubscriptionModel>>.value(
          value: myCreatorProvider.userSubscriptionsPaginationModel.get(),
        ),
      ],
      child: Consumer<MyCreatorProvider>(
        builder: (context, provider, child) {
          bool? isSubscribed = _isCreatorSubscribed(provider);
          bool isSubscriptionLoading = provider.isSubscriptionStatusLoading.get();

          final stats = provider.creatorStats.get();
          int totalMembers = stats?.totalMembers ?? 0;
          int totalPosts = stats?.totalPosts ?? 0;
          int paidMembers = 0;
          if (stats != null) {
            paidMembers = stats.tierBreakdown.where((e) => e.monthlyRate > 0).fold(0, (p, e) => p + e.count);
          }

          MyPrint.printOnConsole(
              "Creator Profile Details: totalMembers: $totalMembers, totalPosts: $totalPosts, paidMembers: $paidMembers");

          return SliverAppBar(
            expandedHeight: screenHeight * 0.45,
            pinned: true,
            stretch: true,
            backgroundColor: Styles.scaffoldBackground,
            elevation: 0,
            scrolledUnderElevation: 0,
            leading: IconButton(
              icon: Icon(Icons.chevron_left, color: Colors.black, size: _getResponsiveSize(32)),
              onPressed: () => Navigator.of(context).pop(),
            ),
            flexibleSpace: FlexibleSpaceBar(
              collapseMode: CollapseMode.parallax,
              background: Column(
                children: [
                  // Cover Image Section
                  SizedBox(
                    height: _getResponsiveSize(140),
                    width: double.infinity,
                    child: CommonCachedNetworkImage(
                      imageUrl: widget.creatorModel.profileCover.isNotEmpty
                          ? widget.creatorModel.profileCover
                          : AppConfig.placeholderImageUrl, // Fallback image
                      height: _getResponsiveSize(140),
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                  // Profile Details Section
                  Expanded(
                    child: Container(
                      width: double.infinity,
                      decoration: const BoxDecoration(
                        color: Styles.scaffoldBackground,
                      ),
                      child: Stack(
                        clipBehavior: Clip.none,
                        alignment: Alignment.topCenter,
                        children: [
                          Padding(
                            padding: EdgeInsets.only(top: _getResponsiveSize(45)),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                SizedBox(height: _getResponsiveSize(12)),
                                Padding(
                                  padding: _getResponsivePadding(const EdgeInsets.symmetric(horizontal: 24)),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Flexible(
                                        child: Text(
                                          widget.creatorModel.displayName,
                                          style: TextStyle(
                                            fontSize: _getResponsiveSize(18),
                                            fontWeight: FontWeight.bold,
                                            color: Colors.black87,
                                          ).withEpilogue,
                                          textAlign: TextAlign.center,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      Container(
                                        margin: EdgeInsets.symmetric(horizontal: _getResponsiveSize(8)),
                                        width: _getResponsiveSize(4),
                                        height: _getResponsiveSize(4),
                                        decoration: BoxDecoration(
                                          color: Colors.grey.shade400,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      _buildSubscriptionButton(isSubscribed, isSubscriptionLoading),
                                      IconButton(
                                        icon:
                                            Icon(Icons.report_gmailerrorred, color: Colors.black87, size: _getResponsiveSize(24)),
                                        onPressed: () {
                                          showDialog(
                                            context: context,
                                            builder: (context) => ReportUserDialog(userId: widget.creatorModel.id),
                                          );
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                                SizedBox(height: _getResponsiveSize(12)),
                                Padding(
                                  padding: _getResponsivePadding(const EdgeInsets.symmetric(horizontal: 24)),
                                  child: Text(
                                    widget.creatorModel.bio,
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontSize: _getResponsiveSize(13),
                                      color: Colors.grey,
                                      height: 1.4,
                                    ).withEpilogue,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                SizedBox(height: _getResponsiveSize(12)),
                                GestureDetector(
                                  onTap: () {
                                    final url = AppConfig.creatorShareUrl(widget.creatorModel.username);
                                    Clipboard.setData(ClipboardData(text: url));
                                    MyToast.showSuccess(context: context, msg: 'Link copied to clipboard!');
                                  },
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.link, size: _getResponsiveSize(16), color: themeData.primaryColor),
                                      SizedBox(width: _getResponsiveSize(4)),
                                      Text(
                                        AppConfig.creatorWebsiteUrl(widget.creatorModel.username),
                                        style: TextStyle(
                                          fontSize: _getResponsiveSize(14),
                                          color: themeData.primaryColor,
                                        ).withEpilogue,
                                      ),
                                    ],
                                  ),
                                ),
                                SizedBox(height: _getResponsiveSize(12)),
                                Container(
                                  padding:
                                      EdgeInsets.symmetric(horizontal: _getResponsiveSize(14), vertical: _getResponsiveSize(8)),
                                  child: LayoutBuilder(
                                    builder: (context, constraints) {
                                      bool shouldWrap = constraints.maxWidth < _getResponsiveSize(280);

                                      if (shouldWrap) {
                                        return Column(
                                          children: [
                                            FittedBox(
                                              fit: BoxFit.scaleDown,
                                              child: Row(
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                children: [
                                                  _buildStatItem(totalMembers, 'Total Members'),
                                                  SizedBox(width: _getResponsiveSize(12)),
                                                  _buildStatDivider(),
                                                  SizedBox(width: _getResponsiveSize(12)),
                                                  _buildStatItem(paidMembers, 'Paid Members'),
                                                ],
                                              ),
                                            ),
                                            SizedBox(height: _getResponsiveSize(12)),
                                            _buildStatItem(totalPosts, 'Posts'),
                                          ],
                                        );
                                      } else {
                                        return FittedBox(
                                          fit: BoxFit.scaleDown,
                                          child: Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              _buildStatItem(totalMembers, 'Total Members'),
                                              SizedBox(width: _getResponsiveSize(16)),
                                              _buildStatDivider(),
                                              SizedBox(width: _getResponsiveSize(16)),
                                              _buildStatItem(paidMembers, 'Paid Members'),
                                              SizedBox(width: _getResponsiveSize(16)),
                                              _buildStatDivider(),
                                              SizedBox(width: _getResponsiveSize(16)),
                                              _buildStatItem(totalPosts, 'Posts'),
                                            ],
                                          ),
                                        );
                                      }
                                    },
                                  ),
                                ),
                                SizedBox(height: _getResponsiveSize(12)),
                                Divider(
                                  color: Colors.grey.shade300,
                                  height: 1,
                                  thickness: 1,
                                ),
                              ],
                            ),
                          ),
                          // Profile Picture
                          Positioned(
                            top: _getResponsiveSize(-40),
                            child: Container(
                              padding: EdgeInsets.all(_getResponsiveSize(4)),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(_getResponsiveSize(12)),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black26,
                                    blurRadius: _getResponsiveSize(4),
                                    offset: Offset(0, _getResponsiveSize(2)),
                                  ),
                                ],
                              ),
                              child: CommonCachedNetworkImage(
                                imageUrl: widget.creatorModel.profilePicture,
                                height: _getResponsiveSize(80),
                                width: _getResponsiveSize(80),
                                borderRadius: _getResponsiveSize(12),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            title: AnimatedBuilder(
              animation: widget.scrollController ?? const AlwaysStoppedAnimation(0),
              builder: (context, child) {
                double offset = widget.scrollController?.hasClients == true ? widget.scrollController!.offset : 0;
                double opacity = (offset - 250).clamp(0, 100) / 100;

                return Opacity(
                  opacity: opacity,
                  child: Text(
                    widget.creatorModel.displayName,
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: _getResponsiveSize(18),
                      fontWeight: FontWeight.bold,
                    ).withEpilogue,
                  ),
                );
              },
            ),
            centerTitle: true,
          );
        },
      ),
    );
  }

  Widget _buildStatItem(int count, String label) {
    return Column(
      children: [
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            count.toString(),
            style: TextStyle(
              fontSize: _getResponsiveSize(16),
              fontWeight: FontWeight.bold,
              color: Theme.of(context).primaryColor,
            ).withEpilogue,
          ),
        ),
        SizedBox(height: _getResponsiveSize(2)),
        FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            label,
            style: TextStyle(
              fontSize: _getResponsiveSize(11),
              color: Colors.grey,
              fontWeight: FontWeight.w500,
            ).withEpilogue,
          ),
        ),
      ],
    );
  }

  Widget _buildStatDivider() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: _getResponsiveSize(10)),
      width: 1,
      height: _getResponsiveSize(30),
      color: Colors.grey.shade400,
    );
  }

  Widget _buildSubscriptionButton(bool? isSubscribed, bool isSubscriptionLoading) {
    MyPrint.printOnConsole("_buildSubscriptionButton called with "
        "isSubscribed: $isSubscribed, isSubscriptionLoading: $isSubscriptionLoading");

    if (myCreatorProvider.isSubscriptionStatusLoading.get() || isSubscriptionLoading || isSubscribed == null) {
      return Container(
        width: _getResponsiveSize(60),
        height: _getResponsiveSize(32),
        decoration: BoxDecoration(
          color: Colors.grey[300],
          borderRadius: BorderRadius.circular(_getResponsiveSize(22)),
        ),
        child: Center(
          child: SizedBox(
            width: _getResponsiveSize(20),
            height: _getResponsiveSize(20),
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(Colors.grey[600]!),
            ),
          ),
        ),
      );
    }

    return InkWell(
      onTap: isSubscribed ? null : _handleJoinPressed,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: _getResponsiveSize(8), vertical: _getResponsiveSize(4)),
        decoration: BoxDecoration(
          color: themeData.primaryColor,
          borderRadius: BorderRadius.circular(_getResponsiveSize(8)),
        ),
        child: Text(
          isSubscribed ? "Joined" : "Join",
          style: TextStyle(
            fontSize: _getResponsiveSize(10),
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ).withEpilogue,
        ),
      ),
    );
  }
}
