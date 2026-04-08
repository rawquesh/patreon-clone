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
