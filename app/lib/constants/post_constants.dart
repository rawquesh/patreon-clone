class PostTypes {
  static const String text = "text";
  static const String image = "image";
  static const String audio = "audio";
  static const String video = "video";
  static const String link = "link";

  static List<String> get values => [
        text,
        image,
        audio,
        video,
        link,
      ];
}

class PostStatus {
  static const String draft = "draft";
  static const String published = "published";
  static const String archived = "archived";

  static List<String> get values => [
        draft,
        published,
        archived,
      ];
}
