import 'package:flutter/material.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon-clone/backend/memberships/membership_controller.dart';
import 'package:patreon-clone/backend/memberships/membership_provider.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/pages/creator/main/dialogs/add_membership_dialog.dart';
import 'package:patreon-clone/pages/creator/main/components/membership_tier_card.dart';
import 'package:provider/provider.dart';

class CreatorMembershipTab extends StatefulWidget {
  static const String routeName = "/CreatorMembershipTab";

  const CreatorMembershipTab({super.key});

  @override
  State<CreatorMembershipTab> createState() => _CreatorMembershipTabState();
}

class _CreatorMembershipTabState extends State<CreatorMembershipTab> with MySafeState {
  late MembershipController _membershipController;
  late MembershipProvider _membershipProvider;
  String? _selectedFeaturedTierId;

  void _showAddNewMembershipDialog() {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (context, animation, secondaryAnimation) {
        return const AddMembershipDialog();
      },
    ).then((result) {
      if (result != null) {
        MyPrint.printOnConsole('New collection created:');

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Collection created successfully!')),
        );

        getData(isNotify: true);
      }
    });
  }

  Future<void> getData({bool isNotify = true}) async {
    await _membershipController.getMemberships(isNotify: isNotify);
  }

  Future<void> _setFeaturedTier(String membershipId) async {
    MembershipModel? result = await _membershipController.featureMembership(membershipId);

    if (result != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Featured tier updated")),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed to update featured tier")),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    _membershipProvider = context.read<MembershipProvider>();
    _membershipController = MembershipController(provider: _membershipProvider);
    getData(isNotify: true);
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return Consumer<MembershipProvider>(
      builder: (context, provider, _) {
        final List<MembershipModel> tiers = provider.memberships.getList();

        MyPrint.printOnConsole("🔄 Rebuilding Membership Sliver List");
        MyPrint.printOnConsole("📦 Total Memberships Received: ${tiers.length}");
        for (var tier in tiers) {
          MyPrint.printOnConsole("📌 Tier ID: ${tier.id}, Name: ${tier.name}, Rate: ${tier.monthlyPrice}");
        }

        // Handle loading state
        if (provider.isLoading.get() && tiers.isEmpty) {
          MyPrint.printOnConsole("⏳ Loading Memberships...");
          return const SliverToBoxAdapter(
            child: Center(
                child: Padding(
              padding: EdgeInsets.all(50.0),
              child: LoadingWidget(),
            )),
          );
        }

        // Handle empty state
        if (!provider.isLoading.get() && tiers.isEmpty) {
          MyPrint.printOnConsole("🚫 No memberships found.");
          return SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 50.0),
              child: Center(
                child: Text(
                  'No Memberships yet.',
                  style: TextStyle(fontSize: 16, color: Colors.grey[600]).withEpilogue,
                ),
              ),
            ),
          );
        }

        // When memberships exist
        MyPrint.printOnConsole("✅ Memberships ready to display");

        final List<Widget> sliverContent = [];

        sliverContent.add(
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "Paid Memberships Tier",
                  style:
                      themeData.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.bold, color: Colors.black87).withEpilogue,
                ),
                ElevatedButton.icon(
                  onPressed: _showAddNewMembershipDialog,
                  icon: Icon(
                    Icons.add,
                    size: 18,
                    color: themeData.colorScheme.onPrimary,
                  ),
                  label: Text(
                    'Add Tier',
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: themeData.colorScheme.onPrimary,
                    ).withEpilogue,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: themeData.primaryColor,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                )
              ],
            ),
          ),
        );

        sliverContent.add(
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Featured Tier',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87).withEpilogue,
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: tiers.any((t) => t.id == _selectedFeaturedTierId) ? _selectedFeaturedTierId : null,
                  isExpanded: true,
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(
                        color: themeData.colorScheme.primary,
                        width: 1.5,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(
                        color: themeData.colorScheme.primary,
                        width: 1.5,
                      ),
                    ),
                  ),
                  hint: Text(
                    'Select a tier to feature...',
                    style: TextStyle(color: Colors.grey[600], fontSize: 14).withEpilogue,
                  ),
                  items: tiers
                      .map((tier) => DropdownMenuItem<String>(
                            value: tier.id,
                            child: Text(
                              '${tier.name} (\$${tier.monthlyRate.toStringAsFixed(2)}/month)',
                              style: const TextStyle(fontSize: 13).withEpilogue,
                            ),
                          ))
                      .toList(),
                  onChanged: (value) {
                    MyPrint.printOnConsole("📤 Featured Tier Selected: $value");
                    setState(() {
                      _selectedFeaturedTierId = value;
                    });
                    if (value != null) {
                      _setFeaturedTier(value);
                    }
                  },
                ),
              ],
            ),
          ),
        );
        sliverContent.addAll(
          tiers.map((item) => MembershipTierCard(membership: item)),
        );
        sliverContent.add(
          SizedBox(
            height: MediaQuery.of(context).padding.bottom + 16,
          ),
        );
        return SliverList(
          delegate: SliverChildListDelegate(sliverContent),
        );
      },
    );
  }
}
