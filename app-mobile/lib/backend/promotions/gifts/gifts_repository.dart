import 'package:flutter/material.dart';

import 'package:patreon-clone/models/promotions/gift/gift_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_toast.dart';

import 'package:patreon-clone/backend/common/api_endpoints.dart';
import 'package:patreon-clone/backend/common/api_service.dart';

class GiftRepository {
  final ApiService _apiService = ApiService();

  Future<List<GiftModel>?> getGifts() async {
    try {
      final response = await _apiService.get(ApiEndpoints.promotionsGifts);

      if (response.success && response.data != null) {
        final rawList = response.data!['gifts'] as List?;
        if (rawList != null) {
          return rawList.map((e) => GiftModel.fromMap(e as Map<String, dynamic>)).toList();
        }
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error fetching gifts: $e');
      MyPrint.printOnConsole(s);
    }
    return null;
  }

  Future<GiftModel?> upsertGift(GiftModel model) async {
    try {
      final isEdit = model.id.isNotEmpty;
      final endpoint = isEdit ? ApiEndpoints.giftById(model.id) : ApiEndpoints.promotionsGifts;

      final response = isEdit
          ? await _apiService.put(endpoint, body: model.toMap(toJson: true))
          : await _apiService.post(endpoint, body: model.toMap(toJson: true));

      MyPrint.printOnConsole('Gift upsert response: ${response.statusCode}');

      if (response.success && response.data != null) {
        return GiftModel.fromMap(response.data!);
      } else {
        MyPrint.printOnConsole('Failed to upsert gift: ${response.statusCode} ${response.errorMessage}');
      }
    } catch (e, s) {
      MyPrint.printOnConsole('Error upserting gift: $e');
      MyPrint.printOnConsole(s);
    }
    return null;
  }

  Future<bool> deleteGift(String id, {required BuildContext context}) async {
    try {
      MyToast.showSuccess(context: context, msg: 'Deleting gift code...');

      final response = await _apiService.delete(ApiEndpoints.giftById(id));

      return response.success;
    } catch (e, s) {
      MyPrint.printOnConsole('Error deleting gift: $e');
      MyPrint.printOnConsole(s);
    }
    return false;
  }
}
