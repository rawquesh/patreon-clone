import 'package:flutter/material.dart';

BoxDecoration postBoxDecoration() {
  return BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    boxShadow: [
      BoxShadow(
        // ignore: deprecated_member_use
        color: Colors.grey.withOpacity(0.1),
        spreadRadius: 1,
        blurRadius: 5,
        offset: const Offset(0, 2),
      ), 
    ],
  );
}
