import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:patreon-clone/styles/styles.dart';
import 'package:patreon-clone/styles/font_manager.dart';

import 'create_audio_post_screen.dart';
import 'create_image_post_screen.dart';
import 'create_link_post_screen.dart';
import 'create_text_post_screen.dart';
import 'create_video_post_screen.dart';

class CreatePostMainScreen extends StatefulWidget {
  static const String routeName = '/CreatePostMainScreen';

  const CreatePostMainScreen({super.key});

  @override
  State<CreatePostMainScreen> createState() => _CreatePostMainScreenState();
}

class _CreatePostMainScreenState extends State<CreatePostMainScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Tab> _tabs = [
    Tab(
      icon: const Icon(CupertinoIcons.textbox, size: 22),
      child: Text('Text', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500).withEpilogue),
    ),
    Tab(
      icon: const Icon(CupertinoIcons.photo_on_rectangle, size: 22),
      child: Text('Image', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500).withEpilogue),
    ),
    Tab(
      icon: const Icon(CupertinoIcons.videocam, size: 22),
      child: Text('Video', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500).withEpilogue),
    ),
    Tab(
      icon: const Icon(CupertinoIcons.mic_circle, size: 22),
      child: Text('Audio', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500).withEpilogue),
    ),
    Tab(
      icon: const Icon(CupertinoIcons.link, size: 22),
      child: Text('Link', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500).withEpilogue),
    ),
  ];

  final List<Widget> _tabViews = [
    const CreateTextPostScreen(isTabbedView: true),
    const CreateImagePostScreen(isTabbedView: true),
    const CreateVideoPostScreen(isTabbedView: true),
    const CreateAudioPostScreen(isTabbedView: true),
    const CreateLinkPostScreen(isTabbedView: true),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeData = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Create a New Post',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: themeData.colorScheme.onSurface,
            letterSpacing: -0.5,
          ).withTiempos,
        ),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, size: 22),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Container(
            color: Styles.scaffoldBackground,
            alignment: Alignment.centerLeft,
            child: TabBar(
              controller: _tabController,
              isScrollable: false,
              indicatorColor: themeData.primaryColor,
              indicatorWeight: 0.1,
              dividerColor: Colors.transparent,
              labelColor: themeData.primaryColor,
              unselectedLabelColor: Colors.black54,
              labelPadding: const EdgeInsets.symmetric(horizontal: 8),
              tabs: _tabs,
              overlayColor: WidgetStateProperty.all(Colors.transparent),
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: _tabViews,
            ),
          ),
        ],
      ),
    );
  }
}
