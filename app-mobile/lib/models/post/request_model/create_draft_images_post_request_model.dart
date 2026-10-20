import 'package:patreon_clone/utils/my_utils.dart';

class CreateDraftImagesPostRequestModel {
  String title;
  String description;
  bool isDraft;
  String status;
  List<String> tags;
  List<String> collections;
  List<String> tierAccess;
  List<String> existingAttachments;
  List<String> existingImages;

  CreateDraftImagesPostRequestModel({
    required this.title,
    this.description = '',
    this.isDraft = false,
    this.status = '',
    this.tags = const [],
    this.collections = const [],
    this.tierAccess = const [],
    this.existingAttachments = const [],
    this.existingImages = const [],
  });

  Map<String, String> toFields() {
    final Map<String, String> fields = {
      'title': title,
      'description': description,
      'isDraft': isDraft ? 'true' : 'false',
      'status': status,
    };

    if (tags.isNotEmpty) fields['tags'] = tags.join(',');
    if (collections.isNotEmpty) fields['collections'] = collections.join(',');
    if (tierAccess.isNotEmpty) fields['tierAccess'] = tierAccess.join(',');
    if (existingAttachments.isNotEmpty) {
      fields['existingAttachments'] = existingAttachments.join(',');
    }
    if (existingImages.isNotEmpty) {
      fields['existingImages'] = existingImages.join(',');
    }

    return fields;
  }

  @override
  String toString() => MyUtils.encodeJson(toFields());
}
