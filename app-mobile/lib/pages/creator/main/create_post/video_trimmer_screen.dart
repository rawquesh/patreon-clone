import 'dart:io';
import 'package:flutter/material.dart';
import 'package:video_trimmer/video_trimmer.dart';

class VideoTrimmerScreen extends StatefulWidget {
  final File videoFile;
  final void Function(File) onTrimmed;

  const VideoTrimmerScreen({
    super.key,
    required this.videoFile,
    required this.onTrimmed,
  });

  @override
  State<VideoTrimmerScreen> createState() => _VideoTrimmerScreenState();
}

class _VideoTrimmerScreenState extends State<VideoTrimmerScreen> {
  final Trimmer _trimmer = Trimmer();
  double _startValue = 0.0;
  double _endValue = 0.0;
  bool _isPlaying = false;
  bool _progressVisibility = false;

  @override
  void initState() {
    super.initState();
    _loadVideo();
  }

  Future<void> _loadVideo() async {
    await _trimmer.loadVideo(videoFile: widget.videoFile);
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _trimmer.dispose();
    super.dispose();
  }

  Future<void> _saveVideo() async {
    setState(() => _progressVisibility = true);

    await _trimmer.saveTrimmedVideo(
      startValue: _startValue,
      endValue: _endValue,
      // Optional but recommended parameters (adjust as needed)
      storageDir: StorageDir.temporaryDirectory, // or StorageDir.cacheDirectory
      // fps: 30, // uncomment if you want to set a specific FPS
      // videoFolderName: "trimmed_videos", // optional folder name
      onSave: (String? outputPath) {
        if (!mounted) return;
        setState(() => _progressVisibility = false);

        if (outputPath != null) {
          widget.onTrimmed(File(outputPath));
          Navigator.of(context).pop();
        } else {
          // Optional: show error if trimming failed
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Trimming failed')),
          );
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          TextButton(
            onPressed: _progressVisibility ? null : _saveVideo,
            child: const Text(
              'Trim',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_progressVisibility) const LinearProgressIndicator(backgroundColor: Colors.white),
          Expanded(child: VideoViewer(trimmer: _trimmer)),
          TrimViewer(
            trimmer: _trimmer,
            viewerHeight: 60,
            viewerWidth: MediaQuery.of(context).size.width,
            onChangeStart: (v) => setState(() => _startValue = v),
            onChangeEnd: (v) => setState(() => _endValue = v),
            onChangePlaybackState: (v) => setState(() => _isPlaying = v),
          ),
          Center(
            child: IconButton(
              iconSize: 80,
              icon: Icon(
                _isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                color: Colors.white,
              ),
              onPressed: () async {
                final playback = await _trimmer.videoPlaybackControl(
                  startValue: _startValue,
                  endValue: _endValue,
                );
                if (mounted) setState(() => _isPlaying = playback);
              },
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}
