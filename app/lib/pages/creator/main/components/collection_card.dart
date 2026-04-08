import 'package:flutter/material.dart';
import 'package:patreon-clone/models/collection/collection_data_model.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';

class CollectionCard extends StatelessWidget {
  final CollectionModel collection;

  const CollectionCard({super.key, required this.collection});

  @override
  Widget build(BuildContext context) {
    final themeData = Theme.of(context);
    return InkWell(
      onTap: () {
        context.pushNamed(
          Routes.collectionPosts,
          extra: {
            'collectionId': collection.id,
            'collection': collection,
          },
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (collection.coverImage.isNotEmpty)
              ClipRRect(
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  bottomLeft: Radius.circular(12),
                ),
                child: CommonCachedNetworkImage(
                  imageUrl: collection.coverImage,
                  height: 80,
                  width: 80,
                  fit: BoxFit.cover,
                ),
              )
            else
              Container(
                height: 80,
                width: 80,
                decoration: const BoxDecoration(
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(12),
                    bottomLeft: Radius.circular(12),
                  ),
                  color: Color(0xFFF1EEE7),
                ),
                child: const Icon(Icons.collections, size: 32, color: Colors.black54),
              ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      collection.title,
                      style: themeData.textTheme.labelLarge
                          ?.copyWith(
                            fontWeight: FontWeight.bold,
                          )
                          .withEpilogue,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (collection.description.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 4.0),
                        child: Text(
                          collection.description,
                          style: themeData.textTheme.bodySmall
                              ?.copyWith(
                                color: Colors.grey.shade600,
                              )
                              .withEpilogue,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    Padding(
                      padding: const EdgeInsets.only(top: 4.0),
                      child: Text(
                        '${collection.postCount} Posts',
                        style: themeData.textTheme.bodySmall
                            ?.copyWith(
                              color: Colors.grey.shade600,
                            )
                            .withEpilogue,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
