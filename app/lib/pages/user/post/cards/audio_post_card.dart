import 'package:audio_session/audio_session.dart';
import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/user/post/components/html_viewer.dart';
import 'package:patreon-clone/pages/user/post/components/like_share.dart';
import 'package:patreon-clone/pages/user/post/components/post_tags.dart';
import 'package:patreon-clone/pages/user/home/components/username_widget.dart';

class AudioPostCard extends StatefulWidget {
  final PostModel post;
  final bool isShowUsername;

  const AudioPostCard({
    super.key,
    required this.post,
    this.isShowUsername = true,
  });

  @override
  State<AudioPostCard> createState() => _AudioPostCardState();
}

class _AudioPostCardState extends State<AudioPostCard> with MySafeState {
  final AudioPlayer _audioPlayer = AudioPlayer();
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;
  bool _isPlaying = false;
  bool _isAudioInitialized = false;
  bool _isAudioLoading = false;

  @override
  void initState() {
    super.initState();
    _setupAudioPlayerListeners();
    _initAudioSession();
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _initAudioSession() async {
    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration.music());
  }

  void _setupAudioPlayerListeners() {
    _audioPlayer.durationStream.listen((d) {
      if (d != null && mounted) {
        setState(() => _duration = d);
      }
    });

    _audioPlayer.positionStream.listen((p) {
      if (mounted) {
        setState(() => _position = p);
      }
    });

    _audioPlayer.playerStateStream.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state.playing;
          if (state.processingState == ProcessingState.completed) {
            _audioPlayer.seek(Duration.zero);
            _audioPlayer.pause();
          }
        });
      }
    });
  }

  Future<void> _prepareAudio() async {
    if (widget.post.mediaUrls.isNotEmpty) {
      try {
        await _audioPlayer.setUrl(widget.post.mediaUrls.first);
      } catch (e) {
        MyPrint.printOnConsole('Error loading audio: $e');
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Error loading audio')),
          );
        }
      }
    }
  }

  Future<void> _togglePlayPause() async {
    if (_isPlaying) {
      await _audioPlayer.pause();
    } else {
      if (!_isAudioInitialized) {
        setState(() {
          _isAudioLoading = true;
        });
        await _prepareAudio();
        if (mounted) {
          setState(() {
            _isAudioInitialized = true;
            _isAudioLoading = false;
          });
        }
      }
      await _audioPlayer.play();
    }
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final totalSecs = _duration.inSeconds;
    final posSecs = _position.inSeconds.clamp(0, totalSecs > 0 ? totalSecs : 0);
    final themeData = Theme.of(context);

    super.pageBuild();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.isShowUsername) ...[
          UsernameWidget(post: widget.post),
        ],
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          child: (widget.post.title.isNotEmpty)
              ? Text(
                  widget.post.title,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold).withTiempos,
                )
              : const SizedBox.shrink(),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CommonCachedNetworkImage(
                imageUrl: widget.post.thumbnailUrl,
                height: 80,
                width: 80,
                borderRadius: 8,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SliderTheme(
                      data: const SliderThemeData(
                        trackHeight: 5,
                        thumbShape: RoundSliderThumbShape(enabledThumbRadius: 6),
                      ),
                      child: Slider(
                        value: (totalSecs > 0 ? posSecs : 0).toDouble(),
                        min: 0,
                        max: (totalSecs > 0 ? totalSecs : 1).toDouble(),
                        onChanged: (value) async {
                          final clamped = value.toInt().clamp(0, totalSecs > 0 ? totalSecs : 0);
                          await _audioPlayer.seek(Duration(seconds: clamped));
                        },
                        activeColor: themeData.primaryColor,
                        inactiveColor: Colors.grey[300],
                      ),
                    ),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _formatDuration(_position),
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ).withEpilogue,
                        ),
                        Text(
                          _formatDuration(_duration),
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ).withEpilogue,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: _isAudioLoading ? null : _togglePlayPause,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: themeData.primaryColor,
                    shape: BoxShape.circle,
                  ),
                  child: _isAudioLoading
                      ? const Padding(
                          padding: EdgeInsets.all(10.0),
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Icon(
                          _isPlaying ? Icons.pause : Icons.play_arrow,
                          color: Colors.white,
                        ),
                ),
              ),
            ],
          ),
        ),
        MyHTMLViewer(post: widget.post),
        PostTagsWidget(post: widget.post),
        MyLikeCommentShareWidget(post: widget.post),
      ],
    );
  }
}
