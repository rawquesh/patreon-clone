import 'dart:io';

import 'package:patreon_clone/models/collection/collection_data_model.dart';
import 'package:patreon_clone/utils/my_print.dart';

import 'collection_provider.dart';
import 'collection_repository.dart';

class CollectionController {
  final CollectionProvider provider;
  final CollectionRepository _repository;

  CollectionController({required this.provider, CollectionRepository? repository})
      : _repository = repository ?? CollectionRepository();

  Future<void> getCollectionById(String id, {bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final collection = await _repository.getCollectionById(id);
    provider.selectedCollection.set(value: collection, isNotify: isNotify);
    provider.isLoading.set(value: false, isNotify: isNotify);
  }

  Future<CollectionModel?> createCollection({
    required String title,
    String? description,
    File? coverImage,
    bool isNotify = true,
  }) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final model = await _repository.createCollection(
      title: title,
      description: description,
      coverImage: coverImage,
    );
    if (model != null) {
      final list = provider.collections.getList();
      provider.collections.setList(
        list: [...list, model],
        isClear: true,
        isNotify: isNotify,
      );
    }
    provider.isLoading.set(value: false, isNotify: isNotify);
    return model;
  }

  Future<CollectionModel?> updateCollection({
    required CollectionModel collection,
    required String title,
    String? description,
    File? coverImage,
    bool? isActive,
    bool isNotify = true,
  }) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final model = await _repository.updateCollection(
      id: collection.id,
      title: title,
      description: description,
      isActive: isActive,
      coverImage: coverImage,
    );

    if (model != null) {
      final list = provider.collections.getList();
      final index = list.indexWhere((e) => e.id == model.id);
      if (index != -1) {
        list[index] = model;
        provider.collections.setList(
          list: list,
          isClear: true,
          isNotify: isNotify,
        );
      }
    }

    provider.isLoading.set(value: false, isNotify: isNotify);
    return model;
  }

  Future<bool> deleteCollection({
    required String id,
    bool isNotify = true,
  }) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final success = await _repository.deleteCollection(id);

    if (success) {
      final list = provider.collections.getList();
      list.removeWhere((e) => e.id == id);
      provider.collections.setList(
        list: list,
        isClear: true,
        isNotify: isNotify,
      );
    }

    provider.isLoading.set(value: false, isNotify: isNotify);
    return success;
  }

  Future<void> getCollections({bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final response = await _repository.getCollections();
    final list = <CollectionModel>[];

    if (response != null && response['collections'] is List) {
      for (final item in response['collections']) {
        try {
          list.add(CollectionModel.fromMap(item));
        } catch (e) {
          MyPrint.printOnConsole('Error parsing collection: $e');
        }
      }
    }

    provider.collections.setList(list: list, isClear: true, isNotify: isNotify);
    provider.isLoading.set(value: false, isNotify: isNotify);
  }

  Future<void> getCreatorCollections({
    required String creatorId,
    bool isNotify = true,
  }) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final response = await _repository.getCreatorCollections(creatorId);
    final list = <CollectionModel>[];

    if (response != null && response['collections'] is List) {
      for (final item in response['collections']) {
        try {
          final map = Map<String, dynamic>.from(item);
          if (map['title'] == null && map['name'] != null) {
            map['title'] = map['name'];
          }
          if (map['_id'] == null && map['id'] != null) {
            map['_id'] = map['id'];
          }
          final collection = CollectionModel.fromMap(map);
          try {
            final detailed = await _repository.getCollectionById(collection.id);
            if (detailed != null) {
              collection.posts = detailed.posts;
            }
          } catch (e) {
            MyPrint.printOnConsole('Error fetching posts for collection: $e');
          }
          list.add(collection);
        } catch (e) {
          MyPrint.printOnConsole('Error parsing creator collection: $e');
        }
      }
    }

    provider.collections.setList(list: list, isClear: true, isNotify: isNotify);
    provider.isLoading.set(value: false, isNotify: isNotify);
  }
}
