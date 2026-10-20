import 'package:flutter/material.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/models/subscription/subscription_model.dart';
import 'package:patreon_clone/models/creator/creator_model.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';

import 'package:provider/provider.dart';

import 'package:patreon_clone/backend/creator/my_creator_controller.dart';
import 'package:patreon_clone/backend/creator/my_creator_provider.dart';
import 'package:patreon_clone/pages/user/creator/component/creator_horizontal_card.dart';
// import 'package:patreon_clone/pages/user/creator/creator_profile_screen.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon_clone/navigation/app_router.dart';

class CreatorListingScreen extends StatefulWidget {
  static const String routeName = "/CreatorListingScreen";
  final String? category;
  final List<CreatorModel>? creators;

  const CreatorListingScreen({
    super.key,
    this.category,
    this.creators,
  });

  @override
  State<CreatorListingScreen> createState() => _CreatorListingScreenState();
}

class _CreatorListingScreenState extends State<CreatorListingScreen> with MySafeState {
  late MyCreatorProvider myCreatorProvider;
  late MyCreatorController myCreatorController;

  @override
  void dispose() {
    myCreatorProvider.clearUserSubscriptions(isNotify: false);
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    myCreatorProvider = context.read<MyCreatorProvider>();
    myCreatorController = MyCreatorController(myCreatorProvider: myCreatorProvider);
    myCreatorController.getUserSubscribedMembershipsPaginatedList(isRefresh: true);
  }

  String get appBarTitle {
    if (widget.category == 'Top Creators') {
      return 'Top Creators';
    }
    return 'Top Creators in ${widget.category}';
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(
            Icons.chevron_left,
            size: 34,
          ),
        ),
        title: Text(
          appBarTitle,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        foregroundColor: Colors.black87,
        elevation: 0,
        shadowColor: Colors.grey.withValues(alpha: 0.1),
        surfaceTintColor: Colors.transparent,
      ),
      body: (widget.creators == null || widget.creators!.isEmpty)
          ? const Center(
              child: Text(
                'No creators found in this category',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
              ),
            )
          : Consumer<MyCreatorProvider>(
              builder: (context, provider, child) {
                return MultiProvider(
                  providers: [
                    ChangeNotifierProvider<APIDocumentsPaginatedListModel<SubscriptionModel>>.value(
                      value: provider.userSubscriptionsPaginationModel.get(),
                    )
                  ],
                  child: ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: widget.creators!.length,
                    itemBuilder: (context, index) {
                      final creator = widget.creators![index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: InkWell(
                          onTap: () {
                            context.pushNamed(
                              Routes.creatorProfile,
                              extra: {
                                'creatorModel': creator,
                                'creatorUsername': creator.username,
                              },
                            );
                          },
                          child: CreatorHorizontalCard(creator: creator),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
    );
  }
}
