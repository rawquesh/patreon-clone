enum ReportReason {
  spam,
  inappropriateContent,
  harassment,
  hateSpeech,
  violence,
  misinformation,
  copyrightViolation,
  other;

  String get apiValue {
    switch (this) {
      case ReportReason.spam:
        return 'spam';
      case ReportReason.inappropriateContent:
        return 'inappropriate_content';
      case ReportReason.harassment:
        return 'harassment';
      case ReportReason.hateSpeech:
        return 'hate_speech';
      case ReportReason.violence:
        return 'violence';
      case ReportReason.misinformation:
        return 'misinformation';
      case ReportReason.copyrightViolation:
        return 'copyright_violation';
      case ReportReason.other:
        return 'other';
    }
  }

  String get displayName {
    switch (this) {
      case ReportReason.spam:
        return 'Spam';
      case ReportReason.inappropriateContent:
        return 'Inappropriate Content';
      case ReportReason.harassment:
        return 'Harassment';
      case ReportReason.hateSpeech:
        return 'Hate Speech';
      case ReportReason.violence:
        return 'Violence';
      case ReportReason.misinformation:
        return 'Misinformation';
      case ReportReason.copyrightViolation:
        return 'Copyright Violation';
      case ReportReason.other:
        return 'Other';
    }
  }
}
