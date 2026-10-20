import 'package:patreon_clone/utils/my_utils.dart';

class CreateDraftLinkPostRequestModel {
  String title;
  String linkUrl;
  String description;
  bool isDraft;
  String status;
  List<String> tags;
  List<String> collections;
  List<String> tierAccess;
  List<String> existingAttachments;

  CreateDraftLinkPostRequestModel({
    required this.title,
    required this.linkUrl,
    this.description = '',
    this.isDraft = false,
    this.status = '',
    this.tags = const [],
    this.collections = const [],
    this.tierAccess = const [],
    this.existingAttachments = const [],
  });

  Map<String, String> toFields() {
    final Map<String, String> fields = {
      'title': title,
      'linkUrl': linkUrl,
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

    return fields;
  }

  @override
  String toString() => MyUtils.encodeJson(toFields());
}
