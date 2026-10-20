import 'package:patreon_clone/backend/common/common_provider.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/creator/creator_model.dart';
import 'package:patreon_clone/models/membership/membership_model.dart';
import 'package:patreon_clone/models/creator/creator_stats_data_model.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/models/subscription/subscription_model.dart';
import 'package:patreon_clone/utils/my_print.dart';

class MyCreatorProvider extends CommonProvider {
  MyCreatorProvider() {
    creatorsPaginationModel = CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<CreatorModel>>(
      value: APIDocumentsPaginatedListModel<CreatorModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      notify: notify,
    );

    postsListPaginationModel = CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<PostModel>>(
      value: APIDocumentsPaginatedListModel<PostModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      notify: notify,
    );

    userSubscriptionsPaginationModel = CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<SubscriptionModel>>(
      value: APIDocumentsPaginatedListModel<SubscriptionModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      notify: notify,
    );

    creators = CommonProviderListParameter<CreatorModel>(
      list: <CreatorModel>[],
      notify: notify,
    );

    isSubscribedToViewedCreator = CommonProviderPrimitiveParameter<bool?>(
      value: null,
      notify: notify,
    );

    isCreatorsLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);

    hasMoreCreators = CommonProviderPrimitiveParameter<bool>(value: true, notify: notify);

    selectedCategory = CommonProviderPrimitiveParameter<String?>(value: null, notify: notify);

    categoryCreators = CommonProviderPrimitiveParameter<Map<String, List<CreatorModel>>>(
      value: <String, List<CreatorModel>>{},
      notify: notify,
    );

    creatorModel = CommonProviderPrimitiveParameter<CreatorModel?>(value: null, notify: notify);

    // Membership related
    creatorMemberships = CommonProviderListParameter<MembershipModel>(list: <MembershipModel>[], notify: notify);

    isMembershipsLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);

    selectedMembership = CommonProviderPrimitiveParameter<MembershipModel?>(value: null, notify: notify);

    isSubscriptionStatusLoading = CommonProviderPrimitiveParameter<bool>(value: false, notify: notify);

    postsCacheCreatorId = CommonProviderPrimitiveParameter<String?>(value: null, notify: notify);

    membershipsCacheCreatorId = CommonProviderPrimitiveParameter<String?>(value: null, notify: notify);

    creatorStats = CommonProviderPrimitiveParameter<CreatorStatsModel?>(value: null, notify: notify);

    statsCacheCreatorId = CommonProviderPrimitiveParameter<String?>(value: null, notify: notify);
  }

  // ----------------------
  // Fields
  // ----------------------
  late CommonProviderListParameter<CreatorModel> creators;
  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<CreatorModel>> creatorsPaginationModel;

  late CommonProviderPrimitiveParameter<CreatorModel?> creatorModel;
  late CommonProviderPrimitiveParameter<bool> isCreatorsLoading;
  late CommonProviderPrimitiveParameter<String?> selectedCategory;
  late CommonProviderPrimitiveParameter<Map<String, List<CreatorModel>>> categoryCreators;
  late CommonProviderPrimitiveParameter<bool> hasMoreCreators;

  // Memberships
  late CommonProviderListParameter<MembershipModel> creatorMemberships;
  late CommonProviderPrimitiveParameter<bool> isMembershipsLoading;
  late CommonProviderPrimitiveParameter<MembershipModel?> selectedMembership;

  // Posts
  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<PostModel>> postsListPaginationModel;

  // Subscription status (for viewed creator)
  late CommonProviderPrimitiveParameter<bool?> isSubscribedToViewedCreator;
  late CommonProviderPrimitiveParameter<bool> isSubscriptionStatusLoading;

  // User’s own subscriptions page (My Memberships)
  late CommonProviderPrimitiveParameter<APIDocumentsPaginatedListModel<SubscriptionModel>> userSubscriptionsPaginationModel;

  // Caches
  late CommonProviderPrimitiveParameter<String?> postsCacheCreatorId;
  late CommonProviderPrimitiveParameter<String?> membershipsCacheCreatorId;
  late CommonProviderPrimitiveParameter<CreatorStatsModel?> creatorStats;
  late CommonProviderPrimitiveParameter<String?> statsCacheCreatorId;

  // ----------------------
  // Mutators
  // ----------------------

  void clearCreators({bool isNotify = true}) {
    creators.setList(list: <CreatorModel>[], isClear: true, isNotify: isNotify);
    creatorsPaginationModel.set(
      value: APIDocumentsPaginatedListModel<CreatorModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      isNotify: isNotify,
    );
    isCreatorsLoading.set(value: false, isNotify: isNotify);
    hasMoreCreators.set(value: true, isNotify: isNotify);
  }

  void setSubscriptionStatusForViewedCreator(bool? isSubscribed, {bool isNotify = true}) {
    isSubscribedToViewedCreator.set(value: isSubscribed, isNotify: isNotify);
  }

  /// SILENT by default so it’s safe in dispose()
  void clearSubscriptionStatusForViewedCreator({bool isNotify = false}) {
    isSubscribedToViewedCreator.set(value: null, isNotify: isNotify);
  }

  void setSubscriptionStatusLoading(bool isLoading, {bool isNotify = true}) {
    isSubscriptionStatusLoading.set(value: isLoading, isNotify: isNotify);
  }

  /// SILENT by default so it’s safe in dispose()
  void clearCreatorPosts({bool isNotify = false}) {
    postsListPaginationModel.set(
      value: APIDocumentsPaginatedListModel<PostModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      isNotify: isNotify,
    );
    postsCacheCreatorId.set(value: null, isNotify: false);
    MyPrint.printOnConsole(
      "MyCreatorProvider: Cleared and reset postsListPaginationModel.",
      tag: "ProviderReset",
    );
  }

  /// SILENT by default so it’s safe in dispose()
  void clearMemberships({bool isNotify = false}) {
    creatorMemberships.setList(list: <MembershipModel>[], isClear: true, isNotify: isNotify);
    selectedMembership.set(value: null, isNotify: isNotify);
    isMembershipsLoading.set(value: false, isNotify: isNotify);
    membershipsCacheCreatorId.set(value: null, isNotify: false);
  }

  void clearUserSubscriptions({bool isNotify = true}) {
    userSubscriptionsPaginationModel.set(
      value: APIDocumentsPaginatedListModel<SubscriptionModel>(
        contentsDocumentLimit: 10,
        contentsDocumentRefreshLimit: 3,
      ),
      isNotify: isNotify,
    );
  }

  /// SILENT by default so it’s safe in dispose()
  void clearCreatorStats({bool isNotify = false}) {
    creatorStats.set(value: null, isNotify: isNotify);
    statsCacheCreatorId.set(value: null, isNotify: false);
  }

  /// SILENT by default so it’s safe in dispose()
  void clearAllCreatorData({bool isNotify = false}) {
    creatorModel.set(value: null, isNotify: false);
    clearCreatorPosts(isNotify: false);
    clearMemberships(isNotify: false);
    clearCreatorStats(isNotify: false);
    clearSubscriptionStatusForViewedCreator(isNotify: false);
    if (isNotify) notify();
  }
}
