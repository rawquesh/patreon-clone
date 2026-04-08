import 'dart:convert';
import 'dart:io';
import 'dart:developer';

import 'package:http_parser/http_parser.dart';
// import 'package:patreon-clone/configs/constants.dart';
import 'package:patreon-clone/models/collection/collection_data_model.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/models/post/request_model/create_audio_post_request_model.dart';
import 'package:patreon-clone/models/post/request_model/create_draft_audio_post_request_model.dart';
import 'package:patreon-clone/models/post/request_model/create_draft_images_post_request_model.dart';
import 'package:patreon-clone/models/post/request_model/create_draft_link_post_request_model.dart';
import 'package:patreon-clone/models/post/request_model/create_draft_text_post_request_model.dart';
import 'package:patreon-clone/models/post/request_model/create_draft_video_post_request_model.dart';
import 'package:patreon-clone/models/post/request_model/create_images_post_request_model.dart';
import 'package:patreon-clone/models/post/request_model/create_link_post_request_model.dart';
import 'package:patreon-clone/models/post/request_model/create_text_post_request_model.dart';
import 'package:patreon-clone/models/post/request_model/create_video_post_request_model.dart';
import 'package:patreon-clone/utils/my_print.dart';

import 'package:patreon-clone/backend/common/api_service.dart';

class PostCreationRepository {
  final ApiService _apiService = ApiService();

  Future<List<MembershipModel>> getMemberships() async {
    try {
      final response = await _apiService.get('/memberships/creator');

      if (response.success && response.data != null) {
        final List list = response.data!['memberships'] ?? [];
        return list.map((e) => MembershipModel.fromMap(e as Map<String, dynamic>)).toList();
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error fetching memberships: $e');
      MyPrint.printOnConsole(s);
    }
    return [];
  }

  Future<List<CollectionModel>> getCollections() async {
    try {
      final response = await _apiService.get('/collections');

      if (response.success && response.data != null) {
        final List list = response.data!['collections'] ?? [];
        return list.map((e) => CollectionModel.fromMap(e as Map<String, dynamic>)).toList();
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error fetching collections: $e');
      MyPrint.printOnConsole(s);
    }
    return [];
  }

  Future<bool> createTextPost({
    required CreateTextPostRequestModel request,
    List<File> attachments = const [],
  }) async {
    log("Creating text post with request: $request, attachments ${attachments.length}");

    try {
      final fields = <String, String>{
        'title': request.title,
        'textContent': request.textContent,
        'collections': jsonEncode(request.collections),
        'tags': jsonEncode(request.tags),
        'tierAccess': jsonEncode(request.tierAccess),
      };

      final files = <MultipartFileData>[];
      for (final file in attachments) {
        files.add(MultipartFileData.fromFile(field: 'attachments', file: file));
      }

      final response = await _apiService.multipartRequest(
        method: 'POST',
        endpoint: '/posts/text',
        fields: fields,
        files: files.isNotEmpty ? files : null,
      );

      log('Text Server Response: ${response.statusCode}');

      if (response.success) {
        return true;
      } else {
        MyPrint.printOnConsole('Failed to create post: ${response.errorMessage}');
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error during post creation: $e');
      MyPrint.printOnConsole(s);
    }
    return false;
  }

  Future<bool> createDraftTextPost({
    required CreateDraftTextPostRequestModel request,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole("Creating draft text post with request: $request");

    try {
      final fields = <String, String>{
        'title': request.title,
        'textContent': request.textContent,
        'collections': jsonEncode(request.collections),
        'isDraft': request.isDraft.toString(),
        'tags': jsonEncode(request.tags),
        'tierAccess': jsonEncode(request.tierAccess),
      };

      final files = <MultipartFileData>[];
      for (final file in attachments) {
        files.add(MultipartFileData.fromFile(field: 'attachments', file: file));
      }

      final response = await _apiService.multipartRequest(
        method: 'POST',
        endpoint: '/posts/text',
        fields: fields,
        files: files.isNotEmpty ? files : null,
      );

      if (response.success) {
        return true;
      } else {
        MyPrint.printOnConsole('Failed to create post: ${response.errorMessage}');
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error during post creation: $e');
      MyPrint.printOnConsole(s);
    }
    return false;
  }

  // --- S3 UPLOAD IMPLEMENTATION ---

  /// Step 1: Request an S3 Upload Session from the backend.
  Future<Map<String, dynamic>> _requestUploadSession({
    required File videoFile,
  }) async {
    final fileSize = await videoFile.length();
    final fileName = videoFile.path.split('/').last.split('\\').last;

    String fileType = 'video/mp4';
    if (fileName.endsWith('.mov')) {
      fileType = 'video/quicktime';
    } else if (fileName.endsWith('.webm')) {
      fileType = 'video/webm';
    }

    MyPrint.printOnConsole("Requesting S3 upload session for: $fileName ($fileSize bytes, $fileType)");

    final response = await _apiService.post(
      '/s3/videos/upload-session',
      body: {
        'fileName': fileName,
        'fileType': fileType,
        'fileSize': fileSize,
      },
    );

    if (response.success && response.data != null) {
      MyPrint.printOnConsole("Upload session created successfully.");
      return response.data!;
    } else {
      throw Exception('Failed to create upload session: ${response.errorMessage}');
    }
  }

  /// Step 2: Upload individual parts to S3 using presigned URLs.
  Future<List<Map<String, dynamic>>> _uploadParts({
    required File videoFile,
    required List<Map<String, dynamic>> presignedUrls,
    required int partSize,
    Function(double)? onProgress,
  }) async {
    MyPrint.printOnConsole("Starting to upload ${presignedUrls.length} parts...");
    final fileSize = await videoFile.length();
    final parts = <Map<String, dynamic>>[];
    final randomAccessFile = await videoFile.open();

    try {
      for (final urlData in presignedUrls) {
        final partNumber = urlData['partNumber'] as int;
        final url = urlData['url'] as String;

        final startByte = (partNumber - 1) * partSize;
        final endByte = (partNumber == presignedUrls.length) ? fileSize - 1 : startByte + partSize - 1;
        final chunkSize = endByte - startByte + 1;

        await randomAccessFile.setPosition(startByte);
        final chunk = await randomAccessFile.read(chunkSize);

        // Use raw request for S3 upload (external URL)
        final response = await _apiService.rawRequest(
          method: 'PUT',
          url: url,
          headers: {'Content-Length': chunk.length.toString()},
          bodyBytes: chunk,
        );

        if (response.statusCode == 200) {
          final eTag = (response.headers['etag'] ?? response.headers['ETag'] ?? '').replaceAll('"', '');

          if (eTag.isEmpty) {
            throw Exception('Failed to get ETag for part $partNumber');
          }

          parts.add({
            'partNumber': partNumber,
            'eTag': eTag,
          });

          MyPrint.printOnConsole("✅ Uploaded part $partNumber / ${presignedUrls.length} (ETag: $eTag)");
          onProgress?.call(partNumber / presignedUrls.length);
        } else {
          throw Exception('Failed to upload part $partNumber: ${response.statusCode}');
        }
      }
    } finally {
      await randomAccessFile.close();
    }

    MyPrint.printOnConsole("All parts uploaded.");
    return parts;
  }

  /// Step 3: Complete the multipart upload on the backend.
  Future<String> _completeUpload({
    required String uploadId,
    required String key,
    required List<Map<String, dynamic>> parts,
  }) async {
    MyPrint.printOnConsole("Completing multipart upload for $key...");

    final response = await _apiService.post(
      '/s3/videos/complete-upload',
      body: {
        'uploadId': uploadId,
        'key': key,
        'parts': parts,
      },
    );

    if (response.success && response.data != null) {
      final videoUrl = response.data!['videoUrl'] as String;
      MyPrint.printOnConsole("✅ Upload complete. Final URL: $videoUrl");
      return videoUrl;
    } else {
      throw Exception('Failed to complete upload: ${response.errorMessage}');
    }
  }

  Future<bool> createVideoPost({
    required CreateVideoPostRequestModel request,
    File? videoFile,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole("Creating video post with request: $request");

    try {
      String finalVideoUrl = request.videoUrl;

      // If a video file is provided, upload it to S3 first
      if (videoFile != null) {
        MyPrint.printOnConsole("📹 Video file detected, starting S3 multipart upload...");

        final session = await _requestUploadSession(videoFile: videoFile);

        final uploadId = session['uploadId'] as String;
        final key = session['key'] as String;
        final partSize = session['partSize'] as int;
        final presignedUrls = (session['presignedUrls'] as List).cast<Map<String, dynamic>>();

        final parts = await _uploadParts(
          videoFile: videoFile,
          presignedUrls: presignedUrls,
          partSize: partSize,
          onProgress: (progress) {
            MyPrint.printOnConsole('S3 Upload Progress: ${(progress * 100).toStringAsFixed(0)}%');
          },
        );

        finalVideoUrl = await _completeUpload(
          uploadId: uploadId,
          key: key,
          parts: parts,
        );

        MyPrint.printOnConsole("✅ S3 Upload complete, using URL: $finalVideoUrl");
      }

      if (finalVideoUrl.isEmpty) {
        MyPrint.printOnConsole("❌ No video URL provided. Aborting post creation.");
        return false;
      }

      final fields = <String, String>{
        'title': request.title,
        'videoUrl': finalVideoUrl,
      };

      if (request.isDraft) fields['isDraft'] = true.toString();
      if (request.description.isNotEmpty) fields['description'] = request.description;
      if (request.tags.isNotEmpty) fields['tags'] = jsonEncode(request.tags);
      if (request.collections.isNotEmpty) fields['collections'] = jsonEncode(request.collections);
      if (request.tierAccess.isNotEmpty) fields['tierAccess'] = jsonEncode(request.tierAccess);
      if (request.existingAttachments.isNotEmpty) {
        fields['existingAttachments'] = jsonEncode(request.existingAttachments);
      }

      final files = <MultipartFileData>[];
      for (final file in attachments) {
        files.add(MultipartFileData.fromFile(field: 'attachments', file: file));
      }

      final response = await _apiService.multipartRequest(
        method: 'POST',
        endpoint: '/posts/video',
        fields: fields,
        files: files.isNotEmpty ? files : null,
      );

      if (response.success) {
        MyPrint.printOnConsole("✅ Video post created successfully!");
        return true;
      } else {
        MyPrint.printOnConsole("❌ Video post creation failed: ${response.errorMessage}");
        return false;
      }
    } catch (e, s) {
      MyPrint.printOnConsole("❌ Error during video post creation flow: $e");
      MyPrint.printOnConsole(s);
      return false;
    }
  }

  Future<bool> createDraftVideoPost({
    required CreateDraftVideoPostRequestModel request,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole("Creating draft video post with request: $request");

    try {
      final fields = <String, String>{
        'title': request.title,
        'videoUrl': request.videoUrl,
        'description': request.description,
        'collections': jsonEncode(request.collections),
        'tags': jsonEncode(request.tags),
        'isDraft': request.isDraft.toString(),
        'tierAccess': jsonEncode(request.tierAccess),
        'existingAttachments': jsonEncode(request.existingAttachments),
      };

      final files = <MultipartFileData>[];
      for (final file in attachments) {
        files.add(MultipartFileData.fromFile(field: 'attachments', file: file));
      }

      final response = await _apiService.multipartRequest(
        method: 'POST',
        endpoint: '/posts/video',
        fields: fields,
        files: files.isNotEmpty ? files : null,
      );

      if (response.success) {
        return true;
      } else {
        MyPrint.printOnConsole('Failed to create draft video post: ${response.errorMessage}');
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error during draft video post creation: $e');
      MyPrint.printOnConsole(s);
    }
    return false;
  }

  Future<bool> createAudioPost({
    required CreateAudioPostRequestModel request,
    required File audioFile,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole("Creating audio post with request: $request");

    try {
      final fields = <String, String>{
        'title': request.title,
        'description': request.description,
        'collections': jsonEncode(request.collections),
        'tags': jsonEncode(request.tags),
        'tierAccess': jsonEncode(request.tierAccess),
        'existingAttachments': jsonEncode(request.existingAttachments),
      };

      final files = <MultipartFileData>[
        MultipartFileData.fromFile(
          field: 'audioFile',
          file: audioFile,
          contentType: MediaType('audio', _getAudioSubtype(audioFile.path)),
        ),
      ];

      for (final file in attachments) {
        files.add(MultipartFileData.fromFile(field: 'attachments', file: file));
      }

      final response = await _apiService.multipartRequest(
        method: 'POST',
        endpoint: '/posts/audio',
        fields: fields,
        files: files,
      );

      if (response.success) {
        return true;
      } else {
        MyPrint.printOnConsole('Failed to create audio post: ${response.errorMessage}');
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error during audio post creation: $e');
      MyPrint.printOnConsole(s);
    }

    return false;
  }

  Future<bool> createDraftAudioPost({
    required CreateDraftAudioPostRequestModel request,
    required File audioFile,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole("Creating draft audio post with request: $request");

    try {
      final fields = <String, String>{
        'title': request.title,
        'description': request.description,
        'collections': jsonEncode(request.collections),
        'isDraft': request.isDraft.toString(),
        'tags': jsonEncode(request.tags),
        'tierAccess': jsonEncode(request.tierAccess),
        'existingAttachments': jsonEncode(request.existingAttachments),
      };

      final files = <MultipartFileData>[
        MultipartFileData.fromFile(
          field: 'audioFile',
          file: audioFile,
          contentType: MediaType('audio', _getAudioSubtype(audioFile.path)),
        ),
      ];

      for (final file in attachments) {
        files.add(MultipartFileData.fromFile(field: 'attachments', file: file));
      }

      final response = await _apiService.multipartRequest(
        method: 'POST',
        endpoint: '/posts/audio',
        fields: fields,
        files: files,
      );

      if (response.success) {
        return true;
      } else {
        MyPrint.printOnConsole('Failed to create draft audio post: ${response.errorMessage}');
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error during audio post creation: $e');
      MyPrint.printOnConsole(s);
    }

    return false;
  }

  String _getAudioSubtype(String path) {
    final ext = path.split('.').last.toLowerCase();
    switch (ext) {
      case 'mp3':
        return 'mpeg';
      case 'wav':
        return 'wav';
      case 'm4a':
        return 'mp4';
      case 'aac':
        return 'aac';
      case 'flac':
        return 'flac';
      case 'ogg':
        return 'ogg';
      default:
        return 'mpeg';
    }
  }

  Future<bool> createImagePost({
    required CreateImagesPostRequestModel request,
    List<File> imageFiles = const [],
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole("Creating image post with request: $request");

    try {
      final fields = <String, String>{
        'title': request.title,
        'description': request.description,
        'collections': jsonEncode(request.collections),
        'tags': jsonEncode(request.tags),
        'tierAccess': jsonEncode(request.tierAccess),
        'existingAttachments': jsonEncode(request.existingAttachments),
        'existingImages': jsonEncode(request.existingImages),
      };

      final files = <MultipartFileData>[];

      for (final image in imageFiles) {
        files.add(MultipartFileData.fromFile(
          field: 'images',
          file: image,
          contentType: MediaType('image', _getImageSubtype(image.path)),
        ));
      }

      for (final file in attachments) {
        files.add(MultipartFileData.fromFile(field: 'attachments', file: file));
      }

      final response = await _apiService.multipartRequest(
        method: 'POST',
        endpoint: '/posts/image',
        fields: fields,
        files: files.isNotEmpty ? files : null,
      );

      return response.success;
    } catch (e, s) {
      MyPrint.printOnConsole('Error during image post creation: $e');
      MyPrint.printOnConsole(s);
    }

    return false;
  }

  Future<bool> createDraftImagePost({
    required CreateDraftImagesPostRequestModel request,
    List<File> imageFiles = const [],
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole("Creating draft image post with request: $request");

    try {
      final fields = <String, String>{
        'title': request.title,
        'description': request.description,
        'collections': jsonEncode(request.collections),
        'tags': jsonEncode(request.tags),
        'isDraft': request.isDraft.toString(),
        'tierAccess': jsonEncode(request.tierAccess),
        'existingAttachments': jsonEncode(request.existingAttachments),
        'existingImages': jsonEncode(request.existingImages),
      };

      final files = <MultipartFileData>[];

      for (final image in imageFiles) {
        files.add(MultipartFileData.fromFile(
          field: 'images',
          file: image,
          contentType: MediaType('image', _getImageSubtype(image.path)),
        ));
      }

      for (final file in attachments) {
        files.add(MultipartFileData.fromFile(field: 'attachments', file: file));
      }

      final response = await _apiService.multipartRequest(
        method: 'POST',
        endpoint: '/posts/image',
        fields: fields,
        files: files.isNotEmpty ? files : null,
      );

      return response.success;
    } catch (e, s) {
      MyPrint.printOnConsole('Error during draft image post creation: $e');
      MyPrint.printOnConsole(s);
    }

    return false;
  }

  String _getImageSubtype(String path) {
    final ext = path.split('.').last.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'jpeg';
      case 'png':
        return 'png';
      case 'webp':
        return 'webp';
      case 'gif':
        return 'gif';
      default:
        return 'jpeg';
    }
  }

  Future<bool> createLinkPost({
    required CreateLinkPostRequestModel request,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole("Creating link post with request: $request");

    try {
      final fields = <String, String>{
        'title': request.title,
        'linkUrl': request.linkUrl,
        'description': request.description,
        'collections': jsonEncode(request.collections),
        'tags': jsonEncode(request.tags),
        'tierAccess': jsonEncode(request.tierAccess),
        'existingAttachments': jsonEncode(request.existingAttachments),
      };

      final files = <MultipartFileData>[];
      for (final file in attachments) {
        files.add(MultipartFileData.fromFile(field: 'attachments', file: file));
      }

      final response = await _apiService.multipartRequest(
        method: 'POST',
        endpoint: '/posts/link',
        fields: fields,
        files: files.isNotEmpty ? files : null,
      );

      return response.success;
    } catch (e, s) {
      MyPrint.printOnConsole('Error during link post creation: $e');
      MyPrint.printOnConsole(s);
    }

    return false;
  }

  Future<bool> createDraftLinkPost({
    required CreateDraftLinkPostRequestModel request,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole("Creating Draft link post with request: $request");

    try {
      final fields = <String, String>{
        'title': request.title,
        'linkUrl': request.linkUrl,
        'description': request.description,
        'collections': jsonEncode(request.collections),
        'tags': jsonEncode(request.tags),
        'tierAccess': jsonEncode(request.tierAccess),
        'existingAttachments': jsonEncode(request.existingAttachments),
        'isDraft': request.isDraft.toString(),
      };

      final files = <MultipartFileData>[];
      for (final file in attachments) {
        files.add(MultipartFileData.fromFile(field: 'attachments', file: file));
      }

      final response = await _apiService.multipartRequest(
        method: 'POST',
        endpoint: '/posts/link',
        fields: fields,
        files: files.isNotEmpty ? files : null,
      );

      return response.success;
    } catch (e, s) {
      MyPrint.printOnConsole('Error during Draft link post creation: $e');
      MyPrint.printOnConsole(s);
    }

    return false;
  }

  Future<bool> updateImagePost({
    required PostModel post,
    List<File> imageFiles = const [],
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole(
        "Updating image post ${post.id} with ${imageFiles.length} images and ${attachments.length} attachments.");

    try {
      final fields = <String, String>{
        'title': post.title,
        'description': post.description,
        'collections': jsonEncode(post.collections),
        'tags': jsonEncode(post.tags),
        'tierAccess': jsonEncode(post.tierAccess),
      };

      final files = <MultipartFileData>[];

      for (final image in imageFiles) {
        files.add(MultipartFileData.fromFile(
          field: 'images',
          file: image,
          contentType: MediaType('image', _getImageSubtype(image.path)),
        ));
      }

      for (final file in attachments) {
        files.add(MultipartFileData.fromFile(field: 'attachments', file: file));
      }

      final response = await _apiService.multipartRequest(
        method: 'PUT',
        endpoint: '/posts/image/${post.id}',
        fields: fields,
        files: files.isNotEmpty ? files : null,
      );

      MyPrint.printOnConsole('Update image post response: ${response.statusCode}');

      return response.success;
    } catch (e, s) {
      MyPrint.printOnConsole('Error updating image post: $e');
      MyPrint.printOnConsole(s);
      return false;
    }
  }

  Future<bool> updatePost({required PostModel post}) async {
    MyPrint.printOnConsole('Updating post ${post.id}');

    try {
      final type = post.type.toLowerCase();

      final response = await _apiService.put(
        '/posts/$type/${post.id}',
        body: post.toMap(toJson: true),
      );

      MyPrint.printOnConsole('Update post response: ${response.statusCode}');

      return response.success;
    } catch (e, s) {
      MyPrint.printOnConsole('Error updating post: $e');
      MyPrint.printOnConsole(s);
      return false;
    }
  }
}
