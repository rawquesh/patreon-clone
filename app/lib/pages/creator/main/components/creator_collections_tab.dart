import 'package:flutter/material.dart';
import 'package:patreon-clone/models/collection/collection_data_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/collections/collection_controller.dart';
import 'package:patreon-clone/backend/collections/collection_provider.dart';
import 'collection_card.dart';
import '../dialogs/create_collection_dialog.dart';

class CreatorCollectionsTab extends StatefulWidget {
  static const String routeName = "/CreatorCollectionsTab";

  const CreatorCollectionsTab({super.key});

  @override
  State<CreatorCollectionsTab> createState() => _CreatorCollectionsTabState();
}

class _CreatorCollectionsTabState extends State<CreatorCollectionsTab> with MySafeState {
  late CollectionProvider _collectionProvider;
  late CollectionController _collectionController;

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
  void initState() {
    super.initState();
    _collectionProvider = context.read<CollectionProvider>();
    _collectionController = CollectionController(provider: _collectionProvider);
    getData(isNotify: true);
  }

  Future<void> getData({bool isNotify = true}) async {
    await _collectionController.getCollections(isNotify: isNotify);
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Consumer<CollectionProvider>(
      builder: (context, provider, _) {
        List<CollectionModel> list = provider.collections.getList();
        if (provider.isLoading.get() && list.isEmpty) {
          return const SliverToBoxAdapter(
            child: Center(child: LoadingWidget()),
          );
        }
        if (!provider.isLoading.get() && list.isEmpty) {
          return SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 50.0),
              child: Center(
                child: Text(
                  'No Collections yet.',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[600],
                  ).withEpilogue,
                ),
              ),
            ),
          );
        }
        return SliverList(
          delegate: SliverChildListDelegate(
            [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Collections',
                      style: themeData.textTheme.labelLarge
                          ?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          )
                          .withEpilogue,
                    ),
                    ElevatedButton.icon(
                      onPressed: _showNewCollectionDialog,
                      icon: Icon(
                        Icons.add,
                        size: 16,
                        color: themeData.colorScheme.onPrimary,
                      ),
                      label: Text(
                        'Create Collection',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: themeData.colorScheme.onPrimary,
                        ).withEpilogue,
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: themeData.primaryColor,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        // control sizing here
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        // ensures no min size
                        minimumSize: Size.zero, // override default min size
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  children: list.map(
                    (item) {
                      return CollectionCard(collection: item);
                    },
                  ).toList(),
                ),
              ),
              SizedBox(
                height: MediaQuery.of(context).padding.bottom + 16,
              ),
            ],
          ),
        );
      },
    );
  }
}
