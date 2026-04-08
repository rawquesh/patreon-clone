import 'dart:async';
import 'dart:math' as log_math;
import 'dart:ui';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:just_audio/just_audio.dart';
import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';
import 'package:patreon-clone/backend/post/post_repository.dart';
import 'package:patreon-clone/models/common/data_model/api_documents_paginated_list_model.dart';

import 'package:patreon-clone/models/common/data_model/paginated_request_model.dart';
import 'package:patreon-clone/models/message/attachment_data_model.dart';
import 'package:patreon-clone/models/post/data_model/comment_model.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/backend/common/dependency_injection.dart';

import 'package:patreon-clone/backend/post/liked_posts_controller.dart';
import 'package:patreon-clone/backend/post/liked_posts_provider.dart';
import 'package:patreon-clone/backend/post/my_post_controller.dart';
import 'package:patreon-clone/backend/post/post_provider.dart';
import 'package:patreon-clone/pages/user/post/components/link_preview_display.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/user/post/components/html_viewer.dart';
import 'package:patreon-clone/pages/user/post/components/post_tags.dart';
import 'package:patreon-clone/utils/datetime.dart';
import 'package:patreon-clone/navigation/app_router.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
// import 'package:youtube_player_flutter/youtube_player_flutter.dart'; // Removed

// +++ NEW IMPORTS +++
import 'package:cached_video_player_plus/cached_video_player_plus.dart';
import 'package:chewie/chewie.dart';
import 'package:youtube_explode_dart/youtube_explode_dart.dart';
import 'package:video_thumbnail/video_thumbnail.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'dart:convert'; // For utf8
// +++ END NEW IMPORTS +++

import 'package:patreon-clone/backend/authentication/authentication_provider.dart';
import 'package:patreon-clone/backend/creator/my_creator_controller.dart';
import 'package:patreon-clone/backend/creator/my_creator_provider.dart';
import 'package:patreon-clone/pages/user/home/components/animated_heart_button.dart';
import 'package:patreon-clone/pages/user/post/components/report_post_dialog.dart';

class PostDetailsScreen extends StatefulWidget {
  static const String routeName = "/PostDetailsScreen";
  final String? postId;
  final PostModel? postModel;

  const PostDetailsScreen({super.key, this.postId, this.postModel});

  @override
  State<PostDetailsScreen> createState() => _PostDetailsScreenState();
}

class _PostDetailsScreenState extends State<PostDetailsScreen> {
  // --- State & Controllers ---
  late PostModel postModel; // Single source of truth for post data
  late LikedPostsController likedPostsController;
  late MyCreatorController myCreatorController;
  final ApiService _apiService = ApiService();

  bool _isJoinLoading = false;
  int _currentPage = 0;

  // Comment related state
  final TextEditingController _commentController = TextEditingController();
  final FocusNode _commentFocusNode = FocusNode();
  String? _replyingToCommentId;
  String? _replyingToUsername;
  bool isPostingComment = false;

  // Comment Like Debouncing
  final Map<String, bool> _serverLiked = {};
  final Map<String, bool> _inFlight = {};
  final Map<String, Timer?> _debouncers = {};
  final Duration _likeDebounce = const Duration(milliseconds: 300);

  // --- Media Players ---

  // --- REMOVED OLD YOUTUBE CONTROLLER ---
  // late YoutubePlayerController? _youtubeController;

  // --- NEW UNIFIED VIDEO PLAYER STATE ---
  CachedVideoPlayerPlus? _videoPlayer;
  ChewieController? _chewieController;
  bool _isPlayerVisible = false;
  double _dynamicAspectRatio = 16 / 9;
  String? _youtubeVideoId;
  String? _customThumbnailPath;
  bool _isFetchingYouTubeUrl = false;

  // Define your aspect ratio constraints
  // static const double _minAspectRatio = 3 / 4; // 0.75
  // static const double _maxAspectRatio = 16 / 9; // ~1.777

  // --- Audio Player (Unchanged) ---
  final AudioPlayer _audioPlayer = AudioPlayer();
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;
  bool _isPlaying = false;

  // Pagination
  late APIDocumentsPaginatedListModel<CommentModel> commentsPaginationModel;

  // --- Lifecycle Methods ---

  @override
  void initState() {
    super.initState();
    // Initialize the single source of truth for post data
    postModel = widget.postModel!;

    if (!postModel.hasAccess) MyToast.showToast('This post is restricted. Subscribe the creator to gain access.');

    // Initialize Providers and Controllers
    final likedPostsProvider = context.read<LikedPostsProvider>();
    final postProvider = context.read<PostProvider>();
    final myPostController = MyPostController(postProvider: postProvider);
    final myCreatorProvider = context.read<MyCreatorProvider>();

    likedPostsController = LikedPostsController(likedPostsProvider: likedPostsProvider, myPostController: myPostController);
    myCreatorController = MyCreatorController(myCreatorProvider: myCreatorProvider);

    // Sync like status from provider if available
    postModel.hasLiked = likedPostsProvider.likedPosts.getMap()[postModel.id] ?? postModel.hasLiked;
    postModel.likeCount = likedPostsProvider.likeCounts.getMap()[postModel.id] ?? postModel.likeCount;

    // Initialize Comments
    commentsPaginationModel = APIDocumentsPaginatedListModel<CommentModel>(
      contentsDocumentLimit: 10,
      contentsDocumentRefreshLimit: 3,
    );
    getComments(isRefresh: true, isNotify: false, isFromInit: true);

    // Initialize Media
    _initializeMediaPlayers();

    // Fetch initial subscription data
    getData(isRefresh: false, isFromCache: true, isNotify: false);
  }

  void _initializeMediaPlayers() {
    // --- UPDATED VIDEO INITIALIZATION ---
    if (postModel.type == "video") {
      if (postModel.videoProvider == 'youtube' && postModel.videoUrl.isNotEmpty) {
        try {
          _youtubeVideoId = VideoId.parseVideoId(postModel.videoUrl);
        } catch (e) {
          MyPrint.printOnConsole('Could not parse YouTube video ID: $e');
          _youtubeVideoId = null;
        }
      } else if (postModel.videoProvider == 'upload' && postModel.videoUrl.isNotEmpty) {
        _generateCustomThumbnail();
      }
    }
    // --- END UPDATED VIDEO INITIALIZATION ---

    if (postModel.type == "audio") {
      _setupAudioPlayer();
      _prepareAudio();
    }
  }

  @override
  void dispose() {
    // --- UPDATED DISPOSE ---
    _videoPlayer?.dispose();
    _chewieController?.dispose();
    // --- END UPDATED DISPOSE ---

    _audioPlayer.dispose();
    _commentController.dispose();
    _commentFocusNode.dispose();
    for (var timer in _debouncers.values) {
      timer?.cancel();
    }
    super.dispose();
  }

  // --- Data Fetching & Refreshing (All Unchanged) ---

  Future<void> _handleRefresh() async {
    await Future.wait([
      getFeedData(),
      getComments(isRefresh: true),
    ]);
  }

  Future<void> getFeedData() async {
    final freshPost = await PostRepository().getPostById(postId: postModel.id);
    if (freshPost != null && mounted) {
      final likedPostsProvider = context.read<LikedPostsProvider>();
      likedPostsProvider.likedPosts.setMap(map: {postModel.id: freshPost.hasLiked}, isClear: false);
      likedPostsProvider.likeCounts.setMap(map: {postModel.id: freshPost.likeCount}, isClear: false);

      setState(() {
        postModel = freshPost;
      });
    }
  }

  Future<void> getComments({bool isRefresh = true, bool isNotify = true, bool isFromInit = false}) async {
    final paginatedListModel = commentsPaginationModel;

    await _apiService.getPaginatedList(PaginatedRequestModel<CommentModel>(
      paginatedListModel: paginatedListModel,
      endpoint: ApiEndpoints.postComments(postModel.id),
      dataListKey: 'comments',
      isRefresh: isRefresh,
      isNotify: isNotify,
      fromMap: (data) {
        if (data.isEmpty) return null;
        CommentModel comment = CommentModel.fromMap(data);
        comment.isLiked = likedPostsController.isCommentLiked(comment.id);
        return comment;
      },
    ));

    if (isRefresh && !isFromInit) {
      postModel.lastComment =
          commentsPaginationModel.contentsLength > 0 ? commentsPaginationModel.contentsList.elementAtIndex(0) : null;
    }
    setState(() {});
  }

  void getData({bool isRefresh = false, bool isFromCache = false, bool isNotify = true}) async {
    setState(() => _isJoinLoading = true);
    await myCreatorController.getUserSubscribedMembershipsPaginatedList(
      isRefresh: isRefresh,
      isFromCache: isFromCache,
      isNotify: isNotify,
    );
    setState(() => _isJoinLoading = false);
  }

  // --- Actions & Handlers (All Unchanged) ---

  Future<void> _toggleLike() async {
    final originalLikedStatus = postModel.hasLiked;
    final originalLikeCount = postModel.likeCount;

    // Optimistic UI update
    setState(() {
      postModel.hasLiked = !originalLikedStatus;
      postModel.likeCount += (postModel.hasLiked) ? 1 : -1;
    });
    context.read<LikedPostsProvider>().likedPosts.setMap(map: {postModel.id: postModel.hasLiked}, isClear: false);
    context.read<LikedPostsProvider>().likeCounts.setMap(map: {postModel.id: postModel.likeCount}, isClear: false);

    try {
      final result = await likedPostsController.toggleLike(postModel.id);
      if (!result['success']) {
        throw Exception(result['error'] ?? 'Failed to toggle like');
      }
    } catch (e) {
      // Revert on failure
      setState(() {
        postModel.hasLiked = originalLikedStatus;
        postModel.likeCount = originalLikeCount;
      });
      context.read<LikedPostsProvider>().likedPosts.setMap(map: {postModel.id: originalLikedStatus}, isClear: false);
      context.read<LikedPostsProvider>().likeCounts.setMap(map: {postModel.id: originalLikeCount}, isClear: false);
      MyToast.showError(context: context, msg: 'Failed to toggle like');
    }
  }

  Future<void> _submitComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty || isPostingComment) return;

    // 1. Get the current user's data
    final UserModel? currentUser = DependencyInjection.authenticationProvider.userModel.get();
    if (currentUser == null) {
      MyToast.showError(context: context, msg: "You must be logged in to comment.");
      return;
    }

    setState(() => isPostingComment = true);

    try {
      final newCommentData =
          await PostRepository().createCommentOnPost(postId: postModel.id, text: text, parentId: _replyingToCommentId);

      if (newCommentData != null) {
        final newComment = CommentModel.fromMap(newCommentData);

        // 2. **FIX**: Add the user's info to the new comment object
        newComment.displayName = currentUser.displayName;
        newComment.profilePicture = currentUser.profilePicture;
        newComment.userId = currentUser.userId;

        // 3. Add the complete comment to the local list
        setState(() {
          commentsPaginationModel.contentsList.insertAtIndex(index: 0, model: newComment);
          postModel.commentCount++;
        });

        _commentController.clear();
        _cancelReply();
        MyToast.showSuccess(context: context, msg: "Comment posted");
      } else {
        MyToast.showError(context: context, msg: "Failed to post comment");
      }
    } catch (e) {
      MyPrint.printOnConsole("Error submitting comment: $e");
      MyToast.showError(context: context, msg: "An error occurred");
    } finally {
      setState(() => isPostingComment = false);
    }
  }

  void _onTapCommentLike(CommentModel comment) {
    final id = comment.id;
    _serverLiked.putIfAbsent(id, () => comment.isLiked);

    // Optimistic UI update
    setState(() {
      final wasLikedUi = comment.isLiked;
      comment.isLiked = !wasLikedUi;
      comment.likesCount += wasLikedUi ? -1 : 1;
      if (comment.likesCount < 0) comment.likesCount = 0;
    });

    _debouncers[id]?.cancel();
    _debouncers[id] = Timer(_likeDebounce, () => _commitCommentLike(comment));
  }

  Future<void> _commitCommentLike(CommentModel comment) async {
    final id = comment.id;

    if (_inFlight[id] == true) {
      _debouncers[id]?.cancel();
      _debouncers[id] = Timer(const Duration(milliseconds: 120), () => _commitCommentLike(comment));
      return;
    }

    setState(() => _inFlight[id] = true);

    try {
      final bool desiredFinal = comment.isLiked;
      bool server = _serverLiked[id] ?? desiredFinal;

      if (server != desiredFinal) {
        final result = await likedPostsController.toggleCommentLike(postModel.id, id);
        if (result['success'] != true) throw Exception('API call failed');
        server = !server;
        _serverLiked[id] = server;
      }

      if (comment.isLiked != _serverLiked[id]) {
        _debouncers[id]?.cancel();
        _debouncers[id] = Timer(const Duration(milliseconds: 10), () => _commitCommentLike(comment));
      }
    } catch (e) {
      final bool server = _serverLiked[id] ?? false;
      if (comment.isLiked != server) {
        setState(() {
          comment.likesCount += comment.isLiked ? -1 : 1;
          if (comment.likesCount < 0) comment.likesCount = 0;
          comment.isLiked = server;
        });
      }
      MyToast.showError(context: context, msg: 'Failed to update like status.');
    } finally {
      setState(() => _inFlight[id] = false);
    }
  }

  Future<void> _handleJoinPressed() async {
    final creatorId = postModel.creator?.id;
    if (creatorId == null || creatorId.isEmpty) return;

    setState(() => _isJoinLoading = true);

    try {
      Map<String, dynamic> result = await myCreatorController.joinCreatorFree(creatorId: creatorId);
      if (mounted) {
        if (result['success'] == true) {
          MyToast.showSuccess(context: context, msg: result['message'] ?? 'You are now a free member');
          getData(isRefresh: true, isFromCache: false, isNotify: true);
        } else {
          MyToast.showError(context: context, msg: result['message'] ?? 'Failed to join');
        }
      }
    } catch (e) {
      if (mounted) {
        MyToast.showError(context: context, msg: 'An error occurred while joining');
      }
    } finally {
      setState(() => _isJoinLoading = false);
    }
  }

  void _setReplyingTo(String commentId, String username) {
    setState(() {
      _replyingToCommentId = commentId;
      _replyingToUsername = username;
      _commentController.text = "@$username ";
      _commentController.selection = TextSelection.fromPosition(TextPosition(offset: _commentController.text.length));
      _commentFocusNode.requestFocus();
    });
  }

  void _cancelReply() {
    setState(() {
      _replyingToCommentId = null;
      _replyingToUsername = null;
      _commentController.clear();
      _commentFocusNode.unfocus();
    });
  }

  // --- Audio Player Methods (Unchanged) ---

  Future<void> _prepareAudio() async {
    if (postModel.mediaUrls.isNotEmpty) {
      try {
        await _audioPlayer.setUrl(postModel.mediaUrls.first);
      } catch (e) {
        MyPrint.printOnConsole('Error loading audio: $e');
      }
    }
  }

  void _setupAudioPlayer() {
    _audioPlayer.durationStream.listen((d) => setState(() => _duration = d ?? Duration.zero));
    _audioPlayer.positionStream.listen((p) => setState(() => _position = p));
    _audioPlayer.playerStateStream.listen((state) {
      setState(() => _isPlaying = state.playing);
      if (state.processingState == ProcessingState.completed) {
        _audioPlayer.seek(Duration.zero);
        _audioPlayer.pause();
      }
    });
  }

  Future<void> _playPauseAudio() async {
    final audioUrl = postModel.mediaUrls.isNotEmpty ? postModel.mediaUrls.first : null;
    if (audioUrl == null) return;

    if (_isPlaying) {
      await _audioPlayer.pause();
    } else {
      if (_audioPlayer.duration == null) {
        try {
          await _audioPlayer.setUrl(audioUrl);
        } catch (e) {
          MyPrint.printOnConsole('Error setting audio URL: $e');
          return;
        }
      }
      await _audioPlayer.play();
    }
  }

  // --- +++ NEW VIDEO PLAYER METHODS +++ ---

  Future<void> _generateCustomThumbnail() async {
    if (!mounted) return;
    try {
      final bytes = utf8.encode(postModel.videoUrl);
      final digest = sha1.convert(bytes);
      final fileName = '$digest.jpg';

      final tempDir = await getTemporaryDirectory();
      final thumbnailPath = '${tempDir.path}/$fileName';

      final thumbnailFile = File(thumbnailPath);

      if (await thumbnailFile.exists()) {
        if (mounted) {
          setState(() {
            _customThumbnailPath = thumbnailPath;
          });
        }
      } else {
        final path = await VideoThumbnail.thumbnailFile(
          video: postModel.videoUrl,
          thumbnailPath: thumbnailPath,
          imageFormat: ImageFormat.JPEG,
          maxWidth: 320,
          quality: 75,
        );
        if (mounted) {
          setState(() {
            _customThumbnailPath = path;
          });
        }
      }
    } catch (e) {
      MyPrint.printOnConsole('Error generating/caching thumbnail for ${postModel.videoUrl}: $e');
    }
  }

  void _playVideo() async {
    if (_isPlayerVisible || _isFetchingYouTubeUrl) return;

    setState(() {
      _isPlayerVisible = true;
      _isFetchingYouTubeUrl = postModel.videoProvider == 'youtube';
    });

    try {
      String videoUrlToPlay;

      if (postModel.videoProvider == 'youtube') {
        final yt = YoutubeExplode();
        final manifest = await yt.videos.streamsClient.getManifest(postModel.videoUrl);
        final streamInfo = manifest.muxed.withHighestBitrate();
        videoUrlToPlay = streamInfo.url.toString();
        yt.close();
      } else {
        videoUrlToPlay = postModel.videoUrl;
      }

      if (mounted && _isFetchingYouTubeUrl) {
        setState(() {
          _isFetchingYouTubeUrl = false;
        });
      }

      _videoPlayer = CachedVideoPlayerPlus.networkUrl(
        Uri.parse(videoUrlToPlay),
      );

      await _videoPlayer!.initialize();

      // final double videoAR = _videoPlayer!.controller.value.aspectRatio;

      // Use logMath (from dart:math) as it's already imported
      _dynamicAspectRatio = _videoPlayer!.controller.value.aspectRatio;
      _chewieController = ChewieController(
        videoPlayerController: _videoPlayer!.controller,
        aspectRatio: _dynamicAspectRatio,
        autoPlay: true,
        looping: false,
        allowFullScreen: true,
        materialProgressColors: ChewieProgressColors(
          playedColor: Theme.of(context).primaryColor,
          handleColor: Theme.of(context).primaryColor,
          backgroundColor: Colors.grey,
          bufferedColor: const Color.fromARGB(255, 123, 213, 255),
        ),
        cupertinoProgressColors: ChewieProgressColors(
          playedColor: Theme.of(context).primaryColor,
          handleColor: Theme.of(context).primaryColor,
          backgroundColor: Colors.grey,
          bufferedColor: const Color.fromARGB(255, 123, 213, 255),
        ),
      );

      setState(() {});
    } catch (e) {
      MyPrint.printOnConsole('Error initializing video player: $e');
      if (mounted) {
        setState(() {
          _isPlayerVisible = false;
          _isFetchingYouTubeUrl = false;
        });
      }
    }
  }

  // --- Build Method (Unchanged) ---

  @override
  Widget build(BuildContext context) {
    UserModel? userModel = DependencyInjection.authenticationProvider.userModel.get();

    var hasAccess = postModel.hasAccess;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(),
      body: RefreshIndicator(
        onRefresh: _handleRefresh,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: GestureDetector(
            onTap: () => FocusScope.of(context).unfocus(),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              _buildCreatorHeader(),
              AbsorbPointer(
                absorbing: !hasAccess,
                child: Stack(
                  children: [
                    ImageFiltered(
                      imageFilter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
                      enabled: !hasAccess,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildPostHeader(),
                          _buildPostContent(),
                          MyHTMLViewer(post: postModel, isSmall: !hasAccess),
                          PostTagsWidget(post: postModel),
                          const SizedBox(height: 14),
                          _buildAttachmentsSection(),
                          _buildActionBar(),
                          _buildCommentsSection(),
                          const SizedBox(height: 100),
                        ],
                      ),
                    ),
                    if (!hasAccess)
                      Container(
                        alignment: Alignment.center,
                        color: Colors.black.withOpacity(0.30),
                        child: const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.lock,
                                  color: Colors.white,
                                  size: 40.0,
                                ),
                                SizedBox(height: 12),
                                Text(
                                  'Subscribe to unlock this post',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ]),
          ),
        ),
      ),
      bottomSheet: (userModel != null && hasAccess) ? _buildCommentInput(userModel) : null,
    );
  }

  // --- UI Builder Widgets (Unchanged) ---

  AppBar _buildAppBar() {
    return AppBar(
      backgroundColor: Theme.of(context).primaryColor,
      elevation: 0,
      leading: IconButton(
        onPressed: () => Navigator.pop(context),
        icon: const Icon(CupertinoIcons.chevron_left, color: Colors.white),
      ),
      title: const Text("Post", style: TextStyle(color: Colors.white)),
      actions: [
        IconButton(
          icon: const Icon(CupertinoIcons.share, color: Colors.white),
          onPressed: () => _sharePost(context, postModel.id),
        ),
        PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert, color: Colors.white),
          onSelected: (value) {
            if (value == 'report') {
              showDialog(
                context: context,
                builder: (context) => ReportPostDialog(postId: postModel.id),
              );
            }
          },
          itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
            const PopupMenuItem<String>(
              value: 'report',
              child: Row(
                children: [
                  Icon(Icons.report_gmailerrorred, size: 18, color: Colors.black54),
                  SizedBox(width: 8),
                  Text('Report'),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCreatorHeader() {
    final creator = postModel.creator;
    if (creator == null) return const SizedBox.shrink();

    final currentUserId = context.read<AuthenticationProvider>().userModel.get()?.userId ?? '';
    final bool isMyPost = creator.id == currentUserId;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Consumer<MyCreatorProvider>(
        builder: (context, provider, _) {
          final isSubscribed = provider.userSubscriptionsPaginationModel
              .get()
              .contentsList
              .getList()
              .any((sub) => sub.creator?.id == creator.id && sub.status.toLowerCase() == 'active');
          return Row(
            children: [
              GestureDetector(
                onTap: () => context.pushNamed(
                  Routes.creatorProfile,
                  extra: {
                    'creatorModel': creator,
                    'creatorUsername': creator.username,
                  },
                ),
                child: CommonCachedNetworkImage(
                    imageUrl: creator.profilePicture, height: 48, width: 48, borderRadius: 24, fit: BoxFit.cover),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(creator.displayName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold).withEpilogue),
                    const SizedBox(height: 2),
                    Text('@${creator.username}', style: const TextStyle(fontSize: 13, color: Colors.grey).withEpilogue),
                  ],
                ),
              ),
              if (!isMyPost)
                _isJoinLoading
                    ? const LoadingWidget(loaderSize: 18, boxSize: 18)
                    : GestureDetector(
                        onTap: !isSubscribed ? _handleJoinPressed : null,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                              color: isSubscribed ? Colors.grey.shade300 : Theme.of(context).primaryColor,
                              borderRadius: BorderRadius.circular(12)),
                          child: Text(
                            isSubscribed ? 'Joined' : 'Join',
                            style: TextStyle(color: isSubscribed ? Colors.black : Colors.white, fontWeight: FontWeight.bold)
                                .withEpilogue,
                          ),
                        ),
                      ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildPostHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(postModel.title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold).withTiempos),
          const SizedBox(height: 8),
          Text(MyDateFormat.getTimeAgo(postModel.createdAt),
              style: const TextStyle(color: Colors.grey, fontSize: 13).withEpilogue),
        ],
      ),
    );
  }

  Widget _buildActionBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        children: [
          // The Consumer is kept here to listen for real-time updates from other parts of the app.
          Consumer<LikedPostsProvider>(
            builder: (context, provider, _) {
              final isLiked = provider.likedPosts.getMap(isNewInstance: false)[postModel.id] ?? postModel.hasLiked;
              final likesCount = provider.likeCounts.getMap(isNewInstance: false)[postModel.id] ?? postModel.likeCount;
              return AnimatedHeartButton(
                isLiked: isLiked,
                likesCount: likesCount,
                onTap: _toggleLike,
                size: 24,
                likedColor: Colors.red,
                unlikedColor: Colors.grey,
                showCount: true,
                countTextStyle: const TextStyle(fontSize: 14, color: Colors.grey).withEpilogue,
              );
            },
          ),
          const SizedBox(width: 20),
          Row(
            children: [
              const Icon(CupertinoIcons.chat_bubble, size: 24, color: Colors.grey),
              const SizedBox(width: 6),
              Text("${postModel.commentCount}", style: const TextStyle(fontSize: 14, color: Colors.grey).withEpilogue),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCommentsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text("Comments", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: _buildCommentsList(),
        ),
      ],
    );
  }

  Widget _buildCommentsList() {
    return ChangeNotifierProvider.value(
      value: commentsPaginationModel,
      child: Consumer<APIDocumentsPaginatedListModel<CommentModel>>(
        builder: (context, paginationModel, child) {
          if (paginationModel.isContentsFirstTimeLoading.get()) {
            return const Center(child: LoadingWidget());
          }
          if (!paginationModel.isContentsLoading.get() && paginationModel.contentsLength == 0) {
            return const Center(child: Padding(padding: EdgeInsets.all(20.0), child: Text("Be the first to comment!")));
          }

          final allComments = paginationModel.contentsList.getList();
          List<CommentModel> parentComments =
              allComments.where((c) => c.parentCommentId == null || c.parentCommentId!.isEmpty).toList();
          Map<String, List<CommentModel>> repliesMap = {};
          for (var comment in allComments) {
            if (comment.parentCommentId != null && comment.parentCommentId!.isNotEmpty) {
              repliesMap.putIfAbsent(comment.parentCommentId!, () => []).add(comment);
            }
          }
          parentComments.sort((a, b) => b.createdAt.compareTo(a.createdAt));

          return ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: parentComments.length + (paginationModel.hasMoreContents.get() ? 1 : 0),
            itemBuilder: (context, index) {
              if (index >= parentComments.length) {
                // Show "Load More" button or a loading indicator
                return paginationModel.isContentsLoading.get()
                    ? const Center(child: Padding(padding: EdgeInsets.all(8.0), child: LoadingWidget()))
                    : TextButton(onPressed: () => getComments(isRefresh: false), child: const Text("Load More"));
              }
              final parent = parentComments[index];
              final replies = repliesMap[parent.id] ?? [];
              replies.sort((a, b) => a.createdAt.compareTo(b.createdAt));
              return _buildCommentTree(parent, replies);
            },
          );
        },
      ),
    );
  }

  // --- Post Content Widgets (Image, Video, Audio, Link) ---

  Widget _buildPostContent() {
    switch (postModel.type) {
      case "image":
        return _buildImageContent(postModel.mediaUrls, postModel.thumbnailUrl);
      case "video":
        // --- UPDATED ---
        return _buildVideoContent();
      case "audio":
        return _buildAudioContent();
      case "link":
        return _buildLinkContent();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildImageContent(List<String> mediaUrls, String thumbnailUrl) {
    if (mediaUrls.isEmpty && thumbnailUrl.isEmpty) return const SizedBox.shrink();
    final images = mediaUrls.isNotEmpty ? mediaUrls : [thumbnailUrl];

    if (images.length > 1) {
      return Column(
        children: [
          SizedBox(
            height: MediaQuery.of(context).size.width,
            width: double.infinity,
            child: PageView.builder(
              itemCount: images.length,
              onPageChanged: (index) => setState(() => _currentPage = index),
              itemBuilder: (context, index) => CommonCachedNetworkImage(imageUrl: images[index], fit: BoxFit.contain),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(images.length, (index) {
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
                height: 8,
                width: _currentPage == index ? 24 : 8,
                decoration: BoxDecoration(
                    color: _currentPage == index ? Theme.of(context).primaryColor : Colors.grey.shade400,
                    borderRadius: BorderRadius.circular(4)),
              );
            }),
          ),
        ],
      );
    }
    return Container(
      width: double.infinity,
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.6),
      child: CommonCachedNetworkImage(imageUrl: images.first, fit: BoxFit.contain),
    );
  }

  // --- +++ REPLACED VIDEO CONTENT WIDGET +++ ---
  Widget _buildVideoContent() {
    // This is the new root widget for video
    return AspectRatio(
      aspectRatio: _dynamicAspectRatio,
      child: _buildPlayerOrThumbnail(),
    );
  }

  // --- +++ NEW HELPER WIDGETS FOR VIDEO +++ ---
  Widget _buildPlayerOrThumbnail() {
    if (_isPlayerVisible) {
      if (_chewieController != null && _videoPlayer!.isInitialized) {
        return Chewie(
          controller: _chewieController!,
        );
      }
      return Container(
        color: Colors.black,
        child: const Center(
          child: CupertinoActivityIndicator(color: Colors.white),
        ),
      );
    } else {
      return _buildThumbnail();
    }
  }

  Widget _buildThumbnail() {
    final String? youtubeImageUrl = (postModel.videoProvider == 'youtube' && _youtubeVideoId != null)
        ? 'https://img.youtube.com/vi/$_youtubeVideoId/hqdefault.jpg'
        : null;

    return GestureDetector(
      onTap: _playVideo,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            color: Colors.black,
            width: double.infinity,
            height: double.infinity,
          ),
          if (youtubeImageUrl != null)
            CommonCachedNetworkImage(
              imageUrl: youtubeImageUrl,
              fit: BoxFit.cover,
              height: double.infinity,
              width: double.infinity,
            )
          else if (_customThumbnailPath != null)
            Image.file(
              File(_customThumbnailPath!),
              fit: BoxFit.cover,
              height: double.infinity,
              width: double.infinity,
              key: ValueKey(_customThumbnailPath),
            ),
          if (youtubeImageUrl != null || _customThumbnailPath != null)
            Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.4),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.play_arrow,
                color: Colors.white,
                size: 60,
              ),
            )
          else
            const Center(
              child: CupertinoActivityIndicator(color: Colors.white54),
            ),
        ],
      ),
    );
  }
  // --- +++ END NEW VIDEO WIDGETS +++ ---

  Widget _buildAudioContent() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(12)),
        child: Row(
          children: [
            IconButton(icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow, size: 32), onPressed: _playPauseAudio),
            Expanded(
              child: Column(
                children: [
                  Slider(
                    value: _position.inSeconds.toDouble().clamp(0.0, _duration.inSeconds.toDouble()),
                    min: 0,
                    max: _duration.inSeconds.toDouble(),
                    onChanged: (value) => _audioPlayer.seek(Duration(seconds: value.toInt())),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(_position.toString().split('.').first.substring(2)),
                        Text(_duration.toString().split('.').first.substring(2)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLinkContent() {
    final url = postModel.linkUrl;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8).copyWith(bottom: 0),
          child: LinkPreviewDisplay(linkUrl: url),
        ),
        Padding(
          padding: const EdgeInsets.all(14.0).copyWith(top: 0),
          child: InkWell(
            onTap: () async => await launchUrl(Uri.parse(url)),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.link, color: Colors.grey),
                  const SizedBox(width: 12),
                  Expanded(child: Text(url, maxLines: 1, overflow: TextOverflow.ellipsis)),
                  const SizedBox(width: 12),
                  Icon(Icons.open_in_new, color: Theme.of(context).primaryColor),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // --- Comment Widgets and Helpers (Unchanged) ---

  bool _isLoadingCommentLike(String commentId) => _inFlight[commentId] == true;

  Widget _buildCommentTree(CommentModel parent, List<CommentModel> replies) {
    return Column(
      children: [
        _buildSingleComment(parent, isParent: true),
        if (replies.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(left: 40.0),
            child: Column(
              children: replies.map((reply) => _buildSingleComment(reply, isParent: false)).toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildSingleComment(CommentModel comment, {required bool isParent}) {
    // This widget's implementation remains the same, but it's now cleaner
    // as it doesn't need to pass around postModel.
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CommonCachedNetworkImage(imageUrl: comment.profilePicture, borderRadius: 20, height: 40, width: 40),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(15)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(comment.displayName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      const SizedBox(height: 4),
                      Text(comment.text, style: const TextStyle(fontSize: 14)),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(MyDateFormat.getTimeAgo(comment.createdAt), style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    const SizedBox(width: 12),
                    InkWell(
                      onTap: () => _onTapCommentLike(comment),
                      child: _isLoadingCommentLike(comment.id)
                          ? const SizedBox(width: 18, height: 18, child: LoadingWidget(loaderSize: 18, boxSize: 18))
                          : Text(
                              "Like",
                              style: TextStyle(
                                color: comment.isLiked ? Theme.of(context).primaryColor : Colors.grey,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                    ),
                    const SizedBox(width: 12),
                    if (isParent)
                      GestureDetector(
                        onTap: () => _setReplyingTo(comment.id, comment.displayName),
                        child: const Text(
                          "Reply",
                          style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                    const Spacer(),
                    if (comment.likesCount > 0)
                      Row(
                        children: [
                          Icon(
                            comment.isLiked ? CupertinoIcons.heart_fill : CupertinoIcons.heart,
                            size: 14,
                            color: comment.isLiked ? Colors.red.shade300 : Colors.grey,
                          ),
                          const SizedBox(width: 4),
                          Text("${comment.likesCount}", style: const TextStyle(color: Colors.grey, fontSize: 12)),
                        ],
                      ),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCommentInput(UserModel userModel) {
    return Container(
      padding: EdgeInsets.fromLTRB(16.0, 8.0, 16.0, 8.0 + MediaQuery.of(context).padding.bottom),
      decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 10, offset: const Offset(0, -5))]),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_replyingToCommentId != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(12)),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text("Replying to $_replyingToUsername", style: const TextStyle(fontSize: 12, color: Colors.black54)),
                  const SizedBox(width: 8),
                  InkWell(onTap: _cancelReply, child: const Icon(Icons.close, size: 16, color: Colors.black54)),
                ],
              ),
            ),
          Row(
            children: [
              CommonCachedNetworkImage(imageUrl: userModel.profilePicture, borderRadius: 20, height: 40, width: 40),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _commentController,
                  focusNode: _commentFocusNode,
                  enabled: !isPostingComment,
                  decoration: InputDecoration(
                    hintText: "Add a comment...",
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(25.0), borderSide: BorderSide.none),
                    filled: true,
                    fillColor: Colors.grey.shade100,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
                  ),
                  minLines: 1,
                  maxLines: 4,
                ),
              ),
              const SizedBox(width: 8.0),
              InkWell(
                onTap: isPostingComment ? null : _submitComment,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(shape: BoxShape.circle, color: Theme.of(context).primaryColor),
                  child: isPostingComment
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child:
                              CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)))
                      : const Icon(Icons.send, color: Colors.white, size: 18),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // --- Attachment Widgets and Helpers (Unchanged) ---
  Widget _buildAttachmentsSection() {
    if (postModel.attachments.isEmpty) {
      return const SizedBox.shrink();
    }
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Attachments", style: const TextStyle(fontSize: 12, fontWeight: FontWeight.normal).withEpilogue),
          const SizedBox(height: 12),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: postModel.attachments.length,
            separatorBuilder: (context, index) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final attachment = postModel.attachments[index];
              return _buildAttachmentItem(attachment);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAttachmentItem(AttachmentModel attachment) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Icon(_getIconForFileType(attachment.fileType), color: Colors.grey.shade600, size: 32),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(attachment.fileName,
                    maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                Text(
                  '${attachment.fileType.split('/').last.toUpperCase()} - ${_formatFileSize(attachment.fileSize)}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
          PopupMenuButton<String>(
            icon: Icon(Icons.more_horiz, color: Colors.grey.shade600),
            onSelected: (value) async {
              final uri = Uri.parse(attachment.url);
              if (await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.inAppBrowserView);
              }
            },
            itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
              const PopupMenuItem<String>(value: 'download', child: Text('Download')),
            ],
          ),
        ],
      ),
    );
  }

  String _formatFileSize(int bytes, [int decimals = 2]) {
    if (bytes <= 0) return "0 B";
    const suffixes = ["B", "KB", "MB", "GB", "TB"];
    var i = (log_math.log(bytes) / log_math.log(1024)).floor();
    return '${(bytes / log_math.pow(1024, i)).toStringAsFixed(decimals)} ${suffixes[i]}';
  }

  IconData _getIconForFileType(String fileType) {
    if (fileType.startsWith('image')) return Icons.image_outlined;
    if (fileType.contains('pdf')) return FontAwesomeIcons.filePdf;
    if (fileType.contains('audio')) return Icons.audio_file_outlined;
    if (fileType.contains('video')) return Icons.video_file_outlined;
    if (fileType.contains('zip') || fileType.contains('archive')) return Icons.archive_outlined;
    return Icons.insert_drive_file_outlined;
  }
}

// --- Share Dialog (Unchanged) ---

void _sharePost(BuildContext context, String postId) {
  final shareText = 'Check out this post on Patreon Clone: https://patreon-clone.example.com/post/$postId';

  showDialog(
    context: context,
    builder: (context) => Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Share Post', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            Wrap(
              spacing: 24,
              runSpacing: 24,
              alignment: WrapAlignment.center,
              children: [
                _buildExternalAppButton(
                  context: context,
                  icon: FontAwesomeIcons.xTwitter,
                  label: 'Twitter',
                  shareUrl: 'https://twitter.com/intent/tweet?text=${Uri.encodeComponent(shareText)}',
                  notInstalledMessage: 'Twitter is not installed.',
                ),
                _buildExternalAppButton(
                  context: context,
                  icon: FontAwesomeIcons.facebookF,
                  label: 'Facebook',
                  shareUrl:
                      'https://www.facebook.com/sharer/sharer.php?u=${Uri.encodeComponent("https://patreon-clone.example.com/post/$postId")}',
                  notInstalledMessage: 'Facebook is not installed.',
                ),
                _buildExternalAppButton(
                  context: context,
                  icon: FontAwesomeIcons.whatsapp,
                  label: 'WhatsApp',
                  shareUrl: 'whatsapp://send?text=${Uri.encodeComponent(shareText)}',
                  notInstalledMessage: 'WhatsApp is not installed.',
                ),
                _buildShareButton(
                  icon: Icons.link,
                  label: 'Copy Link',
                  onTap: () async {
                    Navigator.pop(context);
                    await Clipboard.setData(ClipboardData(text: shareText));
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Link copied to clipboard!')));
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  );
}

Widget _buildExternalAppButton(
    {required BuildContext context,
    required IconData icon,
    required String label,
    required String shareUrl,
    required String notInstalledMessage}) {
  return _buildShareButton(
    icon: icon,
    label: label,
    onTap: () async {
      Navigator.pop(context);
      final Uri url = Uri.parse(shareUrl);
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(notInstalledMessage)));
      }
    },
  );
}

Widget _buildShareButton({required IconData icon, required String label, required VoidCallback onTap}) {
  return InkWell(
    onTap: onTap,
    borderRadius: BorderRadius.circular(12),
    child: SizedBox(
      width: 70,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 36, color: Colors.black87),
          const SizedBox(height: 10),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    ),
  );
}
