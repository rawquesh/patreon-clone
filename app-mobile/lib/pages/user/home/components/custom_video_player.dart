import 'package:flutter/material.dart';
import 'package:patreon_clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:video_player/video_player.dart';

class CustomVideoPlayer extends StatefulWidget {
  final VideoPlayerController controller;

  const CustomVideoPlayer({
    super.key,
    required this.controller,
  });

  @override
  State<CustomVideoPlayer> createState() => CustomVideoPlayerState();
}

class CustomVideoPlayerState extends State<CustomVideoPlayer> {
  bool _showControls = true;
  bool _isProcessingInput = false;

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(() {
      setState(() {});
    });
  }

  Future<void> _togglePlayPause() async {
    if (_isProcessingInput) return;
    setState(() {
      _isProcessingInput = true;
    });
    try {
      if (widget.controller.value.isPlaying) {
        await widget.controller.pause();
      } else {
        await widget.controller.play();
      }
    } finally {
      if (mounted) {
        setState(() {
          _isProcessingInput = false;
        });
      }
    }
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = twoDigits(duration.inHours);
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));

    if (duration.inHours > 0) {
      return '$hours:$minutes:$seconds';
    }
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    return ModalProgressHUD(
      inAsyncCall: _isProcessingInput,
      child: GestureDetector(
        onTap: () {
          setState(() {
            _showControls = !_showControls;
          });
        },
        child: Stack(
          alignment: Alignment.center,
          children: [
            // --- VIDEO PLAYER ---
            Center(
              child: AspectRatio(
                aspectRatio: widget.controller.value.aspectRatio,
                child: VideoPlayer(widget.controller),
              ),
            ),

            // --- CONTROLS OVERLAY ---
            if (_showControls)
              Container(
                color: Colors.black.withOpacity(0.3),
                child: Stack(
                  children: [
                    // --- CENTER PLAY / PAUSE BUTTON ---
                    Center(
                      child: IconButton(
                        icon: Icon(
                          widget.controller.value.isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                          size: 64,
                          color: Colors.white,
                        ),
                        onPressed: _togglePlayPause,
                      ),
                    ),

                    // --- BOTTOM SEEKBAR + TIME ---
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 0,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        child: Row(
                          children: [
                            Text(
                              _formatDuration(widget.controller.value.position),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                              ),
                            ),
                            Expanded(
                              child: Slider(
                                value: widget.controller.value.position.inSeconds.toDouble(),
                                max: widget.controller.value.duration.inSeconds.toDouble(),
                                activeColor: Colors.red,
                                inactiveColor: Colors.white30,
                                onChanged: (value) {
                                  widget.controller.seekTo(
                                    Duration(seconds: value.toInt()),
                                  );
                                },
                              ),
                            ),
                            Text(
                              _formatDuration(widget.controller.value.duration),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            if (_isProcessingInput)
              Container(
                color: Colors.black.withOpacity(0.35),
                alignment: Alignment.center,
                child: const SizedBox(
                  width: 36,
                  height: 36,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
