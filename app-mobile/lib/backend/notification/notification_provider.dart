import 'package:patreon_clone/backend/common/common_provider.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/notification/notification_model.dart';

class MyNotificationProvider extends CommonProvider {
  MyNotificationProvider() {
    notifications = CommonProviderListParameter<NotificationModel>(list: [], notify: notify);
    notificationsPaginationModel = CommonProviderPrimitiveParameter(
      value: APIDocumentsPaginatedListModel<NotificationModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      notify: notify,
    );
    unreadCount = CommonProviderPrimitiveParameter<int>(value: 0, notify: notify);
  }

  late CommonProviderListParameter<NotificationModel> notifications;
  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<NotificationModel>> notificationsPaginationModel;
  late CommonProviderPrimitiveParameter<int> unreadCount;
}
