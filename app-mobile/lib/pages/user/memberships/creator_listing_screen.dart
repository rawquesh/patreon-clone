import 'package:flutter/material.dart';
import 'package:patreon-clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon-clone/models/creator/creator_model.dart';
import 'package:patreon-clone/models/subscription/subscription_model.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/backend/creator/my_creator_controller.dart';
import 'package:patreon-clone/backend/creator/my_creator_provider.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'components/membership_card.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';

class MembershipListingScreen extends StatefulWidget {
  static const String routeName = "/MembershipListingScreen";

  const MembershipListingScreen({super.key});

  @override
  State<MembershipListingScreen> createState() => _MembershipListingScreenState();
}

class _MembershipListingScreenState extends State<MembershipListingScreen> with MySafeState {
  late MyCreatorController myCreatorController;
  late MyCreatorProvider myCreatorProvider;
  ScrollController scrollController = ScrollController();

  Future<void> getData({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    await myCreatorController.getUserSubscribedMembershipsPaginatedList(
      isRefresh: isRefresh,
      isFromCache: isFromCache,
      isNotify: isNotify,
    );
  }

  @override
  void initState() {
    super.initState();
    myCreatorProvider = context.read<MyCreatorProvider>();
    myCreatorController = MyCreatorController(myCreatorProvider: myCreatorProvider);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (myCreatorProvider.userSubscriptionsPaginationModel.get().contentsList.getList().isEmpty) {
        getData(
          isRefresh: true,
          isFromCache: false,
          isNotify: true,
        );
      }
    });
  }

  @override
  void dispose() {
    scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Scaffold(
      appBar: AppBar(
        scrolledUnderElevation: 0,
        elevation: 0,
        title: Text(
          'My Memberships',
          style: const TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: Color(0xFF1A1A1A),
            letterSpacing: -0.5,
          ).withTiempos,
        ),
        centerTitle: true,
      ),
      body: Consumer<MyCreatorProvider>(
        builder: (context, creatorProvider, _) {
          final paginatedListModel = creatorProvider.userSubscriptionsPaginationModel.get();

          return Padding(
            padding: const EdgeInsets.all(8),
            child: _buildNotificationListing(
              context: context,
              paginatedListModel: paginatedListModel,
            ),
          );
        },
      ),
    );
  }

  /*Widget _buildCreatorsList() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<APIDocumentsPaginatedListModel<SubscriptionModel>>.value(
          value: myCreatorProvider.userSubscriptionsPaginationModel.get(),
        )
      ],
      child: Consumer<APIDocumentsPaginatedListModel<SubscriptionModel>>(
        builder: (BuildContext context, APIDocumentsPaginatedListModel<SubscriptionModel> paginatedListModel, Widget? child) {
          return _buildNotificationListing(context: context, paginatedListModel: paginatedListModel);
        },
      ),
    );
  }*/

  Widget _buildNotificationListing(
      {required BuildContext context, required APIDocumentsPaginatedListModel<SubscriptionModel> paginatedListModel}) {
    if (paginatedListModel.isContentsFirstTimeLoading.get()) {
      return const Center(child: LoadingWidget());
    }

    List<SubscriptionModel> creatorsList = paginatedListModel.contentsList.getList(isNewInstance: false);

    // Filter out duplicate creators to ensure each is listed only once
    final uniqueCreatorIds = <String>{};
    final uniqueCreatorsList = creatorsList.where((subscription) {
      final creatorId = subscription.creator?.id;
      if (creatorId == null || creatorId.isEmpty) return false;
      return uniqueCreatorIds.add(creatorId);
    }).toList();

    if (!paginatedListModel.isContentsLoading.get() && uniqueCreatorsList.isEmpty) {
      return LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          return RefreshIndicator(
            color: themeData.primaryColor,
            onRefresh: () async {
              await getData(
                isRefresh: true,
                isFromCache: false,
                isNotify: true,
              );
            },
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: [
                SizedBox(height: constraints.maxHeight / 2.9),
                Center(
                  child: Text(
                    "No Memberships available",
                    style: themeData.textTheme.bodyLarge?.copyWith(
                      fontSize: 16,
                      color: themeData.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        await getData(
          isRefresh: true,
          isFromCache: false,
          isNotify: true,
        );
      },
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        itemCount: uniqueCreatorsList.length + 1,
        controller: scrollController,
        itemBuilder: (context, index) {
          if ((index == 0 && uniqueCreatorsList.isEmpty) || (index == uniqueCreatorsList.length)) {
            return paginatedListModel.isContentsLoading.get() ? const LoadingWidget() : const SizedBox();
          }

          if (paginatedListModel.hasMoreContents.get() &&
              index > (uniqueCreatorsList.length - paginatedListModel.contentsDocumentRefreshLimitForPagination.get())) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              getData(
                isRefresh: false,
                isFromCache: false,
                isNotify: false,
              );
            });
          }
          SubscriptionModel model = uniqueCreatorsList[index];
          return InkWell(
            onTap: () {
              context.pushNamed(
                Routes.creatorProfile,
                extra: {
                  'creatorModel': model.creator ?? CreatorModel(),
                  'creatorUsername': model.creator?.username ?? '',
                },
              );
            },
            child: MembershipCard(
              subscription: model,
              onUnsubscribe: () => getData(isRefresh: true),
            ),
          );
        },
      ),
    );
  }
}
