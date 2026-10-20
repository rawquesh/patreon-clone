import 'dart:convert';

import 'package:patreon_clone/utils/my_utils.dart';

class CreateAudioPostRequestModel {
  String title;
  String description;
  bool isDraft;
  List<String> tags;
  List<String> collections;
  List<String>? tierAccess;
  List<String>? existingAttachments;

  CreateAudioPostRequestModel({
    required this.title,
    this.description = '',
    this.isDraft = false,
    this.tags = const [],
    this.collections = const [],
    this.tierAccess,
    this.existingAttachments,
  });

  Map<String, String> toFields() {
    final Map<String, String> fields = {
      'title': title,
      'description': description,
      'isDraft': isDraft ? 'true' : 'false',
    };
    if (tags.isNotEmpty) fields['tags'] = jsonEncode(tags);
    if (collections.isNotEmpty) fields['collections'] = jsonEncode(collections);
    if (tierAccess != null && tierAccess!.isNotEmpty) {
      fields['tierAccess'] = jsonEncode(tierAccess);
    }
    if (existingAttachments != null && existingAttachments!.isNotEmpty) {
      fields['existingAttachments'] = jsonEncode(existingAttachments);
    }
    return fields;
  }

  @override
  String toString() => MyUtils.encodeJson(toFields());
}