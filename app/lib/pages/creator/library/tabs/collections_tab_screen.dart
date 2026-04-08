import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:patreon-clone/models/collection/collection_data_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/collections/collection_controller.dart';
import 'package:patreon-clone/backend/collections/collection_provider.dart';
import 'package:patreon-clone/pages/creator/main/dialogs/create_collection_dialog.dart';

class CollectionsTabScreen extends StatefulWidget {
  const CollectionsTabScreen({super.key});

  @override
  State<CollectionsTabScreen> createState() => _CollectionsTabScreenState();
}

class _CollectionsTabScreenState extends State<CollectionsTabScreen> with MySafeState {
  late CollectionProvider _collectionProvider;
  late CollectionController _collectionController;

  @override
  void initState() {
    super.initState();
    _collectionProvider = context.read<CollectionProvider>();
    _collectionController = CollectionController(provider: _collectionProvider);
    getData(isNotify: false); // Fetch initial data without a rebuild, Consumer will handle it
  }

  Future<void> getData({bool isNotify = true}) async {
    await _collectionController.getCollections(isNotify: isNotify);
  }

  void _onMenuSelected(String value, CollectionModel collection) {
    if (value == 'edit') {
      _showEditCollectionDialog(collection);
    } else if (value == 'delete') {
      _confirmDeleteCollection(collection);
    }
  }

  void _showEditCollectionDialog(CollectionModel collection) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (context, animation, secondaryAnimation) {
        return CreateCollectionDialog(collection: collection);
      },
    ).then((result) {
      if (result != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Collection updated successfully!')),
        );
        getData(isNotify: true);
      }
    });
  }

  void _confirmDeleteCollection(CollectionModel collection) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Delete Collection'),
          content: const Text('Are you sure you want to delete this collection?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                Navigator.of(context).pop();
                final success = await _collectionController.deleteCollection(
                  id: collection.id,
                  isNotify: true,
                );
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Collection deleted successfully')),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to delete collection')),
                  );
                }
              },
              child: const Text('Delete'),
            ),
          ],
        );
      },
    );
  }

  void _showNewCollectionDialog() {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (context, animation, secondaryAnimation) {
        return const CreateCollectionDialog();
      },
    ).then((result) {
      if (result != null) {
        MyPrint.printOnConsole('New collection created:');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Collection created successfully!')),
        );
        getData(isNotify: true);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9F6),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 5),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Your Collections',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ).withEpilogue,
                ),
                ElevatedButton.icon(
                  onPressed: () => _showNewCollectionDialog(),
                  icon: const Icon(Icons.add, size: 16),
                  label: Text(
                    'Create Collection',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                    ).withEpilogue,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeData.primaryColor,
                    foregroundColor: themeData.colorScheme.onPrimary,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 15),
          Expanded(
            child: Consumer<CollectionProvider>(
              builder: (context, provider, _) {
                final collections = provider.collections.getList();
                final isLoading = provider.isLoading.get();

                if (isLoading && collections.isEmpty) {
                  return const Center(child: LoadingWidget());
                }

                if (!isLoading && collections.isEmpty) {
                  return Center(
                    child: Text(
                      'No collections yet. Create one to get started!',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ).withEpilogue,
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: () => getData(isNotify: true),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                    itemCount: collections.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      return _buildCollectionCard(collections[index]);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCollectionCard(CollectionModel collection) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.shade200,
            blurRadius: 6,
            offset: const Offset(0, 2),
          )
        ],
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  collection.title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ).withEpilogue,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              PopupMenuButton<String>(
                icon: Icon(Icons.more_horiz, size: 18, color: Colors.grey.shade700),
                onSelected: (value) => _onMenuSelected(value, collection),
                itemBuilder: (context) => [
                  PopupMenuItem(
                    value: 'edit',
                    child: Text(
                      'Edit Collection',
                      style: const TextStyle(fontSize: 12).withEpilogue,
                    ),
                  ),
                  PopupMenuItem(
                    value: 'delete',
                    child: Text(
                      'Delete Collection',
                      style: const TextStyle(
                        color: Colors.red,
                        fontSize: 12,
                      ).withEpilogue,
                    ),
                  ),
                ],
              )
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.calendar_today, size: 12, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Text(
                    DateFormat('MMM d, yyyy').format(collection.createdAt),
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600).withEpilogue,
                  ),
                ],
              ),
              Text(
                '${collection.postCount} Post${collection.postCount == 1 ? '' : 's'}',
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600).withEpilogue,
              ),
              _buildStatusChip(collection.isActive),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(bool isActive) {
    final label = isActive ? 'Published' : 'Empty';
    final bgColor = isActive ? Colors.green.shade50 : Colors.grey.shade100;
    final textColor = isActive ? Colors.green.shade700 : Colors.grey.shade600;
    final borderColor = isActive ? Colors.green.shade200 : Colors.grey.shade300;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        border: Border.all(color: borderColor),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: textColor,
        ).withEpilogue,
      ),
    );
  }
}
