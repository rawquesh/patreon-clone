import 'dart:convert';
import 'dart:io';

import 'package:http_parser/http_parser.dart';

import 'package:patreon_clone/models/membership/membership_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_toast.dart';

import 'package:patreon_clone/backend/common/api_endpoints.dart';
import 'package:patreon_clone/backend/common/api_service.dart';

class MembershipRepository {
  final ApiService _apiService = ApiService();

  Future<String?> createCheckoutSession(String membershipId) async {
    MyPrint.printOnConsole('Creating checkout session for $membershipId');

    final response = await _apiService.post(
      ApiEndpoints.membershipCheckout(membershipId),
    );

    MyPrint.printOnConsole('Checkout response: ${response.statusCode}');

    if (response.success && response.data != null) {
      return response.data!['checkoutUrl'] as String?;
    }
    return null;
  }

  Future<bool?> checkSubscription(String creatorId) async {
    MyPrint.printOnConsole('Checking subscription for creator $creatorId');

    final response = await _apiService.get(ApiEndpoints.membershipCheck(creatorId));

    MyPrint.printOnConsole('Check subscription response: ${response.statusCode}');

    if (response.success && response.data != null) {
      return response.data!['isSubscribed'] as bool?;
    }
    return null;
  }

  Future<MembershipModel?> upsertMembership({
    required MembershipModel model,
    File? coverImage,
  }) async {
    void showToast({String msg = ''}) {
      MyToast.showToast(msg);
    }

    try {
      final bool isEdit = model.id.isNotEmpty;
      final endpoint = isEdit ? ApiEndpoints.membershipById(model.id) : ApiEndpoints.memberships;

      final fields = <String, String>{
        'name': model.name,
        'description': model.description,
        'monthlyRate': model.monthlyRate.toString(),
        'yearlyPrice': model.yearlyPrice.toString(),
        'benefits': jsonEncode(model.benefits),
        'isLimited': model.isLimited.toString(),
        'seatsLeft': model.seatsLeft.toString(),
        'isFeatured': model.isFeatured.toString(),
        'isActive': model.isActive.toString(),
      };

      final List<MultipartFileData>? files = coverImage != null
          ? [
              MultipartFileData.fromFile(
                field: 'coverImage',
                file: coverImage,
                contentType: _getImageContentType(coverImage.path),
              ),
            ]
          : null;

      final response = await _apiService.multipartRequest(
        method: isEdit ? 'PUT' : 'POST',
        endpoint: endpoint,
        fields: fields,
        files: files,
      );

      MyPrint.printOnConsole('Membership ${isEdit ? "update" : "create"} response: ${response.statusCode}');

      if (response.success && response.data != null) {
        final membershipMap = response.data!['membership'] ?? response.data!;
        return MembershipModel.fromMap(membershipMap);
      } else {
        MyPrint.printOnConsole("Failed: ${response.statusCode} - ${response.errorMessage}");
        showToast(msg: response.errorMessage ?? 'Failed to ${isEdit ? "update" : "create"} membership');
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error in upsertMembership: $e');
      MyPrint.printOnConsole(s);
    }

    return null;
  }

  Future<Map<String, dynamic>?> getMemberships() async {
    final response = await _apiService.get(ApiEndpoints.membershipsCreator);

    if (response.success) {
      return response.data;
    }
    return null;
  }

  MediaType _getImageContentType(String path) {
    final ext = path.split('.').last.toLowerCase();
    switch (ext) {
      case 'png':
        return MediaType('image', 'png');
      case 'gif':
        return MediaType('image', 'gif');
      case 'webp':
        return MediaType('image', 'webp');
      default:
        return MediaType('image', 'jpeg');
    }
  }

  Future<MembershipModel?> featureMembershipTier(String membershipId) async {
    MyPrint.printOnConsole('Setting membership $membershipId as featured');

    final response = await _apiService.put(
      ApiEndpoints.membershipFeatured(membershipId),
      body: {'isFeatured': true},
    );

    MyPrint.printOnConsole('Feature tier response: ${response.statusCode}');

    if (response.success && response.data != null) {
      final membershipMap = response.data!['membership'] ?? response.data!;
      return MembershipModel.fromMap(membershipMap);
    } else {
      MyPrint.printOnConsole("Feature failed: ${response.statusCode} - ${response.errorMessage}");
    }

    return null;
  }

  Future<Map<String, dynamic>?> unsubscribeFromCreator(String creatorId) async {
    MyPrint.printOnConsole('Unsubscribing from creator $creatorId');

    final response = await _apiService.delete(
      ApiEndpoints.membershipUnsubscribe(creatorId),
    );

    MyPrint.printOnConsole('Unsubscribe response: ${response.statusCode}');

    if (response.success) {
      return response.data;
    }
    return null;
  }
}
