import 'package:flutter/widgets.dart';
import 'package:patreon-clone/models/promotions/discount/discount_model.dart';
import 'package:patreon-clone/utils/my_print.dart';

import 'discount_provider.dart';
import 'discount_repository.dart';

class DiscountController {
  final DiscountProvider provider;
  final DiscountRepository _repository;

  DiscountController({required this.provider, DiscountRepository? repository}) : _repository = repository ?? DiscountRepository();

  Future<void> getDiscounts({bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final list = await _repository.getDiscounts() ?? [];
    provider.discounts.setList(list: list, isClear: true, isNotify: isNotify);
    provider.isLoading.set(value: false, isNotify: isNotify);
  }

  Future<DiscountModel?> upsertDiscount(DiscountModel model, {bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final result = await _repository.upsertDiscount(model);
    MyPrint.printOnConsole('Upserted discount: ${result?.toMap()}');

    if (result != null) {
      final current = provider.discounts.getList();
      final index = current.indexWhere((e) => e.id == result.id);
      if (index != -1) {
        current[index] = result;
      } else {
        current.add(result);
      }
      provider.discounts.setList(list: current, isClear: true, isNotify: isNotify);
    }
    MyPrint.printOnConsole('Updated discounts list: ${provider.discounts.getList().map((e) => e.toMap()).toList()}');

    provider.isLoading.set(value: false, isNotify: isNotify);
    return result;
  }

  Future<bool> deleteDiscount(String id, BuildContext context, {bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);
    final success = await _repository.deleteDiscount(id, context: context);
    if (success) {
      final current = provider.discounts.getList();
      current.removeWhere((e) => e.id == id);
      provider.discounts.setList(list: current, isClear: true, isNotify: isNotify);
    }
    provider.isLoading.set(value: false, isNotify: isNotify);
    return success;
  }
}
