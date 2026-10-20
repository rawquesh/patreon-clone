import 'package:patreon_clone/helpers/parsing_helper.dart';

class AttachmentModel {
  final String id;
  final String url;
  final String fileName;
  final String fileType;
  final int fileSize;
  final DateTime uploadedAt;

  AttachmentModel({
    this.id = '',
    this.url = '',
    this.fileName = '',
    this.fileType = '',
    this.fileSize = 0,
    DateTime? uploadedAt,
  }) : uploadedAt = uploadedAt ?? DateTime.now();

  factory AttachmentModel.fromMap(Map<String, dynamic> map) {
    return AttachmentModel(
      id: ParsingHelper.parseStringMethod(map['_id']),
      url: ParsingHelper.parseStringMethod(map['url']),
      fileName: ParsingHelper.parseStringMethod(map['fileName']),
      fileType: ParsingHelper.parseStringMethod(map['fileType']),
      fileSize: ParsingHelper.parseIntMethod(map['fileSize']),
      uploadedAt: ParsingHelper.parseDateTimeMethod(map['uploadedAt']),
    );
  }

  Map<String, dynamic> toMap({bool toJson = false}) {
    return {
      "id": id,
      "url": url,
      "fileName": fileName,
      "fileType": fileType,
      "fileSize": fileSize,
      "uploadedAt": toJson ? uploadedAt.toIso8601String() : uploadedAt,
    };
  }
}
