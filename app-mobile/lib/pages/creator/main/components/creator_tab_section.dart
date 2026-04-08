import 'package:flutter/material.dart';
// import 'package:patreon-clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon-clone/navigation/navigation_type.dart';
import 'package:patreon-clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/backend/common/dependency_injection.dart';
import 'package:patreon-clone/managers/deeplink_manager.dart';
import 'package:patreon-clone/managers/fcm_manager.dart';
import 'package:patreon-clone/pages/user/post/components/decoration.dart';
import 'package:patreon-clone/pages/creator/main/components/creator_about_tab.dart';
import 'package:patreon-clone/pages/creator/main/components/creator_collections_tab.dart';
import 'package:provider/provider.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:go_router/go_router.dart'; // Added for go_router
import 'package:patreon-clone/navigation/app_router.dart'; // Added for Routes

import 'package:patreon-clone/backend/creator/my_creator_controller.dart';
import 'package:patreon-clone/backend/creator/my_creator_provider.dart';
import 'package:patreon-clone/pages/user/post/cards/audio_post_card.dart';
import 'package:patreon-clone/pages/user/post/cards/image_post_card.dart';
import 'package:patreon-clone/pages/user/post/cards/link_post_card.dart';
import 'package:patreon-clone/pages/user/post/cards/text_post_card.dart';
import 'package:patreon-clone/pages/user/post/cards/video_post_card.dart';
import 'creator_header_section.dart';
import 'creator_membership_tab.dart';

class CreatorTabbedSection extends StatefulWidget {
  const CreatorTabbedSection({super.key});

  @override
  State<CreatorTabbedSection> createState() => _CreatorTabbedSectionState();
}

class _CreatorTabbedSectionState extends State<CreatorTabbedSection> with SingleTickerProviderStateMixin, MySafeState {
  late TabController _tabController;
  late MyCreatorProvider myCreatorProvider;
  late MyCreatorController myCreatorController;
  late ScrollController _scrollController;

  late Map<String, YoutubePlayerController> _videoControllers;

  Future<void> _refreshData({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    if (isRefresh) {
      for (final controller in _videoControllers.values) {
        controller.dispose();
      }
      _videoControllers.clear();
    }

    String creatorId = DependencyInjection.authenticationProvider.userId.get();
    MyPrint.printOnConsole("Refreshing creator posts for ID: $creatorId");

    await myCreatorController.getCreatorPostsPaginatedList(
      creatorId: creatorId,
      isRefresh: isRefresh,
      isNotify: isNotify,
      isFromCache: isFromCache,
    );
  }

  Future<void> _loadMoreData() async {
    String creatorId = DependencyInjection.authenticationProvider.userId.get();

    final model = myCreatorProvider.postsListPaginationModel.get();
    if (!model.isContentsLoading.get() && model.hasMoreContents.get()) {
      await myCreatorController.getCreatorPostsPaginatedList(
        creatorId: creatorId,
        isRefresh: false,
        isNotify: true,
      );
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 300.0 &&
        !myCreatorProvider.postsListPaginationModel.get().isContentsLoading.get() &&
        myCreatorProvider.postsListPaginationModel.get().hasMoreContents.get()) {
      MyPrint.printOnConsole("Scroll listener triggered _loadMoreData");
      _loadMoreData();
    }
  }

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      NotificationManager.instance.initialize();
      DeepLinkManager().init(context);
    });
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
    myCreatorProvider = context.read<MyCreatorProvider>();
    myCreatorController = MyCreatorController(
      myCreatorProvider: myCreatorProvider,
    );

    _videoControllers = {};

    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        setState(() {});
      }
    });

    _refreshData(
      isRefresh: true,
      isFromCache: false,
      isNotify: true,
    );
  }

  @override
  void dispose() {
    for (final controller in _videoControllers.values) {
      controller.dispose();
    }
    _tabController.removeListener(() {});
    _tabController.dispose();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return RefreshIndicator(
      onRefresh: () => _refreshData(isRefresh: true),
      child: CustomScrollView(
        controller: _scrollController,
        physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
        slivers: [
          CreatorHeaderSection(
            scrollController: _scrollController,
            tabController: _tabController,
          ),
          _buildTabContentSlivers(),
        ],
      ),
    );
  }

  Widget _buildTabContentSlivers() {
    switch (_tabController.index) {
      case 0:
        return _buildPostsListSliver(context);
      case 1:
        return const CreatorCollectionsTab();
      case 2:
        return const CreatorMembershipTab();
      case 3:
      default:
        return const CreatorAboutTab();
    }
  }

  Widget _buildPostsListSliver(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<APIDocumentsPaginatedListModel<PostModel>>.value(
          value: myCreatorProvider.postsListPaginationModel.get(),
        ),
      ],
      child: Consumer<APIDocumentsPaginatedListModel<PostModel>>(
        builder: (context, paginatedListModel, child) {
          if (paginatedListModel.isContentsFirstTimeLoading.get()) {
            return const SliverToBoxAdapter(child: Center(child: LoadingWidget()));
          }
          List<PostModel> posts = paginatedListModel.contentsList.getList();

          for (final post in posts) {
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

          if (!paginatedListModel.isContentsLoading.get() && posts.isEmpty) {
            return const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 50.0),
                child: Center(child: Text("No posts available")),
              ),
            );
          }
          return SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                if (index >= posts.length) {
                  if (paginatedListModel.hasMoreContents.get() && paginatedListModel.isContentsLoading.get()) {
                    return const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Center(child: LoadingWidget()),
                    );
                  }
                  return const SizedBox.shrink();
                }

                var post = posts[index];

                var model = DependencyInjection.authenticationProvider.userModel.get();
                if (model != null) {
                  post.creator!.username = model.creatorUsername;
                  post.creator!.id = model.userId;
                }

                MyPrint.printOnConsole("🔎 Creator Post $index: data: ${post.toMap()}");

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

                return Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    children: [
                      InkWell(
                        onTap: () {
                          context.pushNamed(
                            Routes.postDetails,
                            extra: post.id,
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: postBoxDecoration(),
                          child: postCard,
                        ),
                      ),
                    ],
                  ),
                );
              },
              childCount: posts.length + (paginatedListModel.hasMoreContents.get() ? 1 : 0),
            ),
          );
        },
      ),
    );
  }
}
