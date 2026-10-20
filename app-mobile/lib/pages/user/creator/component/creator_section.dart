import 'package:flutter/material.dart';
// import 'package:patreon_clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon_clone/navigation/navigation_type.dart';
import 'package:patreon_clone/models/creator/creator_model.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';

import 'package:patreon_clone/styles/font_manager.dart';

import 'package:go_router/go_router.dart';
import 'package:patreon_clone/navigation/app_router.dart';
import 'creator_card.dart';

class CreatorSection extends StatefulWidget {
  final String title;
  final List<CreatorModel> creators;

  const CreatorSection({
    super.key,
    required this.title,
    required this.creators,
  });

  @override
  State<CreatorSection> createState() => _CreatorSectionState();
}

class _CreatorSectionState extends State<CreatorSection> with MySafeState {
  final ScrollController _scrollController = ScrollController();

  void _scrollLeft() {
    _scrollController.animateTo(
      _scrollController.offset - 300,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void _scrollRight() {
    _scrollController.animateTo(
      _scrollController.offset + 300,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              InkWell(
                onTap: () {
                  context.pushNamed(
                    Routes.creatorListing,
                    extra: {
                      'category': widget.title,
                      'creators': widget.creators,
                    },
                  );
                },
                child: Row(
                  children: [
                    Text(
                      widget.title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ).withTiempos,
                    ),
                    const SizedBox(width: 4),
                    Icon(
                      Icons.arrow_forward_ios,
                      size: 12,
                      color: themeData.colorScheme.onSurface,
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  IconButton(
                    padding: EdgeInsets.zero,
                    onPressed: _scrollLeft,
                    icon: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: themeData.primaryColor,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            spreadRadius: 1,
                            blurRadius: 3,
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.arrow_back_ios,
                        size: 14,
                        color: themeData.colorScheme.onPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    padding: EdgeInsets.zero,
                    onPressed: _scrollRight,
                    icon: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: themeData.primaryColor,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            spreadRadius: 1,
                            blurRadius: 3,
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.arrow_forward_ios,
                        size: 14,
                        color: themeData.colorScheme.onPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 210,
          child: ListView.builder(
            controller: _scrollController,
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: widget.creators.length,
            itemBuilder: (context, index) {
              final creator = widget.creators[index];
              return Padding(
                padding: const EdgeInsets.only(right: 16),
                child: CreatorCard(creator: creator),
              );
            },
          ),
        ),
      ],
    );
  }
}
