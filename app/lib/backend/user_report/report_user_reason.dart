enum ReportUserReason {
  spam,
  impersonation,
  harassment,
  hateSpeech,
  inappropriateProfile,
  scamOrFraud,
  underageUser,
  other;

  String get apiValue {
    switch (this) {
      case ReportUserReason.spam:
        return 'spam';
      case ReportUserReason.impersonation:
        return 'impersonation';
      case ReportUserReason.harassment:
        return 'harassment';
      case ReportUserReason.hateSpeech:
        return 'hate_speech';
      case ReportUserReason.inappropriateProfile:
        return 'inappropriate_profile';
      case ReportUserReason.scamOrFraud:
        return 'scam_or_fraud';
      case ReportUserReason.underageUser:
        return 'underage_user';
      case ReportUserReason.other:
        return 'other';
    }
  }

  String get displayName {
    switch (this) {
      case ReportUserReason.spam:
        return 'Spam';
      case ReportUserReason.impersonation:
        return 'Impersonation';
      case ReportUserReason.harassment:
        return 'Harassment';
      case ReportUserReason.hateSpeech:
        return 'Hate Speech';
      case ReportUserReason.inappropriateProfile:
        return 'Inappropriate Profile';
      case ReportUserReason.scamOrFraud:
        return 'Scam or Fraud';
      case ReportUserReason.underageUser:
        return 'Underage User';
      case ReportUserReason.other:
        return 'Other';
    }
  }
}
