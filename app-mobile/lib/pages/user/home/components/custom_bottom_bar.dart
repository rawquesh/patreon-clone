import 'package:flutter/material.dart';
import 'package:flashy_tab_bar2/flashy_tab_bar2.dart';
import 'package:patreon-clone/config/index.dart';

class HomePageTabs {
  static const int home = 0;
  static const int explore = 1;
  static const int community = 2;
  static const int notification = 3;
  static const int profile = 4;
}

class FlashyTabBarExample extends StatefulWidget {
  const FlashyTabBarExample({super.key});

  @override
  State<FlashyTabBarExample> createState() => _FlashyTabBarExampleState();
}

class _FlashyTabBarExampleState extends State<FlashyTabBarExample> {
  int selectedIndex = 0;

  final List<Widget> tabItems = [
    const Center(child: Text('Home')),
    const Center(child: Text('Explore')),
    const Center(child: Text(AppConfig.communityTabLabel)),
    const Center(child: Text('Notifications')),
    const Center(child: Text('Profile')),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: tabItems[selectedIndex],
      bottomNavigationBar: FlashyTabBar(
        selectedIndex: selectedIndex,
        showElevation: true,
        onItemSelected: (index) => setState(() => selectedIndex = index),
        items: [
          FlashyTabBarItem(
            icon: const Icon(Icons.home),
            title: const Text('Home'),
          ),
          FlashyTabBarItem(
            icon: const Icon(Icons.explore),
            title: const Text('Explore'),
          ),
          FlashyTabBarItem(
            icon: const Icon(Icons.group),
            title: const Text(AppConfig.communityTabLabel),
          ),
          FlashyTabBarItem(
            icon: const Icon(Icons.notifications),
            title: const Text('Notifications'),
          ),
          FlashyTabBarItem(
            icon: const Icon(Icons.person),
            title: const Text('Profile'),
          ),
        ],
      ),
    );
  }
}