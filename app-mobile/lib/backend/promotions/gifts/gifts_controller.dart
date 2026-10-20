import 'package:flutter/material.dart';
import 'package:patreon_clone/models/promotions/gift/gift_model.dart';
import 'package:patreon_clone/utils/my_print.dart';

import 'gifts_provider.dart';
import 'gifts_repository.dart';

class GiftController {
  final GiftProvider provider;
  final GiftRepository _repository;

  GiftController({required this.provider, GiftRepository? repository}) : _repository = repository ?? GiftRepository();

  Future<void> getGifts({bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final list = await _repository.getGifts() ?? [];
    provider.gifts.setList(list: list, isClear: true, isNotify: isNotify);
    provider.isLoading.set(value: false, isNotify: isNotify);
  }

  Future<GiftModel?> upsertGift(GiftModel model, {bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final result = await _repository.upsertGift(model);
    MyPrint.printOnConsole('Upserted gift: ${result?.toMap()}');

    if (result != null) {
      final current = provider.gifts.getList();
      final index = current.indexWhere((e) => e.id == result.id);
      if (index != -1) {
        current[index] = result;
      } else {
        current.add(result);
      }
      provider.gifts.setList(list: current, isClear: true, isNotify: isNotify);
    }
    provider.isLoading.set(value: false, isNotify: isNotify);
    return result;
  }

  Future<bool> deleteGift(String id, BuildContext context, {bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final success = await _repository.deleteGift(id, context: context);
    if (success) {
      final current = provider.gifts.getList();
      current.removeWhere((e) => e.id == id);
      provider.gifts.setList(list: current, isClear: true, isNotify: isNotify);
    }
    provider.isLoading.set(value: false, isNotify: isNotify);
    return success;
  }
}
