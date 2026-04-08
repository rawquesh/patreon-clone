import 'package:flutter/cupertino.dart';

import 'package:patreon-clone/models/promotions/discount/discount_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_toast.dart';

import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';

class DiscountRepository {
  final ApiService _apiService = ApiService();

  Future<List<DiscountModel>?> getDiscounts() async {
    try {
      final response = await _apiService.get(ApiEndpoints.promotionsDiscounts);

      if (response.success && response.data != null) {
        final rawList = response.data!['discounts'] as List?;
        if (rawList != null) {
          return rawList.map((e) => DiscountModel.fromMap(e as Map<String, dynamic>)).toList();
        }
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error fetching discounts: $e');
      MyPrint.printOnConsole(s);
    }
    return null;
  }

  Future<DiscountModel?> upsertDiscount(DiscountModel model) async {
    try {
      final isEdit = model.id.isNotEmpty;
      final endpoint = isEdit ? ApiEndpoints.discountById(model.id) : ApiEndpoints.promotionsDiscounts;

      final response = isEdit
          ? await _apiService.put(endpoint, body: model.toMap(toJson: true))
          : await _apiService.post(endpoint, body: model.toMap(toJson: true));

      MyPrint.printOnConsole('Response status code: ${response.statusCode}');

      if (response.success && response.data != null) {
        return DiscountModel.fromMap(response.data!);
      } else {
        MyPrint.printOnConsole('Failed to upsert discount: ${response.statusCode} ${response.errorMessage}');
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error upserting discount: $e');
      MyPrint.printOnConsole(s);
    }
    return null;
  }

  Future<bool> deleteDiscount(String id, {required BuildContext context}) async {
    try {
      MyToast.showSuccess(context: context, msg: 'Deleting discount code...');

      final response = await _apiService.delete(ApiEndpoints.discountById(id));

      return response.success;
    } catch (e, s) {
      MyPrint.printOnConsole('Error deleting discount: $e');
      MyPrint.printOnConsole(s);
    }
    return false;
  }
}
