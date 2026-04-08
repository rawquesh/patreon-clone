import 'package:patreon-clone/utils/my_utils.dart';

class CreateDraftVideoPostRequestModel {
  String title;
  String videoUrl;
  String description;
  List<String> tags;
  List<String> collections;
  bool isDraft;
  String status;
  List<String>? tierAccess;
  List<String>? existingAttachments;

  CreateDraftVideoPostRequestModel({
    required this.title,
    required this.videoUrl,
    required this.description,
    this.tags = const [],
    this.collections = const [],
    this.isDraft = false,
    this.status = '',
    this.tierAccess,
    this.existingAttachments,
  });

  Map<String, String> toFields() {
    final Map<String, String> fields = {
      'title': title,
      'videoUrl': videoUrl,
      'description': description,
      'status': status,
      'isDraft': isDraft ? 'true' : 'false',
    };
    if (tags.isNotEmpty) fields['tags'] = tags.join(',');
    if (collections.isNotEmpty) fields['collections'] = collections.join(',');
    if (tierAccess != null && tierAccess!.isNotEmpty) {
      fields['tierAccess'] = tierAccess!.join(',');
    }
    if (existingAttachments != null && existingAttachments!.isNotEmpty) {
      fields['existingAttachments'] = existingAttachments!.join(',');
    }
    return fields;
  }

  @override
  String toString() => MyUtils.encodeJson(toFields());
}
