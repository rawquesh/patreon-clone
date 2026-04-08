import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:patreon-clone/styles/styles.dart';
import 'package:patreon-clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/managers/deeplink_manager.dart';

import 'package:patreon-clone/managers/fcm_manager.dart';
import 'package:patreon-clone/backend/post/my_post_controller.dart';
import 'package:patreon-clone/pages/user/post/components/decoration.dart';
import 'package:patreon-clone/constants/constants.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/user/post/cards/audio_post_card.dart';
import 'package:patreon-clone/pages/user/post/cards/link_post_card.dart';
import 'package:patreon-clone/pages/user/post/cards/text_post_card.dart';
import 'package:patreon-clone/pages/user/home/components/username_widget.dart';
import 'package:patreon-clone/pages/user/post/cards/video_post_card.dart';
import 'package:provider/provider.dart';

import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';
import 'package:patreon-clone/backend/post/post_provider.dart';
import 'package:patreon-clone/pages/tab_state.dart';
import 'package:patreon-clone/pages/user/post/cards/image_post_card.dart';

class HomeScreen extends StatefulWidget {
  final bool forceRefresh;

  const HomeScreen({super.key, this.forceRefresh = false});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late PostProvider postProvider;
  late MyPostController myPostController;
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    postProvider = context.read<PostProvider>();
    myPostController = MyPostController(postProvider: postProvider);
    _scrollController = ScrollController();

    _loadInitialData();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      NotificationManager.instance.initialize();
      DeepLinkManager().init(context);
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _loadInitialData() {
    final model = postProvider.myCreatorPagePostsListPaginationModel.get();
    if (widget.forceRefresh || model.contentsLength == 0) {
      _refreshData(isRefresh: true, isFromCache: true, isNotify: true);
    }
  }

  Future<void> _refreshData({bool isRefresh = true, bool isFromCache = false, bool isNotify = true}) async {
    await myPostController.getMyCreatorPostsPaginatedList(isRefresh: isRefresh, isNotify: isNotify, isFromCache: isFromCache);
  }

  Future<void> _loadMoreData() async {
    final model = postProvider.myCreatorPagePostsListPaginationModel.get();
    if (!model.isContentsLoading.get() && model.hasMoreContents.get()) {
      await myPostController.getMyCreatorPostsPaginatedList(isRefresh: false);
    }
  }

  void _goToExplore() {
    context.read<TabState>().setTab(1);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: MultiProvider(
        providers: [
          ChangeNotifierProvider<APIDocumentsPaginatedListModel<PostModel>>.value(
            value: postProvider.myCreatorPagePostsListPaginationModel.get(),
          ),
        ],
        child: Consumer<APIDocumentsPaginatedListModel<PostModel>>(
          builder: (context, paginatedListModel, child) {
            List<PostModel> posts = paginatedListModel.contentsList.getList();

            return RefreshIndicator(
              onRefresh: _refreshData,
              child: CustomScrollView(
                controller: _scrollController,
                slivers: [
                  SliverAppBar(
                    scrolledUnderElevation: 0,
                    floating: true,
                    backgroundColor: Styles.scaffoldBackground,
                    snap: true,
                    title: Row(
                      children: [
                        Image.asset(
                          AppAssets.patreon-cloneLogo,
                          width: 28,
                          height: 28,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'Latest',
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w700,
                            color: Colors.black,
                            letterSpacing: -0.5,
                          ).withTiempos,
                        ),
                      ],
                    ),
                    centerTitle: false,
                    actions: [
                      Padding(
                        padding: const EdgeInsets.only(right: 10, top: 5),
                        child: IconButton(
                          icon: Image.asset(
                            AppAssets.membershipIcon,
                            width: 32,
                            height: 32,
                            color: Colors.black,
                          ),
                          onPressed: () {
                            context.pushNamed(Routes.membershipListing);
                          },
                        ),
                      )
                    ],
                  ),
                  if (paginatedListModel.isContentsFirstTimeLoading.get())
                    const SliverFillRemaining(
                      hasScrollBody: false,
                      child: Center(child: LoadingWidget()),
                    )
                  else if (posts.isEmpty)
                    SliverFillRemaining(
                      hasScrollBody: false,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.explore_outlined, size: 64),
                          const SizedBox(height: 12),
                          Center(
                            child: TextButton(
                              onPressed: _goToExplore,
                              child: Text(
                                'Nothing here yet... \nHead to Explore to discover Creators',
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600).withEpilogue,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.all(12.0).copyWith(top: 12, bottom: 12),
                      sliver: SliverList.builder(
                        itemCount: posts.length + 1,
                        itemBuilder: (context, index) {
                          if (index == posts.length) {
                            return paginatedListModel.isContentsLoading.get()
                                ? const Padding(
                                    padding: EdgeInsets.all(16.0),
                                    child: Center(child: LoadingWidget()),
                                  )
                                : const SizedBox.shrink();
                          }
                          if (paginatedListModel.hasMoreContents.get() &&
                              !paginatedListModel.isContentsLoading.get() &&
                              index >= posts.length - paginatedListModel.contentsDocumentRefreshLimit) {
                            _loadMoreData();
                          }

                          final PostModel post = posts[index];

                          MyPrint.printOnConsole("📝 PostModel: ${post.creator!.toMap()}");

                          Widget postCard;
                          switch (post.type) {
                            case "video":
                              postCard = VideoPostCard(key: ValueKey(post.id), post: post, isShowUsername: false);
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
                              postCard = const Placeholder();
                          }

                          MyPrint.printOnConsole("📝 Full PostModel: ${post.toMap()}");

                          // New logic for checking access based on requiredTiers
                          final bool isUnlocked = post.requiredTiers.isEmpty;

                          MembershipModel? requiredMembership;
                          if (!isUnlocked) {
                            requiredMembership = post.requiredTiers.first;
                          }
                          return Column(
                            children: [
                              GestureDetector(
                                  onTap: isUnlocked
                                      ? () {
                                          context.pushNamed(
                                            Routes.postDetails,
                                            extra: {
                                              'postModel': post,
                                              'postId': post.id,
                                            },
                                          );
                                        }
                                      : null,
                                  child: Container(
                                    decoration: postBoxDecoration(),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(12.0),
                                      child: Column(
                                        children: [
                                          UsernameWidget(post: post),
                                          AbsorbPointer(
                                            absorbing: !isUnlocked,
                                            child: Stack(
                                              alignment: Alignment.center,
                                              children: [
                                                !isUnlocked
                                                    ? ImageFiltered(
                                                        imageFilter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
                                                        child: postCard,
                                                      )
                                                    : postCard,
                                                if (!isUnlocked)
                                                  Container(
                                                    alignment: Alignment.center,
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
                                                              'Join the "${requiredMembership!.name}" tier to see this post',
                                                              textAlign: TextAlign.center,
                                                              style: const TextStyle(
                                                                color: Colors.white,
                                                                fontWeight: FontWeight.bold,
                                                                fontSize: 16,
                                                              ),
                                                            ),

                                                            // const Text(
                                                            //   'Subscribe to unlock this post',
                                                            //   textAlign: TextAlign.center,
                                                            //   style: TextStyle(
                                                            //     color: Colors.white,
                                                            //     fontWeight: FontWeight.bold,
                                                            //     fontSize: 16,
                                                            //   ),
                                                            // ),
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  )),
                              const SizedBox(height: 10),
                            ],
                          );
                        },
                      ),
                    ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
