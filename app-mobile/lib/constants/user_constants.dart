class ContentVisibilityTypes {
  static const String male = "male";
  static const String female = "female";
  static const String both = "both";

  static List<String> get values => [
        male,
        female,
        both,
      ];
}

class Gender {
  static const String male = "male";
  static const String female = "female";
  static const String other = "other";

  static List<String> get values => [
        male,
        female,
        other,
      ];
}

class GenderTypes {
  static List<String> get uiValues => ["Male", "Female", "Other"];

  static String? uiToApi(String? uiValue) {
    switch (uiValue) {
      case "Male":
        return Gender.male;
      case "Female":
        return Gender.female;
      case "Other":
        return Gender.other;
      default:
        return null;
    }
  }

  static String? apiToUi(String? apiValue) {
    switch (apiValue) {
      case Gender.male:
        return "Male";
      case Gender.female:
        return "Female";
      case Gender.other:
        return "Other";
      default:
        return null;
    }
  }
}

class GenderPreferenceTypes {
  static List<String> get uiValues => ["Show Both Male and Female", "Show Only Male", "Show Only Female"];

  static String? uiToApi(String? uiValue) {
    switch (uiValue) {
      case "Show Both Male and Female":
        return ContentVisibilityTypes.both;
      case "Show Only Male":
        return ContentVisibilityTypes.male;
      case "Show Only Female":
        return ContentVisibilityTypes.female;
      default:
        return null;
    }
  }

  static String? apiToUi(String? apiValue) {
    switch (apiValue) {
      case ContentVisibilityTypes.both:
        return "Show Both Male and Female";
      case ContentVisibilityTypes.male:
        return "Show Only Male";
      case ContentVisibilityTypes.female:
        return "Show Only Female";
      default:
        return null;
    }
  }
}
