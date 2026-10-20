import 'package:flutter/material.dart';
import 'package:patreon_clone/styles/styles.dart';
import 'package:patreon_clone/models/audience/member_model.dart';
import 'package:patreon_clone/models/common/data_model/api_documents_paginated_list_model.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/utils/my_toast.dart';
import 'package:patreon_clone/pages/components/widgets/loading_widget.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon_clone/backend/audience/audience_controller.dart';
import 'package:patreon_clone/backend/audience/audience_provider.dart';

class AudiencePage extends StatefulWidget {
  static const String routeName = '/AudiencePage';

  const AudiencePage({super.key});

  @override
  State<AudiencePage> createState() => _AudiencePageState();
}

class _AudiencePageState extends State<AudiencePage> with MySafeState {
  bool _newThisMonth = false;

  List<String> _cachedTierNames = const [];

  bool _equalsIgnoreCase(String a, String b) => a.toLowerCase() == b.toLowerCase();

  bool _isSameMonthYear(DateTime a, DateTime b) => a.year == b.year && a.month == b.month;

  String _selectedStatus = 'All';
  String _selectedMembershipTier = 'All';
  String _selectedJoinDate = 'Anytime';
  final TextEditingController _searchController = TextEditingController();
  late AudienceProvider _provider;
  late AudienceController _controller;
  final ScrollController _scrollController = ScrollController();
  String _searchQuery = '';
  bool _isExporting = false;

  @override
  void initState() {
    super.initState();
    _provider = context.read<AudienceProvider>();
    _controller = AudienceController(audienceProvider: _provider);
    _getMembers(isRefresh: true);
  }

  Future<void> _getMembers({
    bool isRefresh = true,
    bool isFromCache = false,
    bool isNotify = true,
  }) async {
    await _controller.getMembersPaginatedList(
      isRefresh: isRefresh,
      isFromCache: isFromCache,
      isNotify: isNotify,
      searchQuery: _searchQuery,
    );
  }

  DateTime? _joinCutoffFromFilter(String filter) {
    final now = DateTime.now();
    switch (filter) {
      case 'This Month':
        return DateTime(now.year, now.month, 1);
      case 'Last 3 Months':
        return DateTime(now.year, now.month - 3, 1);
      case 'Last 6 Months':
        return DateTime(now.year, now.month - 6, 1);
      case 'This Year':
        return DateTime(now.year, 1, 1);
      default:
        return null;
    }
  }

  void _showMemberDetailsSheet(MemberModel member) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(
            20,
            20,
            20,
            20 + MediaQuery.of(context).viewInsets.bottom,
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // header row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Member Details",
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ).withEpilogue,
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Profile picture + name
                CircleAvatar(
                  radius: 36,
                  backgroundColor: Colors.grey.shade200,
                  backgroundImage: member.profilePicture.isNotEmpty ? NetworkImage(member.profilePicture) : null,
                  child: member.profilePicture.isEmpty ? Icon(Icons.person, size: 36, color: Colors.grey.shade500) : null,
                ),
                const SizedBox(height: 12),
                Text(
                  member.name.isNotEmpty ? member.name : "Unknown User",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Colors.grey.shade900,
                  ).withEpilogue,
                ),
                const SizedBox(height: 4),
                Text(
                  member.email.isNotEmpty ? member.email : "No email provided",
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                  ).withEpilogue,
                ),

                const SizedBox(height: 16),

                // Compact info rows
                _buildDetailTile(Icons.workspace_premium, "Tier", member.tier?.name ?? "Free Membership"),
                _buildDetailTile(Icons.calendar_today, "Joined", _formatDate(member.joinDate)),
                _buildDetailTile(Icons.check_circle, "Status", member.status),
                _buildDetailTile(Icons.payments, "Total Paid", "\$${member.totalPaid.toStringAsFixed(2)}"),
                if (member.currentPeriodEnd != null)
                  _buildDetailTile(Icons.event, "Period End", _formatDate(member.currentPeriodEnd)),

                const SizedBox(height: 20),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDetailTile(IconData icon, String label, String value) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey.shade600),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Colors.grey.shade700,
              ).withEpilogue,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade900,
            ).withEpilogue,
          ),
        ],
      ),
    );
  }

  void _showFilterSheet() {
    String tempStatus = _selectedStatus;
    String tempMembershipTier = _selectedMembershipTier;
    String tempJoinDate = _selectedJoinDate;
    bool tempNewThisMonth = _newThisMonth;

    // Build dynamic tier list (fallback to defaults if empty)
    final tierItems = (_cachedTierNames.isNotEmpty) ? _cachedTierNames : ['All', 'Free Membership', 'Premium', 'VIP'];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + MediaQuery.of(context).viewInsets.bottom),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Filter Audience', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600).withEpilogue),
                    IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
                  ],
                ),
                const SizedBox(height: 20),
                _buildFilterSection(
                  'Status',
                  tempStatus,
                  ['All', 'Active', 'Inactive'],
                  (value) => setModalState(() => tempStatus = value),
                ),
                const SizedBox(height: 20),
                _buildFilterSection(
                  'Membership Tier',
                  tempMembershipTier,
                  tierItems,
                  (value) => setModalState(() => tempMembershipTier = value),
                ),
                const SizedBox(height: 20),
                _buildFilterSection(
                  'Join Date',
                  tempJoinDate,
                  ['Anytime', 'This Month', 'Last 3 Months', 'Last 6 Months', 'This Year'],
                  (value) => setModalState(() => tempJoinDate = value),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Switch(
                      value: tempNewThisMonth,
                      onChanged: (v) => setModalState(() => tempNewThisMonth = v),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text('New this month', style: const TextStyle(fontSize: 14).withEpilogue),
                    ),
                  ],
                ),
                const SizedBox(height: 30),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _selectedStatus = tempStatus;
                        _selectedMembershipTier = tempMembershipTier;
                        _selectedJoinDate = tempJoinDate;
                        _newThisMonth = tempNewThisMonth;
                      });
                      _applyFilters(); // triggers setState already
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: themeData.primaryColor.withValues(alpha: 0.6),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: Text('Apply Filters', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600).withEpilogue),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<MemberModel> _applyLocalFiltersTo(List<MemberModel> input) {
    final q = _searchQuery.trim().toLowerCase();
    final cutoff = _joinCutoffFromFilter(_selectedJoinDate);
    final now = DateTime.now();

    return input.where((m) {
      final matchesSearch = q.isEmpty ||
          (m.name.isNotEmpty && m.name.toLowerCase().contains(q)) ||
          (m.email.isNotEmpty && m.email.toLowerCase().contains(q));

      final matchesStatus = _selectedStatus == 'All' || _equalsIgnoreCase(m.status, _selectedStatus);

      final tierName = (m.tier?.name.trim().isNotEmpty == true) ? m.tier!.name : 'Free Membership';
      final matchesTier = _selectedMembershipTier == 'All' || _equalsIgnoreCase(tierName, _selectedMembershipTier);

      final jd = m.joinDate;
      final matchesJoinWindow = cutoff == null || (jd != null && jd.isAfter(cutoff));

      final matchesNewThisMonth = !_newThisMonth || (jd != null && _isSameMonthYear(jd, now));

      return matchesSearch && matchesStatus && matchesTier && matchesJoinWindow && matchesNewThisMonth;
    }).toList();
  }

  void _applyFilters() {
    setState(() {});
  }

  void _clearFilters() {
    setState(() {
      _searchController.clear();
      _newThisMonth = false;
      _selectedStatus = 'All';
      _selectedMembershipTier = 'All';
      _selectedJoinDate = 'Anytime';
    });
  }

  void _exportToCSV() async {
    if (_isExporting) return;

    setState(() {
      _isExporting = true;
    });

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text(
                'Exporting audience data...',
                style: const TextStyle(fontSize: 16).withEpilogue,
              ),
              const SizedBox(height: 8),
              Text(
                'This may take a few moments',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600).withEpilogue,
              ),
            ],
          ),
        ),
      );

      Map<String, String> filters = {
        'status': _selectedStatus,
        'membership_tier': _selectedMembershipTier,
        'join_date': _selectedJoinDate,
      };

      if (_newThisMonth) {
        filters['new_this_month'] = 'true';
      }

      bool success = await _controller.exportMembersToCSV(
        searchQuery: _searchQuery.isNotEmpty ? _searchQuery : null,
        filters: filters,
      );

      Navigator.of(context).pop();

      if (success) {
        MyToast.showSuccess(context: context, msg: "Audience data exported successfully!");
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error, color: Colors.white),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Failed to export data. Please try again.',
                    style: const TextStyle(color: Colors.white).withEpilogue,
                  ),
                ),
              ],
            ),
            backgroundColor: Colors.red.shade600,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (Navigator.canPop(context)) {
        Navigator.of(context).pop();
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error, color: Colors.white),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Error occurred while exporting: ${e.toString()}',
                  style: const TextStyle(color: Colors.white).withEpilogue,
                ),
              ),
            ],
          ),
          backgroundColor: Colors.red.shade600,
          duration: const Duration(seconds: 4),
        ),
      );
    } finally {
      setState(() {
        _isExporting = false;
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(
            Icons.arrow_back,
          ),
        ),
        title: Text(
          'Audience',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: themeData.colorScheme.onPrimary,
            letterSpacing: -0.5,
          ).withTiempos,
        ),
        backgroundColor: themeData.primaryColor,
        foregroundColor: Colors.white,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: Colors.grey.shade200),
        ),
      ),
      body: Column(
        children: [
          _buildSearchAndFilters(),
          Expanded(
            child: Consumer<AudienceProvider>(
              builder: (_, __, ___) => _buildMembersList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMembersList() {
    return ChangeNotifierProvider<APIDocumentsPaginatedListModel<MemberModel>>.value(
      value: _provider.membersPaginationModel.get(),
      child: Consumer<APIDocumentsPaginatedListModel<MemberModel>>(
        builder: (_, paginatedListModel, __) {
          if (paginatedListModel.isContentsFirstTimeLoading.get()) {
            return const Center(child: LoadingWidget());
          }

          final all = paginatedListModel.contentsList.getList(isNewInstance: false);

          _cachedTierNames = [
            'All',
            ...{for (final m in all) ((m.tier?.name.trim().isNotEmpty == true) ? m.tier!.name : 'Free Membership')}
          ].toList()
            ..sort();

          final members = _applyLocalFiltersTo(all);

          if (!paginatedListModel.isContentsLoading.get() && members.isEmpty) {
            return RefreshIndicator(
              onRefresh: () => _getMembers(isRefresh: true),
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  SizedBox(
                    height: MediaQuery.of(context).size.height / 3,
                  ),
                  const Center(child: Text('No audience members found')),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => _getMembers(isRefresh: true),
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(12),
              itemCount: members.length + 1,
              itemBuilder: (context, index) {
                if ((index == 0 && members.isEmpty) || index == members.length) {
                  return paginatedListModel.isContentsLoading.get() ? const LoadingWidget() : const SizedBox();
                }

                if (paginatedListModel.hasMoreContents.get() &&
                    index > (members.length - paginatedListModel.contentsDocumentRefreshLimitForPagination.get())) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    _getMembers(
                      isRefresh: false,
                      isNotify: false,
                      isFromCache: false,
                    );
                  });
                }

                return _buildUserCard(members[index]);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildButton({
    required String text,
    required VoidCallback onPressed,
    Color? backgroundColor,
    Color? textColor,
    Color? borderColor,
    IconData? icon,
    double height = 30,
    EdgeInsets? padding,
  }) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: backgroundColor ?? Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor ?? Colors.grey.shade300),
      ),
      child: MaterialButton(
        onPressed: onPressed,
        padding: padding ?? const EdgeInsets.symmetric(horizontal: 8),
        minWidth: 0,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 12, color: textColor ?? Colors.grey.shade600),
              const SizedBox(width: 4),
            ],
            Text(
              text,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: textColor ?? Colors.grey.shade600,
              ).withEpilogue,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Container(
      padding: const EdgeInsets.all(12),
      color: Styles.scaffoldBackground,
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: _buildSearchField()),
              const SizedBox(width: 12),
              _buildButton(
                text: _isExporting ? 'Exporting...' : 'Export CSV',
                icon: _isExporting ? null : Icons.download,
                onPressed: _isExporting ? () {} : _exportToCSV,
                backgroundColor: _isExporting ? Colors.grey.shade100 : themeData.primaryColor.withValues(alpha: 0.1),
                textColor: _isExporting ? Colors.grey.shade400 : themeData.primaryColor.withValues(alpha: 0.6),
                borderColor: _isExporting ? Colors.grey.shade300 : themeData.primaryColor.withValues(alpha: 0.2),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildButton(
                text: 'Filter',
                icon: Icons.filter_list,
                onPressed: _showFilterSheet,
              ),
              const SizedBox(width: 12),
              TextButton(
                onPressed: _clearFilters,
                style: TextButton.styleFrom(
                  minimumSize: const Size(0, 40),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                ),
                child: Text(
                  'Clear all',
                  style: TextStyle(fontSize: 10, color: Colors.grey.shade600).withEpilogue,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSearchField() {
    return Container(
      height: 40,
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (value) {
          _searchQuery = value;
          mySetState();
        },
        decoration: InputDecoration(
          hintText: 'Search by email or name',
          hintStyle: const TextStyle(fontSize: 14, color: Colors.grey).withEpilogue,
          prefixIcon: const Icon(Icons.search, size: 20, color: Colors.grey),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        ),
      ),
    );
  }

  Widget _buildUserCard(MemberModel member) {
    return GestureDetector(
      onTap: () => _showMemberDetailsSheet(member),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: Colors.grey.shade100,
                backgroundImage: member.profilePicture.isNotEmpty ? NetworkImage(member.profilePicture) : null,
                child: member.profilePicture.isEmpty ? Icon(Icons.person, size: 24, color: Colors.grey.shade400) : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            member.name.isNotEmpty ? member.name : 'Unknown User',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey.shade900,
                            ).withEpilogue,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        _buildStatusChip(member.status),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      member.email.isNotEmpty ? member.email : 'No email provided',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey.shade600,
                      ).withEpilogue,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    final isActive = status.toLowerCase() == 'active';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? Colors.green.shade50 : Colors.red.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isActive ? Colors.green.shade200 : Colors.red.shade200,
          width: 1,
        ),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: isActive ? Colors.green.shade700 : Colors.red.shade700,
          letterSpacing: 0.5,
        ).withEpilogue,
      ),
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return '';

    if (date is DateTime) {
      return '${date.day.toString().padLeft(2, '0')}-${date.month.toString().padLeft(2, '0')}-${date.year}';
    }
    return date.toString();
  }

  Widget _buildFilterSection(String title, String value, List<String> items, Function(String) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600).withEpilogue,
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              items: items.map((item) {
                return DropdownMenuItem(
                  value: item,
                  child: Text(
                    item,
                    style: const TextStyle(
                      fontSize: 12,
                    ).withEpilogue,
                  ),
                );
              }).toList(),
              onChanged: (newValue) {
                if (newValue != null) onChanged(newValue);
              },
            ),
          ),
        ),
      ],
    );
  }
}
