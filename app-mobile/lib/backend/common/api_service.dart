import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import 'package:patreon_clone/constants/shared_preference_constants.dart';
import 'package:patreon_clone/constants/api_constants.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/common/data_model/paginated_request_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/helpers/parsing_helper.dart';
import 'package:patreon_clone/managers/shared_pref_manager.dart';
import 'api_exception.dart';
import 'api_response.dart';

/// Centralized API Service that handles all HTTP communication.
///
/// Features:
/// - Automatic Bearer token injection
/// - Request/Response logging
/// - Standardized error handling
/// - Support for GET, POST, PUT, DELETE, and multipart requests
class ApiService {
  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  /// Base URL for all API requests
  String get baseUrl => ApiUrls.prodBaseUrl;

  /// HTTP client - can be overridden for testing
  http.Client? _client;
  http.Client get client => _client ?? http.Client();
  set client(http.Client client) => _client = client;

  // ==========================================================================
  // CORE HTTP METHODS
  // ==========================================================================

  /// Performs a GET request
  ///
  /// [endpoint] - API endpoint (e.g., '/users/profile')
  /// [queryParams] - Optional query parameters
  /// [includeAuth] - Whether to include Authorization header (default: true)
  /// [customHeaders] - Optional custom headers to merge
  Future<ApiResponse<Map<String, dynamic>>> get(
    String endpoint, {
    Map<String, String>? queryParams,
    bool includeAuth = true,
    Map<String, String>? customHeaders,
  }) async {
    final tag = MyUtils.getNewId();
    _logRequest('GET', endpoint, tag);

    try {
      final uri = _buildUri(endpoint, queryParams);
      final headers = await _buildHeaders(includeAuth: includeAuth, customHeaders: customHeaders);

      final response = await client.get(uri, headers: headers);

      return _handleResponse(response, endpoint, tag);
    } catch (e, s) {
      return _handleException(e, s, endpoint, tag);
    }
  }

  /// Performs a POST request
  ///
  /// [endpoint] - API endpoint
  /// [body] - Request body (will be JSON encoded)
  /// [queryParams] - Optional query parameters
  /// [includeAuth] - Whether to include Authorization header (default: true)
  /// [customHeaders] - Optional custom headers to merge
  Future<ApiResponse<Map<String, dynamic>>> post(
    String endpoint, {
    Object? body,
    Map<String, String>? queryParams,
    bool includeAuth = true,
    Map<String, String>? customHeaders,
  }) async {
    final tag = MyUtils.getNewId();
    _logRequest('POST', endpoint, tag, body: body);

    try {
      final uri = _buildUri(endpoint, queryParams);
      final headers = await _buildHeaders(includeAuth: includeAuth, customHeaders: customHeaders);
      final encodedBody = body != null ? jsonEncode(body) : null;

      final response = await client.post(uri, headers: headers, body: encodedBody);

      return _handleResponse(response, endpoint, tag);
    } catch (e, s) {
      return _handleException(e, s, endpoint, tag);
    }
  }

  /// Performs a PUT request
  ///
  /// [endpoint] - API endpoint
  /// [body] - Request body (will be JSON encoded)
  /// [queryParams] - Optional query parameters
  /// [includeAuth] - Whether to include Authorization header (default: true)
  /// [customHeaders] - Optional custom headers to merge
  Future<ApiResponse<Map<String, dynamic>>> put(
    String endpoint, {
    Object? body,
    Map<String, String>? queryParams,
    bool includeAuth = true,
    Map<String, String>? customHeaders,
  }) async {
    final tag = MyUtils.getNewId();
    _logRequest('PUT', endpoint, tag, body: body);

    try {
      final uri = _buildUri(endpoint, queryParams);
      final headers = await _buildHeaders(includeAuth: includeAuth, customHeaders: customHeaders);
      final encodedBody = body != null ? jsonEncode(body) : null;

      final response = await client.put(uri, headers: headers, body: encodedBody);

      return _handleResponse(response, endpoint, tag);
    } catch (e, s) {
      return _handleException(e, s, endpoint, tag);
    }
  }

  /// Performs a DELETE request
  ///
  /// [endpoint] - API endpoint
  /// [body] - Optional request body (will be JSON encoded)
  /// [queryParams] - Optional query parameters
  /// [includeAuth] - Whether to include Authorization header (default: true)
  /// [customHeaders] - Optional custom headers to merge
  Future<ApiResponse<Map<String, dynamic>>> delete(
    String endpoint, {
    Object? body,
    Map<String, String>? queryParams,
    bool includeAuth = true,
    Map<String, String>? customHeaders,
  }) async {
    final tag = MyUtils.getNewId();
    _logRequest('DELETE', endpoint, tag, body: body);

    try {
      final uri = _buildUri(endpoint, queryParams);
      final headers = await _buildHeaders(includeAuth: includeAuth, customHeaders: customHeaders);
      final encodedBody = body != null ? jsonEncode(body) : null;

      final response = await client.delete(uri, headers: headers, body: encodedBody);

      return _handleResponse(response, endpoint, tag);
    } catch (e, s) {
      return _handleException(e, s, endpoint, tag);
    }
  }

  // ==========================================================================
  // MULTIPART REQUESTS (File Uploads)
  // ==========================================================================

  /// Performs a multipart request for file uploads
  ///
  /// [method] - HTTP method (POST, PUT)
  /// [endpoint] - API endpoint
  /// [fields] - Form fields
  /// [files] - List of files to upload
  /// [includeAuth] - Whether to include Authorization header (default: true)
  Future<ApiResponse<Map<String, dynamic>>> multipartRequest({
    required String method,
    required String endpoint,
    Map<String, String>? fields,
    List<MultipartFileData>? files,
    bool includeAuth = true,
  }) async {
    final tag = MyUtils.getNewId();
    _logRequest('MULTIPART $method', endpoint, tag, body: fields);

    try {
      final uri = _buildUri(endpoint, null);
      final token = includeAuth ? await SharedPrefManager().getString(SharedPreferenceConstants.authToken) : null;

      final request = http.MultipartRequest(method, uri);

      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      // Add fields
      if (fields != null) {
        request.fields.addAll(fields);
      }

      // Add files
      if (files != null) {
        for (final fileData in files) {
          final file = await http.MultipartFile.fromPath(
            fileData.field,
            fileData.filePath,
            filename: fileData.filename,
            contentType: fileData.contentType,
          );
          request.files.add(file);
        }
      }

      MyPrint.printOnConsole(
        'MULTIPART: ${request.files.length} files, ${request.fields.length} fields [Tag: $tag]',
        tag: tag,
      );

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      return _handleResponse(response, endpoint, tag);
    } catch (e, s) {
      return _handleException(e, s, endpoint, tag);
    }
  }

  /// Performs a raw multipart request with more control over file streams
  /// Useful for large file uploads where you want to control the byte stream
  Future<ApiResponse<Map<String, dynamic>>> multipartRequestWithStream({
    required String method,
    required String endpoint,
    Map<String, String>? fields,
    required String fileField,
    required Stream<List<int>> fileStream,
    required int fileLength,
    required String filename,
    MediaType? contentType,
    bool includeAuth = true,
  }) async {
    final tag = MyUtils.getNewId();
    _logRequest('MULTIPART STREAM $method', endpoint, tag);

    try {
      final uri = _buildUri(endpoint, null);
      final token = includeAuth ? await SharedPrefManager().getString(SharedPreferenceConstants.authToken) : null;

      final request = http.MultipartRequest(method, uri);

      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      if (fields != null) {
        request.fields.addAll(fields);
      }

      final multipartFile = http.MultipartFile(
        fileField,
        fileStream,
        fileLength,
        filename: filename,
        contentType: contentType,
      );
      request.files.add(multipartFile);

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      return _handleResponse(response, endpoint, tag);
    } catch (e, s) {
      return _handleException(e, s, endpoint, tag);
    }
  }

  // ==========================================================================
  // RAW REQUESTS (For special cases like S3 uploads)
  // ==========================================================================

  /// Performs a raw request without base URL (for external APIs like S3)
  Future<http.Response> rawRequest({
    required String method,
    required String url,
    Map<String, String>? headers,
    List<int>? bodyBytes,
  }) async {
    final tag = MyUtils.getNewId();
    MyPrint.printOnConsole('RAW $method: $url [Tag: $tag]', tag: tag);

    try {
      final uri = Uri.parse(url);
      final request = http.Request(method, uri);

      if (headers != null) {
        request.headers.addAll(headers);
      }

      if (bodyBytes != null) {
        request.bodyBytes = bodyBytes;
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      MyPrint.printOnConsole(
        'RAW Response: ${response.statusCode} [Tag: $tag]',
        tag: tag,
      );

      return response;
    } catch (e, s) {
      MyPrint.printOnConsole('RAW Request Error: $e [Tag: $tag]', tag: tag);
      MyPrint.printOnConsole(s, tag: tag);
      rethrow;
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /// Builds the full URI with base URL and query parameters
  Uri _buildUri(String endpoint, Map<String, String>? queryParams) {
    final uri = Uri.parse('$baseUrl$endpoint');
    if (queryParams != null && queryParams.isNotEmpty) {
      return uri.replace(queryParameters: queryParams);
    }
    return uri;
  }

  /// Builds headers with optional Authorization
  Future<Map<String, String>> _buildHeaders({
    required bool includeAuth,
    Map<String, String>? customHeaders,
  }) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    if (customHeaders != null) {
      headers.addAll(customHeaders);
    }

    return headers;
  }

  /// Logs the request details
  void _logRequest(String method, String endpoint, String tag, {Object? body}) {
    MyPrint.printOnConsole('$method: $endpoint [Tag: $tag]', tag: tag);
    if (body != null) {
      MyPrint.printOnConsole('Request Body: $body [Tag: $tag]', tag: tag);
    }
  }

  /// Handles the HTTP response and returns ApiResponse
  ApiResponse<Map<String, dynamic>> _handleResponse(
    http.Response response,
    String endpoint,
    String tag,
  ) {
    MyPrint.printOnConsole(
      'Response: ${response.statusCode} [Tag: $tag]',
      tag: tag,
    );

    if (response.body.isNotEmpty) {
      MyPrint.printOnConsole(
        'Response Body: ${response.body.length > 500 ? '${response.body.substring(0, 500)}...' : response.body} [Tag: $tag]',
        tag: tag,
      );
    }

    if (_isSuccessStatusCode(response.statusCode)) {
      try {
        final data = response.body.isNotEmpty ? jsonDecode(response.body) : <String, dynamic>{};

        // Ensure we return a Map<String, dynamic>
        final Map<String, dynamic> resultData;
        if (data is Map<String, dynamic>) {
          resultData = data;
        } else if (data is List) {
          resultData = {'data': data};
        } else {
          resultData = {'data': data};
        }

        return ApiResponse.success(
          data: resultData,
          statusCode: response.statusCode,
        );
      } catch (e) {
        MyPrint.printOnConsole('JSON Parse Error: $e [Tag: $tag]', tag: tag);
        return ApiResponse.error(
          statusCode: response.statusCode,
          errorMessage: 'Failed to parse response',
        );
      }
    } else {
      String errorMessage;
      try {
        final errorData = response.body.isNotEmpty ? jsonDecode(response.body) : null;
        if (errorData is Map<String, dynamic>) {
          final msg = errorData['message'];
          if (msg != null) {
            if (msg is String) {
              errorMessage = msg;
            } else if (msg is List) {
              // Flatten array messages (validation errors) into one readable string
              final parts = <String>[];
              for (final item in msg) {
                if (item is String && item.isNotEmpty) {
                  parts.add(item);
                } else if (item is Map) {
                  parts.add(item.toString());
                }
              }
              errorMessage = parts.isNotEmpty ? parts.join('; ') : _statusMessage(response.statusCode);
            } else {
              errorMessage = msg.toString();
            }
          } else if (errorData['error'] is String) {
            // Fall back to error field (status name from NestJS default filter)
            errorMessage = errorData['error'] ?? _statusMessage(response.statusCode);
          } else {
            errorMessage = _statusMessage(response.statusCode);
          }
        } else if (response.body.isNotEmpty) {
          errorMessage = response.body;
        } else {
          errorMessage = _statusMessage(response.statusCode);
        }
      } catch (_) {
        errorMessage = response.body.isNotEmpty ? response.body : _statusMessage(response.statusCode);
      }

      MyPrint.printOnConsole(
        '❌ API Error: $errorMessage [Tag: $tag]',
        tag: tag,
      );

      return ApiResponse.error(
        statusCode: response.statusCode,
        errorMessage: errorMessage,
      );
    }
  }

  /// Handles exceptions and returns ApiResponse
  ApiResponse<Map<String, dynamic>> _handleException(
    Object e,
    StackTrace s,
    String endpoint,
    String tag,
  ) {
    MyPrint.printOnConsole('❌ Exception: $e [Tag: $tag]', tag: tag);
    MyPrint.printOnConsole(s, tag: tag);

    String errorMessage;
    int statusCode;

    if (e is SocketException) {
      errorMessage = 'No internet connection';
      statusCode = 0;
    } else if (e is HttpException) {
      errorMessage = 'HTTP error occurred';
      statusCode = 0;
    } else if (e is FormatException) {
      errorMessage = 'Invalid response format';
      statusCode = 0;
    } else {
      errorMessage = e.toString();
      statusCode = 0;
    }

    return ApiResponse.error(
      statusCode: statusCode,
      errorMessage: errorMessage,
    );
  }

  /// Checks if status code indicates success
  bool _isSuccessStatusCode(int statusCode) {
    return statusCode >= 200 && statusCode < 300;
  }

  /// Returns a human-readable message for a given HTTP status code.
  String _statusMessage(int statusCode) {
    switch (statusCode) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. Please try again.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'Request failed. Please try again.';
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /// Gets the current auth token
  Future<String?> getAuthToken() async {
    return SharedPrefManager().getString(SharedPreferenceConstants.authToken);
  }

  /// Checks if user has valid auth token
  Future<bool> hasAuthToken() async {
    final token = await getAuthToken();
    return token != null && token.isNotEmpty;
  }

  // ==========================================================================
  // PAGINATION
  // ==========================================================================

  /// Fetches a paginated list from the API with automatic state management.
  ///
  /// This method handles:
  /// - Automatic page/limit query params
  /// - Loading state management
  /// - Cache checking
  /// - Deduplication of items by ID
  /// - Pagination tracking (currentPage, hasMore, totalPages)
  ///
  /// Example:
  /// ```dart
  /// await apiService.getPaginatedList(PaginatedRequestModel(
  ///   paginatedListModel: myListModel,
  ///   endpoint: ApiEndpoints.posts,
  ///   dataListKey: 'posts',
  ///   fromMap: (data) => PostModel.fromMap(data),
  /// ));
  /// ```
  Future<void> getPaginatedList<T>(PaginatedRequestModel<T> request) async {
    final tag = MyUtils.getNewId();
    final model = request.paginatedListModel;
    final limit = request.pageLimit ?? model.contentsDocumentLimitForPagination.get();

    MyPrint.printOnConsole(
      'Pagination: ${request.endpoint} (refresh: ${request.isRefresh}) [Tag: $tag]',
      tag: tag,
    );

    // Return cached data if requested and available
    if (!request.isRefresh && request.isFromCache && model.contentsLength > 0) {
      MyPrint.printOnConsole('Returning cached data [Tag: $tag]', tag: tag);
      return;
    }

    // Reset state on refresh
    if (request.isRefresh) {
      model.reset(isNotify: false);
      model.hasMoreContents.set(value: true, isNotify: false);
      model.isContentsFirstTimeLoading.set(value: true, isNotify: request.isNotify);
      model.currentPage.set(value: 1, isNotify: false);
    }

    // Check if more content is available
    if (!model.hasMoreContents.get()) {
      MyPrint.printOnConsole('No more content available [Tag: $tag]', tag: tag);
      _finalizePagination(model, tag);
      return;
    }

    // Prevent concurrent loading
    if (model.isContentsLoading.get()) {
      MyPrint.printOnConsole('Already loading [Tag: $tag]', tag: tag);
      return;
    }

    model.isContentsLoading.set(value: true, isNotify: request.isNotify);

    try {
      final currentPage = model.currentPage.get();

      // Build query params with pagination
      final queryParams = <String, String>{
        ...request.queryParams,
        'page': currentPage.toString(),
        'limit': limit.toString(),
      };

      final response = await get(request.endpoint, queryParams: queryParams);

      if (response.success && response.data != null) {
        final data = response.data!;

        // Validate response structure
        if (!data.containsKey(request.dataListKey)) {
          MyPrint.printOnConsole('Missing "${request.dataListKey}" in response [Tag: $tag]', tag: tag);
          model.hasMoreContents.set(value: false, isNotify: false);
          _finalizePagination(model, tag);
          return;
        }

        // Parse items
        final rawList = data[request.dataListKey] as List<dynamic>;
        final items = rawList.map((item) => request.fromMap(ParsingHelper.parseMapMethod(item))).whereType<T>().toList();

        // Handle pagination metadata
        int pageFromApi = currentPage;
        int totalPages = 1;
        bool hasMore = false;

        if (data.containsKey('pagination')) {
          final pagination = data['pagination'] as Map<String, dynamic>;
          pageFromApi = ParsingHelper.parseIntMethod(pagination['page']);
          totalPages = ParsingHelper.parseIntMethod(pagination['totalPages']);
          hasMore = pageFromApi < totalPages;
        } else {
          hasMore = items.length >= limit;
        }

        // Update pagination state
        model.currentPage.set(value: hasMore ? pageFromApi + 1 : pageFromApi, isNotify: false);
        model.totalPages.set(value: totalPages, isNotify: false);
        model.hasMoreContents.set(value: hasMore, isNotify: false);

        // Update list (with deduplication on append)
        if (request.isRefresh) {
          model.contentsList.setList(list: items, isClear: true, isNotify: request.isNotify);
        } else {
          _appendWithDedup(model, items, request.isNotify);
        }

        MyPrint.printOnConsole(
          'Loaded ${items.length} items (page $pageFromApi/$totalPages) [Tag: $tag]',
          tag: tag,
        );
      } else {
        MyPrint.printOnConsole('API Error: ${response.statusCode} [Tag: $tag]', tag: tag);
        if (request.isRefresh) {
          model.contentsList.setList(list: [], isClear: true, isNotify: false);
        }
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Exception: $e [Tag: $tag]', tag: tag);
      MyPrint.printOnConsole(s, tag: tag);
      if (request.isRefresh) {
        model.contentsList.setList(list: [], isClear: true, isNotify: false);
      }
    } finally {
      _finalizePagination(model, tag);
    }
  }

  /// Finalizes pagination loading state
  void _finalizePagination<T>(APIDocumentsPaginatedListModel<T> model, String tag) {
    if (model.isContentsFirstTimeLoading.get()) {
      model.isContentsFirstTimeLoading.set(value: false, isNotify: false);
    }
    if (model.isContentsLoading.get()) {
      model.isContentsLoading.set(value: false, isNotify: true);
    } else {
      model.hasMoreContents.set(value: model.hasMoreContents.get(), isNotify: true);
    }
    MyPrint.printOnConsole('Pagination complete [Tag: $tag]', tag: tag);
  }

  /// Appends items to list with ID-based deduplication
  void _appendWithDedup<T>(APIDocumentsPaginatedListModel<T> model, List<T> items, bool isNotify) {
    final existing = model.contentsList.getList(isNewInstance: false);
    final existingIds = existing.map((e) => ((e as dynamic).id as String?) ?? '').where((id) => id.isNotEmpty).toSet();

    final unique = <T>[];
    for (final item in items) {
      final id = ((item as dynamic).id as String?) ?? '';
      if (id.isEmpty || !existingIds.contains(id)) {
        if (id.isNotEmpty) existingIds.add(id);
        unique.add(item);
      }
    }

    if (unique.isNotEmpty) {
      model.contentsList.setList(list: unique, isClear: false, isNotify: isNotify);
    }
  }

  // ==========================================================================
  // THROWING VARIANTS (For exception-based error handling)
  // ==========================================================================

  /// Performs a GET request and throws ApiException on failure.
  /// Use this when you prefer try/catch over checking ApiResponse.success
  Future<Map<String, dynamic>> getOrThrow(
    String endpoint, {
    Map<String, String>? queryParams,
    bool includeAuth = true,
    Map<String, String>? customHeaders,
  }) async {
    final response = await get(
      endpoint,
      queryParams: queryParams,
      includeAuth: includeAuth,
      customHeaders: customHeaders,
    );
    return _throwIfError(response, endpoint);
  }

  /// Performs a POST request and throws ApiException on failure.
  Future<Map<String, dynamic>> postOrThrow(
    String endpoint, {
    Object? body,
    Map<String, String>? queryParams,
    bool includeAuth = true,
    Map<String, String>? customHeaders,
  }) async {
    final response = await post(
      endpoint,
      body: body,
      queryParams: queryParams,
      includeAuth: includeAuth,
      customHeaders: customHeaders,
    );
    return _throwIfError(response, endpoint);
  }

  /// Performs a PUT request and throws ApiException on failure.
  Future<Map<String, dynamic>> putOrThrow(
    String endpoint, {
    Object? body,
    Map<String, String>? queryParams,
    bool includeAuth = true,
    Map<String, String>? customHeaders,
  }) async {
    final response = await put(
      endpoint,
      body: body,
      queryParams: queryParams,
      includeAuth: includeAuth,
      customHeaders: customHeaders,
    );
    return _throwIfError(response, endpoint);
  }

  /// Performs a DELETE request and throws ApiException on failure.
  Future<Map<String, dynamic>> deleteOrThrow(
    String endpoint, {
    Object? body,
    Map<String, String>? queryParams,
    bool includeAuth = true,
    Map<String, String>? customHeaders,
  }) async {
    final response = await delete(
      endpoint,
      body: body,
      queryParams: queryParams,
      includeAuth: includeAuth,
      customHeaders: customHeaders,
    );
    return _throwIfError(response, endpoint);
  }

  /// Converts an ApiResponse to data or throws ApiException
  Map<String, dynamic> _throwIfError(
    ApiResponse<Map<String, dynamic>> response,
    String endpoint,
  ) {
    if (response.success && response.data != null) {
      return response.data!;
    }
    throw ApiException(
      statusCode: response.statusCode,
      message: response.errorMessage ?? 'Request failed',
      endpoint: endpoint,
    );
  }
}

/// Data class for multipart file uploads
class MultipartFileData {
  final String field;
  final String filePath;
  final String? filename;
  final MediaType? contentType;

  MultipartFileData({
    required this.field,
    required this.filePath,
    this.filename,
    this.contentType,
  });

  /// Creates from a File object
  factory MultipartFileData.fromFile({
    required String field,
    required File file,
    String? filename,
    MediaType? contentType,
  }) {
    return MultipartFileData(
      field: field,
      filePath: file.path,
      filename: filename ?? file.path.split('/').last.split('\\').last,
      contentType: contentType,
    );
  }
}
