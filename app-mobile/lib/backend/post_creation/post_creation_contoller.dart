import 'dart:io';

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
import 'package:patreon-clone/backend/post_creation/post_creation_provider.dart';
import 'package:patreon-clone/backend/post_creation/post_creation_repository.dart';

class PostCreationController {
  final PostCreationProvider provider;
  final PostCreationRepository _repository = PostCreationRepository();

  PostCreationController({required this.provider});

  // ... (loadInitialData, updateImagePost, text, and audio methods remain unchanged) ...
  Future<void> loadInitialData() async {
    provider.isLoading.set(value: true, isNotify: true);
    final memberships = await _repository.getMemberships();
    final collections = await _repository.getCollections();
    provider.memberships.setList(list: memberships, isClear: true, isNotify: false);
    provider.collections.setList(list: collections, isClear: true, isNotify: false);
    provider.isLoading.set(value: false, isNotify: true);
  }

  Future<bool> updateImagePost({
    required PostModel post,
    List<File> imageFiles = const [],
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole('Updating image post ${post.id} via controller.');
    return _repository.updateImagePost(
      post: post,
      imageFiles: imageFiles,
      attachments: attachments,
    );
  }

  Future<bool> createTextPost({
    required CreateTextPostRequestModel request,
    List<File> attachments = const [], // ADDED
  }) async {
    MyPrint.printOnConsole(
        "Creating text post with request: ${request.toString()} and attachments: ${attachments.length}, data: ${attachments.map((a) => a.path).toList()}");
    return _repository.createTextPost(request: request, attachments: attachments);
  }

  Future<bool> createDraftTextPost({
    // Corrected typo
    required CreateDraftTextPostRequestModel request,
    List<File> attachments = const [], // ADDED
  }) async {
    MyPrint.printOnConsole("Creating text post with request: ${request.toString()} and attachments: ${attachments.length}");
    return _repository.createDraftTextPost(
        // Corrected typo
        request: request,
        attachments: attachments);
  }

  Future<bool> createVideoPost({
    required CreateVideoPostRequestModel request,
    File? videoFile, // 👈 This parameter is still needed here
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole(
      "Creating video post with request: ${request.toString()} "
      "attachments: ${attachments.length} "
      "videoFile: ${videoFile != null ? videoFile.path : 'none'}",
    );

    // Forward everything to repository
    return _repository.createVideoPost(
      request: request,
      videoFile: videoFile, // 👈 forward here
      attachments: attachments,
    );
  }

  Future<bool> createDraftVideoPost({
    required CreateDraftVideoPostRequestModel request,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole(
        "Creating draft video post with request: ${request.toString()} and attachments: ${attachments.length}");
    return _repository.createDraftVideoPost(request: request, attachments: attachments);
  }

  Future<bool> createAudioPost({
    required CreateAudioPostRequestModel request,
    required File audioFile,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole(
        "Creating audio post with request: ${request.toString()}, audioFile: ${audioFile.path}, and attachments: ${attachments.length}");
    return _repository.createAudioPost(
      request: request,
      audioFile: audioFile,
      attachments: attachments,
    );
  }

  Future<bool> createDraftAudioPost({
    required CreateDraftAudioPostRequestModel request,
    required File audioFile,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole(
        "Creating draft audio post with request: ${request.toString()}, audioFile: ${audioFile.path}, and attachments: ${attachments.length}");
    return _repository.createDraftAudioPost(
      request: request,
      audioFile: audioFile,
      attachments: attachments,
    );
  }

  Future<bool> createImagePost({
    required CreateImagesPostRequestModel request,
    List<File> imageFiles = const [],
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole(
      "Creating image post with request: ${request.toString()}, images: ${imageFiles.length}, attachments: ${attachments.length}",
    );
    return _repository.createImagePost(
      request: request,
      imageFiles: imageFiles,
      attachments: attachments,
    );
  }

  Future<bool> createDraftImagePost({
    required CreateDraftImagesPostRequestModel request,
    List<File> imageFiles = const [],
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole(
      "Creating draft image post with request: ${request.toString()}, images: ${imageFiles.length}, attachments: ${attachments.length}",
    );
    return _repository.createDraftImagePost(
      request: request,
      imageFiles: imageFiles,
      attachments: attachments,
    );
  }

  Future<bool> createLinkPost({
    required CreateLinkPostRequestModel request,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole(
      "Creating link post with request: ${request.toString()}, attachments: ${attachments.length}",
    );
    return _repository.createLinkPost(
      request: request,
      attachments: attachments,
    );
  }

  Future<bool> createDraftLinkPost({
    required CreateDraftLinkPostRequestModel request,
    List<File> attachments = const [],
  }) async {
    MyPrint.printOnConsole(
      "Creating link post with request: ${request.toString()}, attachments: ${attachments.length}",
    );
    return _repository.createDraftLinkPost(
      request: request,
      attachments: attachments,
    );
  }

  Future<bool> updatePost({required PostModel post}) async {
    MyPrint.printOnConsole('Updating post ${post.id}');
    return _repository.updatePost(post: post);
  }
}
