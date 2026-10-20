import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:patreon_clone/pages/user/post/components/html_viewer.dart';
import 'package:patreon_clone/pages/user/post/components/like_share.dart';
import 'package:patreon_clone/pages/user/post/components/post_tags.dart';
import 'package:patreon_clone/pages/user/home/components/username_widget.dart';
// For clamping

// Import the new packages
import 'package:cached_video_player_plus/cached_video_player_plus.dart';
import 'package:chewie/chewie.dart';
import 'package:youtube_explode_dart/youtube_explode_dart.dart';

// --- Imports for Custom Thumbnail ---
import 'package:video_thumbnail/video_thumbnail.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io'; // For File

// --- Imports for Caching Fix ---
import 'package:crypto/crypto.dart';
import 'dart:convert'; // For utf8

class VideoPostCard extends StatefulWidget {
  final PostModel post;
  final bool isShowUsername;
  final dynamic controller;
  const VideoPostCard({
    super.key,
    required this.post,
    this.isShowUsername = true,
    this.controller,
  });
  @override
  State<VideoPostCard> createState() => _VideoPostCardState();
}

class _VideoPostCardState extends State<VideoPostCard> with MySafeState {
  CachedVideoPlayerPlus? _videoPlayer;
  ChewieController? _chewieController;
  bool _isPlayerVisible = false;

  double _dynamicAspectRatio = 16 / 9;

  String? _youtubeVideoId;
  String? _customThumbnailPath;

  bool _isFetchingYouTubeUrl = false;

  // static const double _minAspectRatio = 3 / 4; // 0.75
  // static const double _maxAspectRatio = 16 / 9; // ~1.777

  @override
  void initState() {
    super.initState();
    if (widget.post.videoProvider == 'youtube' && widget.post.videoUrl.isNotEmpty) {
      try {
        // *** FIX: Corrected YouTube ID parsing ***
        _youtubeVideoId = VideoId.parseVideoId(widget.post.videoUrl);
      } catch (e) {
        debugPrint('Could not parse YouTube video ID: $e');
        _youtubeVideoId = null;
      }
    } else if (widget.post.videoProvider == 'upload' && widget.post.videoUrl.isNotEmpty) {
      // *** This now checks for the cached file ***
      _generateCustomThumbnail();
    }
  }

  // --- *** UPDATED METHOD WITH CACHING *** ---
  Future<void> _generateCustomThumbnail() async {
    if (!mounted) return;
    try {
      // 1. Create a stable, unique filename from the video URL
      // This ensures we get the same filename for the same video every time
      final bytes = utf8.encode(widget.post.videoUrl);
      final digest = sha1.convert(bytes);
      final fileName = '$digest.jpg';

      final tempDir = await getTemporaryDirectory();
      final thumbnailPath = '${tempDir.path}/$fileName';

      final thumbnailFile = File(thumbnailPath);

      // 2. Check if the file already exists in our "cache"
      if (await thumbnailFile.exists()) {
        // It exists! Just use the path. This is now synchronous.
        if (mounted) {
          setState(() {
            _customThumbnailPath = thumbnailPath;
          });
        }
      } else {
        // 3. It doesn't exist. Generate it and save it *at that specific path*.
        final path = await VideoThumbnail.thumbnailFile(
          video: widget.post.videoUrl,
          thumbnailPath: thumbnailPath, // Pass the full, specific path
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
      debugPrint('Error generating/caching thumbnail for ${widget.post.videoUrl}: $e');
    }
  }

  @override
  void deactivate() {
    _videoPlayer?.controller.pause();
    super.deactivate();
  }

  @override
  void dispose() {
    _videoPlayer?.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  void _playVideo() async {
    if (_isPlayerVisible || _isFetchingYouTubeUrl) return;

    setState(() {
      _isPlayerVisible = true;
      _isFetchingYouTubeUrl = widget.post.videoProvider == 'youtube';
    });

    try {
      String videoUrlToPlay;

      if (widget.post.videoProvider == 'youtube') {
        final yt = YoutubeExplode();
        final manifest = await yt.videos.streamsClient.getManifest(widget.post.videoUrl);
        final streamInfo = manifest.muxed.withHighestBitrate();
        videoUrlToPlay = streamInfo.url.toString();
        yt.close();
      } else {
        videoUrlToPlay = widget.post.videoUrl;
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

      _dynamicAspectRatio = _videoPlayer!.controller.value.aspectRatio;
      _chewieController = ChewieController(
        videoPlayerController: _videoPlayer!.controller,
        aspectRatio: _dynamicAspectRatio,
        autoPlay: true,
        looping: false,
        allowFullScreen: false,
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
      debugPrint('Error initializing video player: $e');
      if (mounted) {
        setState(() {
          _isPlayerVisible = false;
          _isFetchingYouTubeUrl = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.isShowUsername) ...[
          UsernameWidget(post: widget.post),
        ],
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (widget.post.title.isNotEmpty)
                Text(
                  widget.post.title,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold).withTiempos,
                ),
            ],
          ),
        ),
        AspectRatio(
          aspectRatio: _dynamicAspectRatio,
          child: _buildPlayerOrThumbnail(),
        ),
        MyHTMLViewer(post: widget.post),
        PostTagsWidget(post: widget.post),
        MyLikeCommentShareWidget(post: widget.post),
      ],
    );
  }

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
    final String? youtubeImageUrl = (widget.post.videoProvider == 'youtube' && _youtubeVideoId != null)
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
            // This now loads from the "cached" file path instantly
            Image.file(
              File(_customThumbnailPath!),
              fit: BoxFit.cover,
              height: double.infinity,
              width: double.infinity,
              // Add a key to help Flutter's element tree
              key: ValueKey(_customThumbnailPath),
            ),

          // Only show play button if one of the thumbnails is ready
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
            // Show a loading indicator if no thumbnail is ready yet
            const Center(
              child: CupertinoActivityIndicator(color: Colors.white54),
            ),
        ],
      ),
    );
  }
}
