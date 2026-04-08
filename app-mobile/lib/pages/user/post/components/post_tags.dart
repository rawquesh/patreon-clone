import 'package:flutter/material.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/styles/font_manager.dart';

class PostTagsWidget extends StatelessWidget {
  final PostModel post;

  const PostTagsWidget({super.key, required this.post});

  @override
  Widget build(BuildContext context) {
    if (post.tags.isNotEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children: post.tags.map((tag) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                "#$tag",
                style: TextStyle(
                  color: Colors.grey[700],
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                ).withEpilogue,
              ),
            );
          }).toList(),
        ),
      );
    }
    return SizedBox.fromSize();
  }
}
