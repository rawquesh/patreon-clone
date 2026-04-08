import 'dart:convert';

/// Custom exception class for API errors.
///
/// Contains status code, message, and optional error data from the server.
/// Use this for exception-based error handling when you prefer try/catch over ApiResponse.
class ApiException implements Exception {
  final int statusCode;
  final String message;
  final dynamic data;
  final String? endpoint;

  ApiException({
    required this.statusCode,
    required this.message,
    this.data,
    this.endpoint,
  });

  /// Returns true if this is an authentication error (401/403)
  bool get isAuthError => statusCode == 401 || statusCode == 403;

  /// Returns true if this is a not found error (404)
  bool get isNotFound => statusCode == 404;

  /// Returns true if this is a server error (5xx)
  bool get isServerError => statusCode >= 500 && statusCode < 600;

  /// Returns true if this is a client error (4xx)
  bool get isClientError => statusCode >= 400 && statusCode < 500;

  /// Returns true if this is a network/connection error
  bool get isNetworkError => statusCode == 0;

  @override
  String toString() {
    return 'ApiException(statusCode: $statusCode, message: $message, endpoint: $endpoint)';
  }

  /// Creates an ApiException from an HTTP response
  factory ApiException.fromResponse({
    required int statusCode,
    required String body,
    String? endpoint,
  }) {
    String message;
    dynamic data;

    try {
      if (body.isNotEmpty) {
        final parsed = jsonDecode(body);
        if (parsed is Map<String, dynamic>) {
          data = parsed;
          message = parsed['message'] ?? parsed['error'] ?? 'Request failed';
        } else {
          message = body;
        }
      } else {
        message = _getDefaultMessage(statusCode);
      }
    } catch (_) {
      message = body.isNotEmpty ? body : _getDefaultMessage(statusCode);
    }

    return ApiException(
      statusCode: statusCode,
      message: message,
      data: data,
      endpoint: endpoint,
    );
  }

  /// Creates an ApiException for network errors
  factory ApiException.networkError({String? endpoint}) {
    return ApiException(
      statusCode: 0,
      message: 'No internet connection',
      endpoint: endpoint,
    );
  }

  /// Creates an ApiException for timeout errors
  factory ApiException.timeout({String? endpoint}) {
    return ApiException(
      statusCode: 408,
      message: 'Request timed out',
      endpoint: endpoint,
    );
  }

  static String _getDefaultMessage(int statusCode) {
    switch (statusCode) {
      case 400:
        return 'Bad request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not found';
      case 408:
        return 'Request timeout';
      case 409:
        return 'Conflict';
      case 422:
        return 'Unprocessable entity';
      case 429:
        return 'Too many requests';
      case 500:
        return 'Internal server error';
      case 502:
        return 'Bad gateway';
      case 503:
        return 'Service unavailable';
      case 504:
        return 'Gateway timeout';
      default:
        return 'Request failed with status $statusCode';
    }
  }
}
