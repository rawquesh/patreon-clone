/// Wrapper model for consistent API responses.
///
/// Provides a unified way to handle both successful and failed API responses.
class ApiResponse<T> {
  final bool success;
  final T? data;
  final int statusCode;
  final String? message;
  final String? errorMessage;

  const ApiResponse({
    required this.success,
    this.data,
    required this.statusCode,
    this.message,
    this.errorMessage,
  });

  /// Creates a successful response
  factory ApiResponse.success({
    required T data,
    required int statusCode,
    String? message,
  }) {
    return ApiResponse(
      success: true,
      data: data,
      statusCode: statusCode,
      message: message,
    );
  }

  /// Creates a failed response
  factory ApiResponse.error({
    required int statusCode,
    required String errorMessage,
    T? data,
  }) {
    return ApiResponse(
      success: false,
      data: data,
      statusCode: statusCode,
      errorMessage: errorMessage,
    );
  }

  /// Returns true if response has data
  bool get hasData => data != null;

  /// Safely get data or throw if null
  T get dataOrThrow {
    if (data == null) {
      throw StateError('Data is null. Check success flag before accessing data.');
    }
    return data as T;
  }

  /// Get data with a fallback value
  T dataOr(T fallback) => data ?? fallback;

  @override
  String toString() {
    return 'ApiResponse(success: $success, statusCode: $statusCode, hasData: $hasData, message: ${message ?? errorMessage})';
  }
}

/// A result wrapper that preserves the backend error message.
///
/// Repositories return this instead of `null` so the UI layer
/// can display the actual error from the API.
class Result<T> {
  final T? data;
  final String? errorMessage;
  final int statusCode;
  final bool isSuccess;

  const Result._({
    this.data,
    this.errorMessage,
    required this.statusCode,
    required this.isSuccess,
  });

  /// Wraps a successful [ApiResponse].
  factory Result.fromSuccess(ApiResponse<T> response) {
    return Result._(
      data: response.data,
      statusCode: response.statusCode,
      isSuccess: true,
    );
  }

  /// Wraps a failed [ApiResponse]. Accepts any ApiResponse type so callers
  /// don't have to worry about type mismatch on the failure path.
  factory Result.fromFailure(ApiResponse<dynamic> response) {
    return Result._(
      errorMessage: response.errorMessage,
      statusCode: response.statusCode,
      isSuccess: false,
    );
  }

  /// Creates a success result from raw data (no API call).
  factory Result.ok(T data) {
    return Result._(data: data, statusCode: 200, isSuccess: true);
  }

  /// Creates a failure result with a plain error message.
  factory Result.fail(String message, {int statusCode = 0}) {
    return Result._(errorMessage: message, statusCode: statusCode, isSuccess: false);
  }
}
