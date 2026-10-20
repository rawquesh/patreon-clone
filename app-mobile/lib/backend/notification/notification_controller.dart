import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/notification/notification_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';

import 'notification_provider.dart';
import 'notification_repository.dart';

class MyNotificationController {
  late MyNotificationProvider _provider;

  MyNotificationController({required MyNotificationProvider? provider}) {
    _provider = provider ?? MyNotificationProvider();
  }

  MyNotificationProvider get provider => _provider;

  Future<void> getNotificationsPaginatedList({
    required String userMode,
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole(
        'MyNotificationController.getNotificationsPaginatedList called with userMode:$userMode, isRefresh:$isRefresh, isFromCache:$isFromCache',
        tag: tag);

    APIDocumentsPaginatedListModel<NotificationModel> paginatedListModel = _provider.notificationsPaginationModel.get();

    if (!isRefresh && isFromCache && paginatedListModel.contentsLength > 0) {
      MyPrint.printOnConsole('Returning cached notifications', tag: tag);
      return;
    }

    if (isRefresh) {
      paginatedListModel.reset(isNotify: false);
      paginatedListModel.hasMoreContents.set(value: true, isNotify: false);
      paginatedListModel.isContentsFirstTimeLoading.set(value: true, isNotify: false);
    }

    if (!paginatedListModel.hasMoreContents.get()) {
      MyPrint.printOnConsole('No more notifications to load', tag: tag);
      return;
    }

    if (paginatedListModel.isContentsLoading.get()) {
      MyPrint.printOnConsole('Notifications already loading', tag: tag);
      return;
    }

    paginatedListModel.isContentsLoading.set(value: true, isNotify: isNotify);

    int page = paginatedListModel.currentPage.get();
    int limit = paginatedListModel.contentsDocumentLimitForPagination.get();

    try {
      final response = await NotificationRepository().getNotifications(
        page: page,
        limit: limit,
        userMode: userMode,
      );

      List<dynamic> rawList = response['notifications'] ?? [];
      List<NotificationModel> notifications = rawList
          .map((e) => NotificationModel.fromMap(ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(e)))
          .toList();

      MyPrint.printOnConsole('Notification Loaded ${notifications.length} notifications', tag: tag);

      MyPrint.printOnConsole('Response Pagination: ${response['pagination']}', tag: tag);

      Map<String, dynamic> pagination = ParsingHelper.parseMapMethod<dynamic, dynamic, String, dynamic>(response['pagination']);
      int currentPageFromAPI = ParsingHelper.parseIntMethod(pagination['page']);
      int totalPagesFromAPI = ParsingHelper.parseIntMethod(pagination['totalPages']);
      bool hasMore = currentPageFromAPI < totalPagesFromAPI;

      paginatedListModel.currentPage.set(value: hasMore ? currentPageFromAPI + 1 : currentPageFromAPI, isNotify: false);
      paginatedListModel.totalPages.set(value: totalPagesFromAPI, isNotify: false);
      paginatedListModel.hasMoreContents.set(value: hasMore, isNotify: false);

      if (isRefresh) {
        paginatedListModel.contentsList.setList(list: notifications, isClear: true, isNotify: false);
      } else {
        final current = paginatedListModel.contentsList.getList();
        paginatedListModel.contentsList.setList(list: [...current, ...notifications], isClear: true, isNotify: false);
      }

      _provider.notificationsPaginationModel.set(value: paginatedListModel, isNotify: false);
      _provider.notifications.setList(list: paginatedListModel.contentsList.getList(), isClear: true, isNotify: isNotify);

      int unreadCount = ParsingHelper.parseIntMethod(response['unreadCount']);
      _provider.unreadCount.set(value: unreadCount, isNotify: isNotify);
    } catch (e, s) {
      MyPrint.printOnConsole('Error loading notifications: $e', tag: tag);
      MyPrint.printOnConsole(s, tag: tag);
    } finally {
      paginatedListModel.isContentsFirstTimeLoading.set(value: false, isNotify: false);
      paginatedListModel.isContentsLoading.set(value: false, isNotify: false);
    }
  }
}
