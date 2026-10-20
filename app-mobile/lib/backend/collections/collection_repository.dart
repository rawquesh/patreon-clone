import 'dart:io';

import 'package:http_parser/http_parser.dart';
import 'package:patreon_clone/models/collection/collection_data_model.dart';
import 'package:patreon_clone/utils/my_print.dart';

import 'package:patreon_clone/backend/common/api_endpoints.dart';
import 'package:patreon_clone/backend/common/api_service.dart';

class CollectionRepository {
  final ApiService _apiService = ApiService();

  Future<CollectionModel?> createCollection({
    required String title,
    String? description,
    File? coverImage,
  }) async {
    try {
      final fields = <String, String>{
        'title': title,
      };

      if (description != null && description.isNotEmpty) {
        fields['description'] = description;
      }

      final List<MultipartFileData>? files = coverImage != null
          ? [
              MultipartFileData.fromFile(
                field: 'coverImage',
                file: coverImage,
                contentType: _getImageContentType(coverImage.path),
              ),
            ]
          : null;

      final response = await _apiService.multipartRequest(
        method: 'POST',
        endpoint: ApiEndpoints.collections,
        fields: fields,
        files: files,
      );

      MyPrint.printOnConsole('Response: ${response.statusCode}');

      if (response.success && response.data != null) {
        final collectionMap = response.data!['collection'] ?? response.data!;
        return CollectionModel.fromMap(collectionMap as Map<String, dynamic>);
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error creating collection: $e');
      MyPrint.printOnConsole(s);
    }
    return null;
  }

  Future<CollectionModel?> updateCollection({
    required String id,
    required String title,
    String? description,
    bool? isActive,
    File? coverImage,
  }) async {
    try {
      MyPrint.printOnConsole('Starting updateCollection for id: $id');

      final fields = <String, String>{
        'title': title,
      };

      if (description != null && description.isNotEmpty) {
        fields['description'] = description;
      }

      if (isActive != null) {
        fields['isActive'] = isActive.toString();
      }

      final List<MultipartFileData>? files = coverImage != null
          ? [
              MultipartFileData.fromFile(
                field: 'coverImage',
                file: coverImage,
                contentType: _getImageContentType(coverImage.path),
              ),
            ]
          : null;

      final response = await _apiService.multipartRequest(
        method: 'PUT',
        endpoint: ApiEndpoints.collectionById(id),
        fields: fields,
        files: files,
      );

      if (response.success && response.data != null) {
        final collectionMap = response.data!['collection'] ?? response.data!;
        return CollectionModel.fromMap(collectionMap as Map<String, dynamic>);
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error updating collection: $e');
      MyPrint.printOnConsole(s);
    }
    return null;
  }

  Future<bool> deleteCollection(String id) async {
    try {
      MyPrint.printOnConsole('Starting deleteCollection for id: $id');

      final response = await _apiService.delete(ApiEndpoints.collectionById(id));

      MyPrint.printOnConsole('Delete response status: ${response.statusCode}');

      if (response.success) {
        return true;
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error deleting collection: $e');
      MyPrint.printOnConsole(s);
    }
    return false;
  }

  MediaType _getImageContentType(String path) {
    final ext = path.split('.').last.toLowerCase();
    switch (ext) {
      case 'png':
        return MediaType('image', 'png');
      case 'gif':
        return MediaType('image', 'gif');
      case 'webp':
        return MediaType('image', 'webp');
      default:
        return MediaType('image', 'jpeg');
    }
  }

  Future<Map<String, dynamic>?> getCollections() async {
    final response = await _apiService.get(ApiEndpoints.collections);

    if (response.success) {
      return response.data;
    }
    MyPrint.printOnConsole('Error fetching collections: ${response.errorMessage}');
    return null;
  }

  Future<Map<String, dynamic>?> getCreatorCollections(String creatorId) async {
    final response = await _apiService.get(ApiEndpoints.collectionsByCreator(creatorId));

    if (response.success) {
      return response.data;
    }
    MyPrint.printOnConsole('Error fetching creator collections: ${response.errorMessage}');
    return null;
  }

  Future<CollectionModel?> getCollectionById(String id) async {
    try {
      final response = await _apiService.get(ApiEndpoints.collectionById(id));

      MyPrint.printOnConsole('Get Collection by ID Response: ${response.statusCode}');

      if (response.success && response.data != null) {
        final collectionMap = response.data!['collection'] ?? response.data!;
        if (collectionMap is Map<String, dynamic>) {
          return CollectionModel.fromMap(collectionMap);
        }
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error getting collection by ID: $e');
      MyPrint.printOnConsole(s);
    }
    return null;
  }
}
