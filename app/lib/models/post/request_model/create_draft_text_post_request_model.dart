import 'package:patreon-clone/utils/my_utils.dart';

class CreateDraftTextPostRequestModel {
  String title;
  String textContent;
  List<String> tags;
  List<String> collections;
  bool isDraft;
  String status;
  List<String>? tierAccess;
  List<String>? existingAttachments;

  CreateDraftTextPostRequestModel({
    required this.title,
    required this.textContent,
    this.tags = const [],
    this.collections = const [],
    this.isDraft = false,
    this.tierAccess,
    this.status = '',
    this.existingAttachments,
  });

  Map<String, String> toFields() {
    final Map<String, String> fields = {
      'title': title,
      'textContent': textContent,
      'status': status,
      'isDraft': isDraft == false ? 'false' : 'true',
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
