import 'dart:ui';

import 'package:flutter/material.dart';
// import 'package:patreon-clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon-clone/navigation/navigation_type.dart';
import 'package:patreon-clone/styles/styles.dart';
import 'package:patreon-clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon-clone/models/creator/creator_model.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/user/home/components/username_widget.dart';
import 'package:provider/provider.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';
import 'package:patreon-clone/backend/creator/my_creator_provider.dart';
// import '../../../navigation/navigation_arguments.dart';
// import '../../../navigation/navigation_controller.dart';
import 'package:patreon-clone/pages/user/post/cards/audio_post_card.dart';
import 'package:patreon-clone/pages/user/post/cards/image_post_card.dart';
import 'package:patreon-clone/pages/user/post/cards/link_post_card.dart';
import 'package:patreon-clone/pages/user/post/cards/text_post_card.dart';
import 'package:patreon-clone/pages/user/post/cards/video_post_card.dart';

class CreatorPostsSectionWidget extends StatefulWidget {
  final CreatorModel creatorModel;
  final MyCreatorProvider myCreatorProvider;
  final List<MembershipModel> memberships;
  final List<String> postTypes;
  final List<String> tiers;
  final List<String> dateFilters;
  final String selectedPostType;
  final ScrollController scrollController;
  final String selectedTier;
  final String selectedDateFilter;
  final ValueChanged<String?> onPostTypeChanged;
  final ValueChanged<String?> onTierChanged;
  final ValueChanged<String?> onDateFilterChanged;
  final VoidCallback? activateSearchCallback;
  final bool displaySearchBoxAsHeader;

  const CreatorPostsSectionWidget({
    super.key,
    required this.creatorModel,
    required this.myCreatorProvider,
    required this.memberships,
    required this.postTypes,
    required this.tiers,
    required this.dateFilters,
    required this.selectedPostType,
    required this.selectedTier,
    required this.selectedDateFilter,
    required this.onPostTypeChanged,
    required this.onTierChanged,
    required this.onDateFilterChanged,
    this.activateSearchCallback,
    required this.displaySearchBoxAsHeader,
    required this.scrollController,
  });

  @override
  State<CreatorPostsSectionWidget> createState() => _CreatorPostsSectionWidgetState();
}

class _CreatorPostsSectionWidgetState extends State<CreatorPostsSectionWidget> with MySafeState {
  late Map<String, YoutubePlayerController> _videoControllers;

  @override
  void initState() {
    super.initState();
    _videoControllers = {};
  }

  @override
  void dispose() {
    for (final controller in _videoControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Widget _buildDropdown(String hint, String value, List<String> items, ValueChanged<String?> onChanged) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
      ),
      items: items.map((item) {
        return DropdownMenuItem<String>(
          value: item,
          child: Text(
            item,
            style: const TextStyle(fontSize: 10).withEpilogue,
            overflow: TextOverflow.ellipsis,
          ),
        );
      }).toList(),
      onChanged: onChanged,
      isExpanded: true,
    );
  }

  Widget _buildFilters() {
    return Column(
      children: [
        if (widget.displaySearchBoxAsHeader && widget.activateSearchCallback != null)
          Material(
            color: Styles.scaffoldBackground,
            child: GestureDetector(
              onTap: widget.activateSearchCallback,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Styles.scaffoldBackground2,
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.search, color: Colors.grey.shade600),
                    const SizedBox(width: 12),
                    Text(
                      'Search posts...',
                      style: themeData.textTheme.labelMedium
                          ?.copyWith(
                            color: Colors.grey.shade600,
                          )
                          .withEpilogue,
                    ),
                  ],
                ),
              ),
            ),
          ),
        if (widget.displaySearchBoxAsHeader) const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildDropdown(
                'Post Type',
                widget.selectedPostType,
                widget.postTypes,
                widget.onPostTypeChanged,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildDropdown(
                'Tier',
                widget.selectedTier,
                widget.tiers,
                widget.onTierChanged,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildDropdown(
                'Date',
                widget.selectedDateFilter,
                widget.dateFilters,
                widget.onDateFilterChanged,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPostsList(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<APIDocumentsPaginatedListModel<PostModel>>.value(
          value: widget.myCreatorProvider.postsListPaginationModel.get(),
        ),
      ],
      child: Consumer<APIDocumentsPaginatedListModel<PostModel>>(builder: (context, paginatedListModel, child) {
        if (paginatedListModel.isContentsFirstTimeLoading.get()) {
          return const Center(child: LoadingWidget());
        }

        List<PostModel> posts = paginatedListModel.contentsList.getList();

        final currentPostIds = <String>{};
        for (final post in posts) {
          currentPostIds.add(post.id);
          if (post.type == "video" && !_videoControllers.containsKey(post.id)) {
            final videoId = YoutubePlayer.convertUrlToId(post.videoUrl);
            if (videoId != null && videoId.isNotEmpty) {
              _videoControllers[post.id] = YoutubePlayerController(
                initialVideoId: videoId,
                flags: const YoutubePlayerFlags(autoPlay: false),
              );
            }
          }
        }
        final controllersToRemove = <String>[];
        for (var postId in _videoControllers.keys) {
          if (!currentPostIds.contains(postId)) {
            controllersToRemove.add(postId);
          }
        }
        for (final postId in controllersToRemove) {
          _videoControllers[postId]?.dispose();
          _videoControllers.remove(postId);
        }

        if (!paginatedListModel.isContentsLoading.get() && posts.isEmpty) {
          return Container(
            padding: const EdgeInsets.symmetric(vertical: 50.0),
            alignment: Alignment.center,
            child: const Text("No posts available"),
          );
        }

        return ListView.builder(
          shrinkWrap: true,
          padding: EdgeInsets.zero,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: posts.length + (paginatedListModel.hasMoreContents.get() ? 1 : 0),
          itemBuilder: (context, index) {
            if (index == posts.length && paginatedListModel.hasMoreContents.get()) {
              return (paginatedListModel.isContentsLoading.get() && posts.isNotEmpty)
                  ? const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Center(child: LoadingWidget()),
                    )
                  : const SizedBox.shrink();
            }

            if (index >= posts.length) return const SizedBox.shrink();

            var post = posts[index];
            post.creator = widget.creatorModel;

            bool hasAccess = post.hasAccess;
            MembershipModel? requiredMembership;

            if (!hasAccess) {
              requiredMembership = post.tierAccess.isNotEmpty
                  ? widget.memberships.firstWhere((m) {
                      return m.id == post.tierAccess.first;
                    })
                  : null;
            }

            Widget postCard;
            switch (post.type) {
              case "video":
                final controller = _videoControllers[post.id];
                postCard = VideoPostCard(
                  key: ValueKey(post.id),
                  post: post,
                  controller: controller,
                  isShowUsername: false,
                );
                break;
              case "text":
                postCard = TextPostCard(post: post, isShowUsername: false);
                break;
              case "image":
                postCard = ImagePostCard(post: post, isShowUsername: false);
                break;
              case "audio":
                postCard = AudioPostCard(post: post, isShowUsername: false);
                break;
              case "link":
                postCard = LinkPostCard(post: post, isShowUsername: false);
                break;
              default:
                postCard = ImagePostCard(post: post, isShowUsername: false);
            }

            return InkWell(
              onTap: () {
                if (requiredMembership != null) return;
                context.pushNamed(
                  Routes.postDetails,
                  extra: post.id,
                );
              },
              child: Container(
                padding: const EdgeInsets.all(5),
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: Colors.white,
                  boxShadow: const [
                    BoxShadow(
                      color: Color.fromRGBO(55, 55, 55, 0.067),
                      offset: Offset(0, 8),
                      blurRadius: 24,
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(5),
                  child: Column(
                    children: [
                      UsernameWidget(post: post),
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          AbsorbPointer(
                            absorbing: requiredMembership != null,
                            child: ImageFiltered(
                              enabled: requiredMembership != null,
                              imageFilter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
                              child: postCard,
                            ),
                          ),
                          if (requiredMembership != null)
                            Container(
                              color: Colors.black.withOpacity(0.30),
                              child: Center(
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.lock,
                                        color: Colors.white,
                                        size: 40.0,
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        'Join the "${requiredMembership.name}" tier to see this post',
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        '\$${requiredMembership.monthlyPrice.toStringAsFixed(2)}/month',
                                        style: TextStyle(
                                          color: Colors.white.withOpacity(0.9),
                                          fontSize: 14,
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      ElevatedButton(
                                        onPressed: () {
                                          widget.scrollController.animateTo(
                                            0.0,
                                            duration: const Duration(milliseconds: 500),
                                            curve: Curves.easeInOut,
                                          );
                                        },
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: themeData.primaryColor,
                                          foregroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                        ),
                                        child: const Text('Subscribe'),
                                      )
                                    ],
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
            // MODIFICATION ENDS HERE
          },
        );
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.displaySearchBoxAsHeader)
          Text(
            'Recent posts by ${widget.creatorModel.displayName}',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: themeData.colorScheme.onSurface,
            ).withEpilogue,
          ),
        if (widget.displaySearchBoxAsHeader) const SizedBox(height: 16),
        _buildFilters(),
        const SizedBox(height: 16),
        _buildPostsList(context),
      ],
    );
  }
}
