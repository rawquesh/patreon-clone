import 'api_documents_paginated_list_model.dart';

/// Simplified request model for paginated API calls.
///
/// This replaces the more verbose GetAPIDocumentsPaginatedListRequestModel
/// with a cleaner API that doesn't require baseUrl (uses ApiService's baseUrl).
class PaginatedRequestModel<T> {
  /// The paginated list model that holds state and results
  final APIDocumentsPaginatedListModel<T> paginatedListModel;

  /// API endpoint to fetch from (e.g., '/posts', '/users')
  final String endpoint;

  /// Key in response that contains the list data (e.g., 'posts', 'users')
  final String dataListKey;

  /// Function to convert raw map data to typed model
  final T? Function(Map<String, dynamic> data) fromMap;

  /// Additional query parameters to include
  final Map<String, String> queryParams;

  /// Whether to refresh (clear existing and start from page 1)
  final bool isRefresh;

  /// Whether to return cached data if available
  final bool isFromCache;

  /// Whether to notify listeners of state changes
  final bool isNotify;

  /// Override the default page limit
  final int? pageLimit;

  const PaginatedRequestModel({
    required this.paginatedListModel,
    required this.endpoint,
    required this.dataListKey,
    required this.fromMap,
    this.queryParams = const {},
    this.isRefresh = true,
    this.isFromCache = false,
    this.isNotify = true,
    this.pageLimit,
  });
}
