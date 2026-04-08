import 'dart:io';

import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/backend/memberships/membership_provider.dart';

import 'membership_repository.dart';

class MembershipController {
  final MembershipProvider provider;
  final MembershipRepository _repository;

  MembershipController({required this.provider, MembershipRepository? repository})
      : _repository = repository ?? MembershipRepository();

  Future<String?> createCheckout(String membershipId) {
    return _repository.createCheckoutSession(membershipId);
  }

  Future<bool?> checkSubscription(String creatorId) {
    return _repository.checkSubscription(creatorId);
  }

  Future<Map<String, dynamic>?> unsubscribeFromCreator(String creatorId) {
    return _repository.unsubscribeFromCreator(creatorId);
  }

  Future<void> getMemberships({bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);

    final response = await _repository.getMemberships();
    MyPrint.printOnConsole("📥 Raw API response: $response");

    final list = <MembershipModel>[];

    if (response != null && response['memberships'] is List) {
      final membershipsRawList = response['memberships'];
      MyPrint.printOnConsole("📦 Total raw items received: ${membershipsRawList.length}");

      for (int i = 0; i < membershipsRawList.length; i++) {
        final item = membershipsRawList[i];
        MyPrint.printOnConsole("🔍 Raw Membership [$i]: $item");
        try {
          list.add(MembershipModel.fromMap(item));
        } catch (e) {
          MyPrint.printOnConsole("❌ Error parsing item [$i]: $e");
        }
      }
    } else {
      MyPrint.printOnConsole("⚠️ No valid 'memberships' list found in response");
    }

    MyPrint.printOnConsole("✅ Total memberships parsed: ${list.length}");

    provider.memberships.setList(list: list, isClear: true, isNotify: isNotify);
    provider.isLoading.set(value: false, isNotify: isNotify);
  }

  Future<MembershipModel?> createOrUpdateMembership({
    required MembershipModel model,
    File? coverImage,
    bool isNotify = true,
  }) async {
    provider.isLoading.set(value: true, isNotify: isNotify);

    final result = await _repository.upsertMembership(
      model: model,
      coverImage: coverImage,
    );

    if (result != null) {
      List<MembershipModel> currentList = provider.memberships.getList();

      final existingIndex = currentList.indexWhere((e) => e.id == result.id);
      if (existingIndex != -1) {
        currentList[existingIndex] = result;
      } else {
        currentList.add(result);
      }

      provider.memberships.setList(
        list: currentList,
        isClear: true,
        isNotify: isNotify,
      );
    }

    provider.isLoading.set(value: false, isNotify: isNotify);
    return result;
  }

  Future<MembershipModel?> featureMembership(String membershipId, {bool isNotify = true}) async {
    provider.isLoading.set(value: true, isNotify: isNotify);

    final result = await _repository.featureMembershipTier(membershipId);

    if (result != null) {
      final updatedList = provider.memberships.getList().map((m) {
        if (m.id == result.id) return result;

        return MembershipModel(
          id: m.id,
          name: m.name,
          description: m.description,
          monthlyRate: m.monthlyRate,
          yearlyPrice: m.yearlyPrice,
          benefits: m.benefits,
          isLimited: m.isLimited,
          seatsLeft: m.seatsLeft,
          isFeatured: false,
          isActive: m.isActive,
          coverImage: m.coverImage,
          subscriberCount: m.subscriberCount,
          creator: m.creator,
          totalEarnings: m.totalEarnings,
          stripePriceId: m.stripePriceId,
          stripeProductId: m.stripeProductId,
        );
      }).toList();

      provider.memberships.setList(list: updatedList, isClear: true, isNotify: isNotify);
    }

    provider.isLoading.set(value: false, isNotify: isNotify);
    return result;
  }
}
