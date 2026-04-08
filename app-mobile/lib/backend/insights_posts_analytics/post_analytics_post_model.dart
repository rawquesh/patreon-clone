class PostAnalyticsPostModel {
  String id;
  String title;
  int impressions;
  int engagements;

  PostAnalyticsPostModel({
    this.id = '',
    this.title = '',
    this.impressions = 0,
    this.engagements = 0,
  });

  factory PostAnalyticsPostModel.fromMap(Map<String, dynamic> map) {
    return PostAnalyticsPostModel(
      id: map['id']?.toString() ?? '',
      title: map['title']?.toString() ?? '',
      impressions: map['impressions'] != null ? int.tryParse(map['impressions'].toString()) ?? 0 : 0,
      engagements: map['engagements'] != null ? int.tryParse(map['engagements'].toString()) ?? 0 : 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'impressions': impressions,
      'engagements': engagements,
    };
  }
}