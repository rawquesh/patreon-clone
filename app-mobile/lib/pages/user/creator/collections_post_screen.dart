import 'package:flutter/material.dart';
// import 'package:patreon_clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon_clone/navigation/navigation_type.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/models/collection/collection_data_model.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon_clone/pages/user/post/components/decoration.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import 'package:patreon_clone/backend/collections/collection_controller.dart';
import 'package:patreon_clone/backend/collections/collection_provider.dart';
import 'package:patreon_clone/navigation/app_router.dart';

import 'package:patreon_clone/pages/user/post/cards/audio_post_card.dart';
import 'package:patreon_clone/pages/user/post/cards/image_post_card.dart';
import 'package:patreon_clone/pages/user/post/cards/link_post_card.dart';
import 'package:patreon_clone/pages/user/post/cards/text_post_card.dart';
import 'package:patreon_clone/pages/user/post/cards/video_post_card.dart';

class CollectionPostsScreen extends StatefulWidget {
  static const String routeName = "/CollectionPostsScreen";
  final String? collectionId;
  final CollectionModel? collection;

  const CollectionPostsScreen({
    super.key,
    this.collectionId,
    this.collection,
  });

  @override
  State<CollectionPostsScreen> createState() => _CollectionPostsScreenState();
}

class _CollectionPostsScreenState extends State<CollectionPostsScreen> with MySafeState {
  late CollectionProvider _collectionProvider;
  late CollectionController _collectionController;

  @override
  void initState() {
    super.initState();
    _collectionProvider = context.read<CollectionProvider>();
    _collectionController = CollectionController(provider: _collectionProvider);
    if ((widget.collection?.id ?? "").isNotEmpty) {
      _collectionController.getCollectionById(widget.collection!.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.collection?.title ?? ""),
      ),
      body: Consumer<CollectionProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading.get()) {
            return const Center(child: LoadingWidget());
          }

          final collection = provider.selectedCollection.get();
          if (collection == null || collection.posts.isEmpty) {
            return const Center(child: Text('No posts in this collection.'));
          }

          return ListView.builder(
            itemCount: collection.posts.length,
            itemBuilder: (context, index) {
              final post = collection.posts[index];
              return InkWell(
                onTap: () {
                  context.pushNamed(
                    Routes.postDetails,
                    extra: {
                      'postModel': post,
                      'postId': post.id,
                    },
                  );
                },
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Container(
                    decoration: postBoxDecoration(),
                    margin: const EdgeInsets.only(bottom: 12),
                    child: _buildPostCard(post),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildPostCard(PostModel post) {
    switch (post.type) {
      case "text":
        return TextPostCard(post: post);
      case "image":
        return ImagePostCard(post: post);
      case "video":
        return VideoPostCard(post: post);
      case "audio":
        return AudioPostCard(post: post);
      case "link":
        return LinkPostCard(post: post);
      default:
        return const SizedBox.shrink();
    }
  }
}
