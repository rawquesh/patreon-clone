import 'dart:convert';
import 'dart:developer';

import 'package:patreon_clone/backend/common/api_endpoints.dart';
import 'package:patreon_clone/backend/common/api_service.dart';
import 'package:patreon_clone/constants/constants.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/common/data_model/paginated_request_model.dart';
import 'package:patreon_clone/models/creator/creator_model.dart';
import 'package:patreon_clone/models/creator/creator_stats_data_model.dart';
import 'package:patreon_clone/models/membership/membership_model.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/models/subscription/subscription_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';
import 'package:patreon_clone/backend/creator/my_creator_provider.dart';

class MyCreatorController {
  late MyCreatorProvider _myCreatorProvider;
  final ApiService _apiService = ApiService();

  MyCreatorController({required MyCreatorProvider? myCreatorProvider}) {
    _myCreatorProvider = myCreatorProvider ?? MyCreatorProvider();
  }

  MyCreatorProvider get myCreatorProvider => _myCreatorProvider;

  Future<List<CreatorModel>> getTopCreators() async {
    try {
      final response = await _apiService.get(ApiEndpoints.homeTopCreators);

      if (response.success && response.data != null) {
        final List<dynamic> jsonList = response.data!['data'] ?? response.data!;
        return jsonList.map((jsonItem) => CreatorModel.fromMap(jsonItem)).toList();
      }
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in getTopCreators: $e");
    }
    return [];
  }

  /// Get creators by specific category with optional limit
  Future<List<CreatorModel>> getCreatorsByCategory({
    required String category,
    int? limit,
  }) async {
    try {
      final queryParams = <String, String>{'category': category};
      if (limit != null) {
        queryParams['limit'] = limit.toString();
      }

      final response = await _apiService.get(
        ApiEndpoints.homeTopByCategory,
        queryParams: queryParams,
      );

      if (response.success && response.data != null) {
        final List<dynamic> jsonList = response.data!['data'] ?? response.data!;
        return jsonList.map((jsonItem) => CreatorModel.fromMap(jsonItem)).toList();
      }
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in getCreatorsByCategory for category '$category': $e");
    }
    return [];
  }

  /// Get creators for all categories at once
  /// Returns a map where key is category name and value is list of creators
  Future<Map<String, List<CreatorModel>>> getAllCategoriesCreators({
    int? limit,
  }) async {
    Map<String, List<CreatorModel>> categoryCreators = {};

    try {
      List<Future<MapEntry<String, List<CreatorModel>>>> futures = categories.map((category) async {
        List<CreatorModel> creators = await getCreatorsByCategory(
          category: category,
          limit: limit,
        );
        return MapEntry(category, creators);
      }).toList();

      List<MapEntry<String, List<CreatorModel>>> results = await Future.wait(futures);
      categoryCreators = Map.fromEntries(results);

      MyPrint.printOnConsole("✅ Successfully fetched creators for ${categoryCreators.length} categories");
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in getAllCategoriesCreators: $e");
    }

    return categoryCreators;
  }

  Future<void> getApiTopCreatorsPaginatedList({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole(
        "MyCreatorController().getApiProductsPaginatedList called with isRefresh:$isRefresh, isFromCache:$isFromCache",
        tag: tag);

    MyCreatorProvider provider = myCreatorProvider;

    try {
      APIDocumentsPaginatedListModel<CreatorModel> paginatedListModel = provider.creatorsPaginationModel.get();

      await _apiService.getPaginatedList(PaginatedRequestModel<CreatorModel>(
        paginatedListModel: paginatedListModel,
        endpoint: ApiEndpoints.homeTopCreators,
        dataListKey: '',
        isRefresh: isRefresh,
        isFromCache: isFromCache,
        isNotify: isNotify,
        pageLimit: paginatedListModel.contentsDocumentLimitForPagination.get(),
        fromMap: (data) {
          if (data.isEmpty) {
            MyPrint.printOnConsole("⚠️ Skipping empty creator data", tag: tag);
            return null;
          }
          CreatorModel creator = CreatorModel.fromMap(data);
          MyPrint.printOnConsole("Parsed creator ID: ${creator.id}", tag: tag);
          return creator;
        },
      ));
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in getApiProductsPaginatedList: $e", tag: tag);
    }
  }

  Future<void> getApiCreatorsByCategoryPaginatedList({
    required String category,
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole(
        "MyCreatorController().getApiCreatorsByCategoryPaginatedList called for category: $category with isRefresh:$isRefresh, isFromCache:$isFromCache",
        tag: tag);

    MyCreatorProvider provider = myCreatorProvider;

    try {
      APIDocumentsPaginatedListModel<CreatorModel> paginatedListModel = provider.creatorsPaginationModel.get();

      await _apiService.getPaginatedList(PaginatedRequestModel<CreatorModel>(
        paginatedListModel: paginatedListModel,
        endpoint: ApiEndpoints.homeTopByCategory,
        dataListKey: 'data',
        queryParams: {'category': category},
        isRefresh: isRefresh,
        isFromCache: isFromCache,
        isNotify: isNotify,
        pageLimit: paginatedListModel.contentsDocumentLimitForPagination.get(),
        fromMap: (data) {
          if (data.isEmpty) {
            MyPrint.printOnConsole("⚠️ Skipping empty creator data", tag: tag);
            return null;
          }
          CreatorModel creator = CreatorModel.fromMap(data);
          MyPrint.printOnConsole("Parsed creator ID: ${creator.id}", tag: tag);
          return creator;
        },
      ));
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in getApiCreatorsByCategoryPaginatedList for category '$category': $e", tag: tag);
    }
  }

  Future<void> getCreator({required String userName}) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole("MyCreatorController().getCreator called for userName: $userName", tag: tag);

    MyCreatorProvider provider = myCreatorProvider;

    try {
      final response = await _apiService.get(ApiEndpoints.creator(userName));

      MyPrint.printOnConsole("Response from creator: ${response.data}", tag: tag);

      if (!response.success || response.data == null || response.data!.isEmpty) {
        MyPrint.printOnConsole("⚠️ No data found for creator", tag: tag);
        return;
      }

      CreatorModel creator = CreatorModel.fromMap(response.data!);
      provider.creatorModel.set(value: creator, isNotify: true);
      MyPrint.printOnConsole("✅ Creator fetched successfully", tag: tag);
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in getCreator: $e", tag: tag);
    }
  }

  static Future<CreatorModel?> fetchCreator({required String userName}) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole("MyCreatorController().fetchCreator called for userName: $userName", tag: tag);

    try {
      final response = await ApiService().get(ApiEndpoints.creator(userName));

      MyPrint.printOnConsole("Response from creator: ${response.data}", tag: tag);

      if (!response.success || response.data == null || response.data!.isEmpty) {
        MyPrint.printOnConsole("⚠️ No data found for creator", tag: tag);
        return null;
      }

      return CreatorModel.fromMap(response.data!);
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in fetchCreator: $e", tag: tag);
    }
    return null;
  }

  Future<void> getCreatorMemberships({
    required String creatorId,
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole("MyCreatorController().getCreatorMemberships called for creatorId: $creatorId", tag: tag);

    try {
      if (!isRefresh &&
          isFromCache &&
          myCreatorProvider.membershipsCacheCreatorId.get() == creatorId &&
          myCreatorProvider.creatorMemberships.length > 0) {
        myCreatorProvider.isMembershipsLoading.set(value: false, isNotify: isNotify);
        MyPrint.printOnConsole('Returning cached memberships', tag: tag);
        return;
      }

      myCreatorProvider.isMembershipsLoading.set(value: true, isNotify: isNotify);

      final response = await _apiService.get(ApiEndpoints.membershipsByCreator(creatorId));

      MyPrint.printOnConsole("Response from memberships: ${response.data}", tag: tag);

      if (!response.success || response.data == null) {
        MyPrint.printOnConsole("⚠️ No memberships found for creator", tag: tag);
        myCreatorProvider.creatorMemberships.setList(list: [], isClear: true, isNotify: true);
        return;
      }

      List<dynamic> jsonList = [];

      if (response.data!.containsKey('data')) {
        if (response.data!['data'] is List) {
          jsonList = response.data!['data'] as List<dynamic>;
        }
      } else if (response.data! is List) {
        jsonList = response.data! as List<dynamic>;
      }

      if (jsonList.isEmpty) {
        MyPrint.printOnConsole("⚠️ No memberships found for creator", tag: tag);
        myCreatorProvider.creatorMemberships.setList(list: [], isClear: true, isNotify: true);
        return;
      }

      List<MembershipModel> memberships = jsonList.map((jsonItem) => MembershipModel.fromMap(jsonItem)).toList();

      memberships.sort((a, b) {
        if (a.isFree && !b.isFree) return -1;
        if (!a.isFree && b.isFree) return 1;
        return a.monthlyRate.compareTo(b.monthlyRate);
      });

      myCreatorProvider.creatorMemberships.setList(list: memberships, isClear: true, isNotify: false);

      MyPrint.printOnConsole("✅ Successfully fetched ${memberships.length} memberships for creator", tag: tag);
      myCreatorProvider.isMembershipsLoading.set(value: false, isNotify: true);
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in getCreatorMemberships: $e", tag: tag);
      myCreatorProvider.creatorMemberships.setList(list: [], isClear: true, isNotify: true);
      myCreatorProvider.isMembershipsLoading.set(value: false, isNotify: true);
    } finally {
      myCreatorProvider.membershipsCacheCreatorId.set(value: creatorId, isNotify: false);
      myCreatorProvider.isMembershipsLoading.set(value: false, isNotify: isNotify);
    }
  }

  Future<void> getCreatorPostsPaginatedList({
    String creatorId = '',
    String? searchQuery = '',
    String? postType,
    String? tier,
    String? datePublished,
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole(
        "MyCreatorController().getCreatorPostsPaginatedList called for creatorId: $creatorId with searchQuery: '$searchQuery', isRefresh:$isRefresh, isFromCache:$isFromCache",
        tag: tag);

    try {
      if (!isRefresh &&
          isFromCache &&
          myCreatorProvider.postsCacheCreatorId.get() == creatorId &&
          myCreatorProvider.postsListPaginationModel.get().contentsLength > 0) {
        MyPrint.printOnConsole('Returning cached posts', tag: tag);
        return;
      }

      final Map<String, String> queryParams = <String, String>{};

      if (searchQuery != null && searchQuery.isNotEmpty) {
        queryParams['search'] = searchQuery;
      }

      if (postType != null && postType.toLowerCase() != 'all') {
        queryParams['types'] = jsonEncode([postType.toLowerCase()]);
      }

      if (tier != null && tier.toLowerCase() != 'all') {
        String tierValue = tier.toLowerCase() == 'free' ? 'Free Members' : 'Paid only';
        queryParams['tierAccess'] = jsonEncode([tierValue]);
      }

      if (datePublished != null && datePublished != 'All Time') {
        final Map<String, String> dateMapping = {
          'most recent': 'recent',
          'this week': 'week',
          'this month': 'month',
          'this year': 'year',
        };
        final String? apiValue = dateMapping[datePublished.toLowerCase()];
        if (apiValue != null) {
          queryParams['datePublished'] = apiValue;
        }
      }

      MyPrint.printOnConsole("Query Params: $queryParams", tag: tag);

      await _apiService.getPaginatedList(PaginatedRequestModel<PostModel>(
        paginatedListModel: myCreatorProvider.postsListPaginationModel.get(),
        endpoint: ApiEndpoints.postsByCreator(creatorId),
        dataListKey: 'posts',
        queryParams: queryParams,
        isRefresh: isRefresh,
        isFromCache: isFromCache,
        isNotify: isNotify,
        pageLimit: myCreatorProvider.postsListPaginationModel.get().contentsDocumentLimitForPagination.get(),
        fromMap: (data) {
          if (data.isEmpty) {
            MyPrint.printOnConsole("⚠️ Skipping empty post data", tag: tag);
            return null;
          }
          log("Raw post data: ${(data)}");
          PostModel post = PostModel.fromMap(data);
          MyPrint.printOnConsole("Parsed post ID: ${post.id}", tag: tag);
          return post;
        },
      ));

      MyPrint.printOnConsole("✅ Creator posts pagination completed successfully", tag: tag);
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in getCreatorPostsPaginatedList: $e", tag: tag);
    } finally {
      myCreatorProvider.postsCacheCreatorId.set(value: creatorId, isNotify: false);
    }
  }

  Future<void> getCreatorStats({
    required String creatorId,
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    final String tag = MyUtils.getNewId();
    MyPrint.printOnConsole(
      "MyCreatorController().getCreatorStats called for creatorId: $creatorId",
      tag: tag,
    );

    if (!isRefresh &&
        isFromCache &&
        myCreatorProvider.statsCacheCreatorId.get() == creatorId &&
        myCreatorProvider.creatorStats.get() != null) {
      MyPrint.printOnConsole('Returning cached creator stats', tag: tag);
      return;
    }

    try {
      final response = await _apiService.get(ApiEndpoints.creatorStats(creatorId));

      MyPrint.printOnConsole("✅ Stats response: ${response.data}", tag: tag);

      CreatorStatsModel? stats;
      if (response.success && response.data != null && response.data!.isNotEmpty) {
        final data = response.data!['data'] ?? response.data!;
        if (data is Map<String, dynamic>) {
          stats = CreatorStatsModel.fromMap(Map<String, dynamic>.from(data));
        }

        myCreatorProvider.creatorStats.set(value: stats, isNotify: isNotify);
        myCreatorProvider.statsCacheCreatorId.set(value: creatorId, isNotify: false);
      } else {
        MyPrint.printOnConsole("⚠️ No data received from API", tag: tag);
        myCreatorProvider.creatorStats.set(value: null, isNotify: isNotify);
      }
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in getCreatorStats: $e", tag: tag);
      myCreatorProvider.creatorStats.set(value: null, isNotify: isNotify);
    }
  }

  Future<List<CreatorModel>> searchCreators({required String query}) async {
    try {
      String encodedQuery = Uri.encodeComponent(query);

      final response = await _apiService.get(
        ApiEndpoints.searchCreator,
        queryParams: {'q': encodedQuery},
      );

      if (response.success && response.data != null) {
        final List<dynamic> creatorsJson = response.data!['creators'] ?? [];
        List<CreatorModel> creators = creatorsJson.map((jsonItem) => CreatorModel.fromMap(jsonItem)).toList();

        MyPrint.printOnConsole("✅ Found ${creators.length} creators for query '$query'");
        return creators;
      }
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in searchCreators with query '$query': $e");
    }
    return [];
  }

  Future<void> getUserSubscribedMembershipsPaginatedList({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole(
        "MyCreatorController().getUserSubscribedMembershipsPaginatedList called with isRefresh:$isRefresh isFromCache:$isFromCache isNotify:$isNotify",
        tag: tag);

    APIDocumentsPaginatedListModel<SubscriptionModel> paginatedListModel =
        myCreatorProvider.userSubscriptionsPaginationModel.get();

    try {
      if (!isRefresh && isFromCache && paginatedListModel.contentsLength > 0) {
        MyPrint.printOnConsole('Returning cached user subscriptions', tag: tag);
        return;
      }

      if (isRefresh) {
        paginatedListModel.reset(isNotify: false);
        paginatedListModel.hasMoreContents.set(value: true, isNotify: false);
      }

      if (!paginatedListModel.hasMoreContents.get()) {
        MyPrint.printOnConsole("No more subscriptions to load", tag: tag);
        return;
      }

      paginatedListModel.isContentsLoading.set(value: true, isNotify: isNotify);

      int page = paginatedListModel.currentPage.get();
      int limit = paginatedListModel.contentsDocumentLimitForPagination.get();

      final response = await _apiService.get(
        ApiEndpoints.usersSubscriptions,
        queryParams: {
          'status': 'active',
          'page': page.toString(),
          'limit': limit.toString(),
        },
      );

      if (!response.success || response.data == null) {
        MyPrint.printOnConsole("❌ Failed to fetch subscriptions", tag: tag);
        return;
      }

      List<dynamic> jsonList = response.data!['subscriptions'] ?? [];
      Map<String, dynamic>? paginationData = response.data!['pagination'];

      List<SubscriptionModel> subscriptions =
          jsonList.map((e) => SubscriptionModel.fromMap(ParsingHelper.parseMapMethod(e))).toList();

      if (isRefresh) {
        paginatedListModel.contentsList.setList(list: subscriptions, isClear: true, isNotify: isNotify);
      } else {
        paginatedListModel.contentsList.setList(
          list: [...paginatedListModel.contentsList.getList(), ...subscriptions],
          isClear: false,
          isNotify: isNotify,
        );
      }

      if (paginationData != null) {
        int currentPageFromAPI = ParsingHelper.parseIntMethod(paginationData['page']);
        int totalPagesFromAPI = ParsingHelper.parseIntMethod(paginationData['totalPages']);
        bool hasMore = currentPageFromAPI < totalPagesFromAPI;

        paginatedListModel.currentPage.set(value: hasMore ? currentPageFromAPI + 1 : currentPageFromAPI, isNotify: false);
        paginatedListModel.totalPages.set(value: totalPagesFromAPI, isNotify: false);
        paginatedListModel.hasMoreContents.set(value: hasMore, isNotify: false);
      } else {
        paginatedListModel.hasMoreContents.set(value: false, isNotify: false);
      }
    } catch (e) {
      MyPrint.printOnConsole("❌ Error in getUserSubscribedMembershipsPaginatedList: $e", tag: tag);
    } finally {
      paginatedListModel.isContentsLoading.set(value: false, isNotify: isNotify);
      if (paginatedListModel.isContentsFirstTimeLoading.get()) {
        paginatedListModel.isContentsFirstTimeLoading.set(value: false, isNotify: isNotify);
      }
      myCreatorProvider.notify(isNotify: isNotify);
    }
  }

  Future<Map<String, dynamic>> joinCreatorFree({required String creatorId}) async {
    String tag = MyUtils.getNewId();
    MyPrint.printOnConsole("Joining creator with id: $creatorId", tag: tag);

    try {
      final response = await _apiService.post(ApiEndpoints.membershipSubscribeFree(creatorId));

      MyPrint.printOnConsole('Join creator response: ${response.data}', tag: tag);

      if (response.success && response.data != null) {
        SubscriptionModel? subscription;
        if (response.data!['subscription'] != null) {
          subscription = SubscriptionModel.fromMap(ParsingHelper.parseMapMethod(response.data!['subscription']));

          MyPrint.printOnConsole('Subscription created: ${subscription.id}, Creator: ${subscription.creator?.id}', tag: tag);

          myCreatorProvider.userSubscriptionsPaginationModel
              .get()
              .contentsList
              .insertAtIndex(index: 0, model: subscription, isNotify: true);
        }

        return {
          'success': response.data!['success'] ?? true,
          'message': response.data!['message'] ?? '',
          'subscription': subscription,
        };
      } else {
        return {
          'success': false,
          'message': 'Failed to join creator',
        };
      }
    } catch (e) {
      MyPrint.printOnConsole('Error joining creator: $e', tag: tag);
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }
}
