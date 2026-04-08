import 'package:flutter/material.dart';

class TabState extends ChangeNotifier {
  int _currentIndex = 0;
  int _messagingTabIndex = 0;

  int get currentIndex => _currentIndex;
  int get messagingTabIndex => _messagingTabIndex;

  void setTab(int index, {int messagingTabIndex = 0}) {
    _currentIndex = index;
    _messagingTabIndex = messagingTabIndex;
    notifyListeners();
  }
}