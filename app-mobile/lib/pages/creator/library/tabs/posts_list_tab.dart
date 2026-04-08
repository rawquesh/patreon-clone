import 'dart:developer';

import 'package:flutter/material.dart';
// import 'package:patreon-clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon-clone/navigation/navigation_type.dart';
import 'package:patreon-clone/backend/post/post_repository.dart';
import 'package:patreon-clone/constants/constants.dart';
import 'package:patreon-clone/styles/styles.dart';
import 'package:patreon-clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/utils/datetime.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart'; // Added for go_router
import 'package:patreon-clone/navigation/app_router.dart'; // Added for Routes

import 'package:patreon-clone/backend/collections/collection_controller.dart';
import 'package:patreon-clone/backend/collections/collection_provider.dart';
import 'package:patreon-clone/backend/library/library_controller.dart';
// import '../../../../navigation/navigation_arguments.dart'; // This was not explicitly removed but is likely unused now
// import '../../../../navigation/navigation_controller.dart';
import 'package:patreon-clone/backend/post/my_post_controller.dart';
import 'package:patreon-clone/backend/post/post_provider.dart';

// Enum to define the type of posts to display
enum PostListType { published, drafts }

enum PostType { all, text, picture, audio, video, link }

enum SortBy { date, title, type }

class PostsListTab extends StatefulWidget {
  final PostListType postListType;

  const PostsListTab({
    super.key,
    required this.postListType,
  });

  @override
  State<PostsListTab> createState() => _PostsListTabState();
}

class _PostsListTabState extends State<PostsListTab> with MySafeState {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  PostType _selectedPostType = PostType.all;

  String _selectedTier = 'All';
  SortBy _selectedSortBy = SortBy.date;
  final Set<String> _selectedPosts = {};

  late CollectionProvider _collectionProvider;
  late CollectionController _collectionController;
  late MyPostController _myPostController;
  late PostProvider _postProvider;
  late LibraryController _libraryController;
  late ScrollController _scrollController;

  bool _isLoadMoreInProgress = false;

  /// Determines which paginated model to use based on the widget's PostListType
  APIDocumentsPaginatedListModel<PostModel> get _paginationModel {
    if (widget.postListType == PostListType.drafts) {
      return _postProvider.draftsListPaginationModel.get();
    }
    return _postProvider.libraryPostsListPaginationModel.get();
  }

  List<PostModel> get _allPosts => _paginationModel.contentsList.getList();

  List<String> get _tierOptions {
    bool hasFree = false;
    bool hasPaid = false;

    for (final p in _allPosts) {
      final ta = p.tierAccess.map((e) => e.trim()).where((e) => e.isNotEmpty).toList();

      if (ta.isEmpty || ta.any((e) => e.toLowerCase() == 'free')) {
        hasFree = true;
      } else {
        hasPaid = true;
      }
    }

    final options = <String>['All'];
    if (hasFree) options.add('Free');
    if (hasPaid) options.add('Paid');

    return options;
  }

  bool _isFreePost(PostModel p) {
    final ta = p.tierAccess.map((e) => e.toLowerCase()).toList();
    return ta.isEmpty || ta.contains('free');
  }

  bool _postHasTier(PostModel p, String tier) {
    final t = tier.toLowerCase();
    if (t == 'free') return _isFreePost(p);
    if (t == 'paid') return !_isFreePost(p);
    return p.tierAccess.any((e) => e.toLowerCase() == t);
  }

  DateTime _parsePublishDate(String publishDate) {
    try {
      final parts = publishDate.split(' ');
      if (parts.length < 3) return DateTime.fromMillisecondsSinceEpoch(0);
      const monthMap = {
        'Jan': 1,
        'Feb': 2,
        'Mar': 3,
        'Apr': 4,
        'May': 5,
        'Jun': 6,
        'Jul': 7,
        'Aug': 8,
        'Sep': 9,
        'Oct': 10,
        'Nov': 11,
        'Dec': 12,
      };
      final month = monthMap[parts[0]] ?? 1;
      final day = int.parse(parts[1].replaceAll(',', ''));
      final year = int.parse(parts[2]);
      return DateTime(year, month, day);
    } catch (_) {
      return DateTime.fromMillisecondsSinceEpoch(0);
    }
  }

  List<PostModel> get _filteredPosts {
    List<PostModel> filtered = List<PostModel>.from(_allPosts);
    log("All posts for ${widget.postListType}: ${_allPosts.map((p) => p.toMap()).toList()}");

    // Filtering
    if (_searchQuery.isNotEmpty) {
      filtered = filtered
          .where((post) =>
              post.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
              post.description.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    }

    if (_selectedPostType != PostType.all) {
      String typeFilter = _selectedPostType.name;
      filtered = filtered.where((post) => post.type.toLowerCase() == typeFilter.toLowerCase()).toList();
    }

    if (_selectedTier != 'All') {
      filtered = filtered.where((post) => _postHasTier(post, _selectedTier)).toList();
    }

    // Sorting
    switch (_selectedSortBy) {
      case SortBy.title:
        filtered.sort((a, b) => a.title.compareTo(b.title));
        break;
      case SortBy.type:
        filtered.sort((a, b) => a.type.compareTo(b.type));
        break;
      case SortBy.date:
        if (widget.postListType == PostListType.drafts) {
          filtered.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        } else {
          filtered.sort((a, b) => _parsePublishDate(b.publishDate).compareTo(_parsePublishDate(a.publishDate)));
        }
        break;
    }

    return filtered;
  }

  // All action handling methods (_handlePostAction, _showDeleteConfirmation, _publishPost, etc.)
  // can be copied directly from PostsTabScreen as they are almost identical and will work
  // with the new structure. The `mySetState()` call will correctly rebuild the UI
  // and `_filteredPosts` will re-evaluate the list.

  Future<void> _handlePostAction(String action, PostModel post) async {
    switch (action) {
      case 'view':
        PostModel fullPost = await PostRepository().getPostById(postId: post.id) ?? post;
        context.pushNamed(
          Routes.postDetails,
          extra: fullPost.id,
        );
        break;

      case 'edit':
        MyPrint.printOnConsole("Editing post: ID: ${post.id}, Type: ${post.postType}");
        final fullPost = await PostRepository().getPostById(postId: post.id) ?? post;

        switch (post.postType.toLowerCase()) {
          case 'text':
            context.pushNamed(Routes.createTextPost, extra: fullPost);
            break;
          case 'video':
            context.pushNamed(Routes.createVideoPost, extra: fullPost);
            break;
          case 'audio':
            context.pushNamed(Routes.createAudioPost, extra: fullPost);
            break;
          case 'image':
          case 'picture':
            context.pushNamed(Routes.createImagePost, extra: fullPost);
            break;
          case 'link':
            context.pushNamed(Routes.createLinkPost, extra: fullPost);
            break;
          default:
            MyPrint.printOnConsole("No matching screen for post type: ${post.type}");
            return;
        }
        break;

      case 'collection':
        await _addPostToCollection(post);
        break;
      case 'publish':
        await _publishPost(post);
        break;
      case 'unpublish':
        await _unpublishPost(post);
        break;
      case 'delete':
        _showDeleteConfirmation(post);
        break;
    }
  }

  void _showDeleteConfirmation(PostModel post) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Post', style: TextStyle(fontSize: 16)),
        content: Text(
          'Are you sure you want to delete "${post.title}"?',
          style: const TextStyle(fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(fontSize: 12)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await _myPostController.deletePostPermanently(postId: post.id);
              if (success) {
                // Remove from the local list and refresh state
                _allPosts.removeWhere((p) => p.id == post.id);
                MyToast.showSuccess(context: context, msg: 'Post permanently deleted');
                mySetState();
              } else {
                MyToast.showError(context: context, msg: 'Failed to permanently delete post');
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete Permanently', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    );
  }

  Future<String?> _selectCollection() async {
    final collections = _collectionProvider.collections.getList();
    String? selectedId;
    return showDialog<String>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Add to Collection'),
              content: SizedBox(
                width: double.maxFinite,
                child: ListView(
                  shrinkWrap: true,
                  children: collections.map((c) {
                    final bool checked = selectedId == c.id;
                    return ListTile(
                      title: Text(c.title, style: const TextStyle(fontSize: 14)),
                      trailing: checked ? const Icon(Icons.check, color: Colors.green) : null,
                      onTap: () => setState(() => selectedId = c.id),
                    );
                  }).toList(),
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                TextButton(onPressed: () => Navigator.pop(context, selectedId), child: const Text('Add')),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _addPostToCollection(PostModel post) async {
    final collectionId = await _selectCollection();
    if (collectionId != null) {
      final success = await _myPostController.addPostToCollection(postId: post.id, collectionId: collectionId);
      if (success) {
        MyToast.showSuccess(context: context, msg: "Post added to collection");
        post.collections.add(collectionId);
        mySetState();
      } else {
        MyToast.showSuccess(context: context, msg: "Failed to add post to collection");
      }
    }
  }

  Future<void> _publishPost(PostModel post) async {
    final success = await _myPostController.publishPost(postId: post.id);
    if (success) {
      MyToast.showSuccess(context: context, msg: "Post Published Successfully");
      post.status = PostStatus.published;
      mySetState();
    } else {
      MyToast.showError(context: context, msg: "Failed to publish post");
    }
  }

  Future<void> _unpublishPost(PostModel post) async {
    final success = await _myPostController.unpublishPost(postId: post.id);
    if (success) {
      MyToast.showSuccess(context: context, msg: "Post Unpublished Successfully");
      post.status = PostStatus.draft;
      mySetState();
    } else {
      MyToast.showError(context: context, msg: "Failed to unpublish post");
    }
  }

  @override
  void initState() {
    super.initState();
    _postProvider = context.read<PostProvider>();
    _libraryController = LibraryController(postProvider: _postProvider);
    _collectionProvider = context.read<CollectionProvider>();
    _collectionController = CollectionController(provider: _collectionProvider);
    _myPostController = MyPostController(postProvider: _postProvider);

    _scrollController = ScrollController()..addListener(_onScroll);

    // initial load
    _getData(isRefresh: true, isFromCache: false, isNotify: true);
    _collectionController.getCollections(isNotify: true);
  }

  void _onScroll() {
    final pos = _scrollController.position;
    if (pos.pixels >= pos.maxScrollExtent - 300) {
      _loadMore();
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadMoreInProgress) return;

    final model = _paginationModel;
    if (!model.hasMoreContents.get() || model.isContentsLoading.get()) return;

    _isLoadMoreInProgress = true;
    try {
      await _getData(isRefresh: false, isFromCache: false, isNotify: true);
    } finally {
      _isLoadMoreInProgress = false;
    }
  }

  Future<void> _getData({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    if (widget.postListType == PostListType.drafts) {
      await _libraryController.getDraftsPaginatedList(
        isRefresh: isRefresh,
        isFromCache: isFromCache,
        isNotify: isNotify,
      );
    } else {
      await _libraryController.getLibraryPostsPaginatedList(
        isRefresh: isRefresh,
        isFromCache: isFromCache,
        isNotify: isNotify,
      );

      final model = _postProvider.libraryPostsListPaginationModel.get();
      final List<PostModel> posts = model.contentsList.getList(isNewInstance: false);

      final Map<String, PostModel> unique = <String, PostModel>{};
      for (final post in posts) {
        unique[post.id] = post;
      }

      final List<PostModel> sorted = unique.values.toList()
        ..sort((a, b) => _parsePublishDate(b.publishDate).compareTo(_parsePublishDate(a.publishDate)));

      model.contentsList.setList(list: sorted, isClear: true, isNotify: isNotify);
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Scaffold(
      body: Column(
        children: [
          _buildFiltersSection(),
          _buildPostsList(),
        ],
      ),
    );
  }

  // All build methods (_buildFiltersSection, _buildPostsList, _buildPostCard, etc.)
  // can be copied directly from PostsTabScreen. They will work because `_filteredPosts`
  // and other state variables are now managed correctly for both types.

  Widget _buildFiltersSection() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Styles.scaffoldBackground,
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSearchField(),
          const SizedBox(height: 10),
          Wrap(
            spacing: 10,
            runSpacing: 8,
            children: [
              _buildFilterDropdown<PostType>(
                label: 'Type',
                value: _selectedPostType,
                items: PostType.values,
                icon: Icons.category_outlined,
                itemBuilder: _postTypeLabel,
                onChanged: (val) => setState(() => _selectedPostType = val!),
              ),
              _buildFilterDropdown<String>(
                label: 'Access',
                value: _selectedTier,
                items: _tierOptions,
                icon: Icons.lock_outline,
                itemBuilder: (v) => v,
                onChanged: (val) => setState(() => _selectedTier = val ?? 'All'),
              ),
              _buildFilterDropdown<SortBy>(
                label: 'Sort',
                value: _selectedSortBy,
                items: SortBy.values,
                icon: Icons.sort,
                itemBuilder: _sortByLabel,
                onChanged: (val) => setState(() => _selectedSortBy = val!),
              ),
            ],
          ),
          _buildActiveFilters(),
        ],
      ),
    );
  }

  String _postTypeLabel(PostType type) {
    return type.name[0].toUpperCase() + type.name.substring(1);
  }

  String _sortByLabel(SortBy sort) {
    return sort.name[0].toUpperCase() + sort.name.substring(1);
  }

  Widget _buildFilterDropdown<T>({
    required String label,
    required T value,
    required List<T> items,
    required IconData icon,
    required ValueChanged<T?> onChanged,
    required String Function(T) itemBuilder,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      height: 36,
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(20),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: value,
          isExpanded: false,
          icon: Icon(Icons.keyboard_arrow_down, size: 16, color: Colors.grey.shade600),
          style: const TextStyle(fontSize: 12, color: Colors.black).withEpilogue,
          onChanged: onChanged,
          items: items.map((item) {
            return DropdownMenuItem<T>(
              value: item,
              child: Text(itemBuilder(item), style: const TextStyle(fontSize: 12).withEpilogue),
            );
          }).toList(),
          hint: Row(
            children: [
              Icon(icon, size: 14, color: Colors.grey.shade600),
              const SizedBox(width: 4),
              Text(label, style: const TextStyle(fontSize: 12).withEpilogue),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchField() {
    return Container(
      height: 36,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
        color: Colors.grey.shade50,
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (value) => setState(() => _searchQuery = value),
        style: const TextStyle(fontSize: 12).withEpilogue,
        decoration: InputDecoration(
          hintText: 'Search posts by title or description...',
          hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade500).withEpilogue,
          prefixIcon: Icon(Icons.search, size: 18, color: Colors.grey.shade500),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        ),
      ),
    );
  }

  Widget _buildActiveFilters() {
    // This helper checks if any filter besides the default is active
    bool hasActiveFilters() {
      return _searchQuery.isNotEmpty || _selectedPostType != PostType.all || _selectedTier != 'All';
    }

    if (!hasActiveFilters()) {
      return const SizedBox.shrink(); // Don't show anything if no filters are set
    }

    return Container(
      margin: const EdgeInsets.only(top: 12),
      child: Row(
        children: [
          Text(
            'Active filters:',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: Colors.grey.shade600,
            ).withEpilogue,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Wrap(
              spacing: 6,
              runSpacing: 4,
              children: [
                if (_searchQuery.isNotEmpty)
                  _buildFilterChip('Search: "$_searchQuery"', () {
                    setState(() {
                      _searchQuery = '';
                      _searchController.clear();
                    });
                  }),
                if (_selectedPostType != PostType.all)
                  _buildFilterChip(
                    'Type: ${_postTypeLabel(_selectedPostType)}',
                    () => setState(() => _selectedPostType = PostType.all),
                  ),
                if (_selectedTier != 'All')
                  _buildFilterChip(
                    'Access: $_selectedTier',
                    () => setState(() => _selectedTier = 'All'),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, VoidCallback onRemove) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: themeData.primaryColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: themeData.primaryColor.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: themeData.primaryColor.withValues(alpha: 0.7),
              ).withEpilogue),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: onRemove,
            child: Icon(
              Icons.close,
              size: 14,
              color: themeData.primaryColor.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPostsList() {
    return Expanded(
      child: ChangeNotifierProvider<APIDocumentsPaginatedListModel<PostModel>>.value(
        value: _paginationModel,
        child: Consumer<APIDocumentsPaginatedListModel<PostModel>>(
          builder: (context, paginatedListModel, child) {
            if (paginatedListModel.isContentsFirstTimeLoading.get()) {
              return const Center(child: LoadingWidget());
            }

            final posts = _filteredPosts;

            if (!paginatedListModel.isContentsLoading.get() && posts.isEmpty) {
              return RefreshIndicator(
                onRefresh: () => _getData(isRefresh: true, isFromCache: false, isNotify: true),
                child: ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: [
                    const SizedBox(height: 100),
                    _buildEmptyState(),
                  ],
                ),
              );
            }

            return RefreshIndicator(
              onRefresh: () => _getData(isRefresh: true, isFromCache: false, isNotify: true),
              child: ListView.separated(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                itemCount: posts.length + 1,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  if (index == posts.length) {
                    return paginatedListModel.isContentsLoading.get()
                        ? const Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Center(child: LoadingWidget()),
                          )
                        : const SizedBox.shrink();
                  }

                  final post = posts[index];
                  return _buildPostCard(post);
                },
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.article_outlined, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text('No posts found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Colors.grey.shade600,
              ).withEpilogue),
          const SizedBox(height: 8),
          Text('Try adjusting your filters or create a new post',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade500).withEpilogue),
        ],
      ),
    );
  }

  Widget _buildPostCard(PostModel post) {
    final bool isSelected = _selectedPosts.contains(post.id);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.shade100,
            blurRadius: 6,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: () {
            // Note: Post selection logic is preserved but not used elsewhere in the provided code.
            // You can build features on top of this, like bulk actions.
            setState(() {
              if (isSelected) {
                _selectedPosts.remove(post.id);
              } else {
                _selectedPosts.add(post.id);
              }
            });
          },
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(post.title,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ).withEpilogue,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis),
                          if (post.description.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                post.description,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ).withEpilogue,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                        ],
                      ),
                    ),
                    Align(
                      alignment: Alignment.topCenter,
                      child: _buildActionButton(post, context),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildMetaInfo(
                      widget.postListType == PostListType.drafts
                          ? MyDateFormat.formatToReadableDate(post.createdAt)
                          : 'Published: ${post.publishDate}',
                    ),
                    _buildTierAccessChip(post.tierAccess),
                    _buildTypeChip(post.postType),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetaInfo(String label) {
    return Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade600).withEpilogue);
  }

  Widget _buildTierAccessChip(List<String> tierAccess) {
    final isFree = tierAccess.isEmpty || tierAccess.any((e) => e.trim().toLowerCase() == 'free');
    final label = isFree ? 'Free' : 'Paid';
    final isPaid = !isFree;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: isPaid ? Colors.amber.shade50 : Colors.green.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: isPaid ? Colors.amber.shade200 : Colors.green.shade200),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: isPaid ? Colors.amber.shade700 : Colors.green.shade700,
        ).withEpilogue,
      ),
    );
  }

  Widget _buildTypeChip(String type) {
    IconData icon;
    Color color;

    switch (type.toLowerCase()) {
      case 'text':
        icon = Icons.text_fields;
        color = themeData.primaryColor;
        break;
      case 'picture':
      case 'image':
        icon = Icons.image;
        color = Colors.purple;
        break;
      case 'audio':
        icon = Icons.audiotrack;
        color = Colors.orange;
        break;
      case 'video':
        icon = Icons.play_circle;
        color = Colors.red;
        break;
      case 'link':
        icon = Icons.link;
        color = Colors.teal;
        break;
      default:
        icon = Icons.article;
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(type,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: color,
              ).withEpilogue),
        ],
      ),
    );
  }

  Widget _buildActionButton(PostModel post, BuildContext context) {
    return Container(
      alignment: Alignment.topCenter,
      padding: const EdgeInsets.only(left: 8),
      child: GestureDetector(
        onTapDown: (TapDownDetails details) {
          _showCustomPostMenu(details.globalPosition, post, context);
        },
        child: Icon(Icons.more_horiz, size: 18, color: Colors.grey.shade600),
      ),
    );
  }

  void _showCustomPostMenu(Offset position, PostModel post, BuildContext context) async {
    final selected = await showMenu<String>(
      context: context,
      position: RelativeRect.fromLTRB(position.dx, position.dy, position.dx + 1, position.dy + 1),
      items: [
        _customPopupItem('view', Icons.visibility_outlined, 'View'),
        _customPopupItem('edit', Icons.edit_outlined, 'Edit'),
        _customPopupItem('collection', Icons.collections_outlined, 'Add to Collection'),
        _customPopupItem(post.status == PostStatus.published ? 'unpublish' : 'publish', Icons.upload_file,
            post.status == PostStatus.published ? 'Unpublish' : 'Publish'),
        _customPopupItem('delete', Icons.delete_outlined, 'Delete', iconColor: Colors.red, textColor: Colors.red),
      ],
      elevation: 8,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    );

    if (selected != null) _handlePostAction(selected, post);
  }

  PopupMenuItem<String> _customPopupItem(
    String value,
    IconData icon,
    String label, {
    Color? iconColor,
    Color? textColor,
  }) {
    return PopupMenuItem<String>(
      value: value,
      height: 36,
      child: Row(
        children: [
          Icon(icon, size: 14, color: iconColor ?? Colors.black),
          const SizedBox(width: 8),
          Text(label,
              style: TextStyle(
                fontSize: 12,
                color: textColor ?? Colors.black,
              ).withEpilogue),
        ],
      ),
    );
  }
}
