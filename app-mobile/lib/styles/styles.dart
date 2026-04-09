// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:patreon-clone/config/index.dart';

class Styles {
  static final Styles _instance = Styles._();

  Styles._();

  factory Styles() => _instance;

  static const Color blue50 = Color(0xFFEBF5FF);
  static const Color blue100 = Color(0xFFBADBFB);
  static const Color blue200 = Color(0xFF81BEF7);
  static const Color blue300 = Color(0xFF59AEFE);
  static const Color blue400 = Color(0xFF3FA0FB);
  static const Color blue500 = Color(0xFF2B85D9);
  static const Color blue600 = Color(0xFF1D70BF);
  static const Color blue700 = Color(0xFF1962A5);
  static const Color blue800 = Color(0xFF134B80);
  static const Color blue900 = Color(0xFF0D3459);

  /// Primary color for light theme — derived from AppConfig.
  Color lightPrimaryColor = AppConfig.primaryColor;
  Color darkPrimaryColor = blue500;

  Color lightPrimaryVariant = blue400;
  Color darkPrimaryVariant = blue700;

  Color lightSecondaryColor = blue300;
  Color darkSecondaryColor = blue600;

  Color lightSecondaryVariant = blue200;
  Color darkSecondaryVariant = blue800;

  Color darkTertiaryColor = blue400;
  Color darkTertiaryContainerColor = blue700;

  Color lightAppBarTextColor = const Color(0xFF000000); // dark text
  Color darkAppBarTextColor = const Color(0xFFFFFFFF); // light text

  Color lightTextColor = const Color(0xFF000000); // black text
  Color darkTextColor = const Color(0xFFFFFFFF); // white text

  Color lightBackgroundColor = scaffoldBackground; // light base


  Color lightBackgroundColor2 = Colors.white; // light base
  Color darkBackgroundColor = const Color(0xFF121212); // dark base

  Color lightAppBarColor = scaffoldBackground;

// Scaffold background color
  static const Color scaffoldBackground = AppConfig.scaffoldBackground;

  static Color scaffoldBackground2 = const Color(0xffFBFBF9);
  double buttonBorderRadius = 5;
}
