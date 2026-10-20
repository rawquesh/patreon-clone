import 'package:patreon_clone/utils/my_utils.dart';

class CreateDraftAudioPostRequestModel {
  String title;
  String description;
  bool isDraft;
  String status;
  List<String> tags;
  List<String> collections;
  List<String>? tierAccess;
  List<String>? existingAttachments;

  CreateDraftAudioPostRequestModel({
    required this.title,
    this.description = '',
    this.isDraft = false,
    this.status = '',
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
      'status': status,
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
