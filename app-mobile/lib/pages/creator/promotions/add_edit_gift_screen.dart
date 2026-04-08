import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/models/promotions/gift/gift_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/memberships/membership_controller.dart';
import 'package:patreon-clone/backend/memberships/membership_provider.dart';
import 'package:patreon-clone/backend/promotions/gifts/gifts_controller.dart';
import 'package:patreon-clone/backend/promotions/gifts/gifts_provider.dart';
import 'package:patreon-clone/constants/constants.dart';

class AddEditGiftScreen extends StatefulWidget {
  final GiftModel? gift;

  const AddEditGiftScreen({super.key, this.gift});

  @override
  State<AddEditGiftScreen> createState() => _AddEditGiftScreenState();
}

class _AddEditGiftScreenState extends State<AddEditGiftScreen> with MySafeState {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _codeController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _durationController = TextEditingController();

  late GiftProvider _giftProvider;
  late GiftController _giftController;
  late MembershipProvider _membershipProvider;
  late MembershipController _membershipController;

  static const appliesToOptions = {
    'All tiers': GiftsApplicableTo.all,
    'Selected tiers only': GiftsApplicableTo.selected,
  };

  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now().add(const Duration(days: 30));
  TimeOfDay _startTime = TimeOfDay.now();
  TimeOfDay _endTime = TimeOfDay.now();

  String _giftType = 'Free trial (limited time access)';
  // final String _applicableTo = 'All tiers';
  bool _isPublic = false;
  String _appliesTo = 'All tiers';
  final List<String> _appliesOptions = ['All tiers', 'Selected tiers only'];
  List<String> _selectedTiers = [];
  List<MembershipModel> _allMemberships = [];

  static const Map<String, String> giftTypeDisplayToApi = {
    'Free trial (limited time access)': 'free_trial',
    'Free Content (coming soon)': 'free_content',
  };

  static const Map<String, String> giftTypeApiToDisplay = {
    'free_trial': 'Free trial (limited time access)',
    'free_content': 'Free Content (coming soon)',
  };

  // Update the gift type options
  final List<String> _giftTypeOptions = [
    'Free trial (limited time access)',
    'Free Content (coming soon)',
  ];

  // final List<String> _applicableOptions = ['All tiers', 'Selected tiers only'];

  void _generateGiftCode() {
    final random = DateTime.now().millisecondsSinceEpoch.toString().substring(8);
    _codeController.text = 'GIFT$random';
  }

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isStart ? _startDate : _endDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
        } else {
          _endDate = picked;
        }
      });
    }
  }

  Future<void> _selectTime(BuildContext context, bool isStart) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: isStart ? _startTime : _endTime,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            timePickerTheme: TimePickerThemeData(
              hourMinuteTextStyle: const TextStyle(fontSize: 14),
              dayPeriodTextStyle: const TextStyle(fontSize: 12),
              helpTextStyle: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: themeData.colorScheme.onSurface,
              ),
              entryModeIconColor: Colors.grey,
            ),
            textTheme: Theme.of(context).textTheme.copyWith(
                  titleLarge: const TextStyle(fontSize: 14),
                  bodyMedium: const TextStyle(fontSize: 12),
                ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startTime = picked;
        } else {
          _endTime = picked;
        }
      });
    }
  }

  Future<void> _createGift() async {
    if (_formKey.currentState!.validate()) {
      // Create GiftModel instance
      final gift = GiftModel(
        id: widget.gift?.id ?? '',
        title: _nameController.text.trim(),
        code: _codeController.text.trim(),
        description: _descriptionController.text.trim(),
        giftType: giftTypeDisplayToApi[_giftType] ?? 'free_trial',
        durationDays: double.tryParse(_durationController.text.trim()) ?? 0.0,
        applicableTo: appliesToOptions[_appliesTo] ?? GiftsApplicableTo.all,
        isPublic: _isPublic,
        startDate: DateTime(
          _startDate.year,
          _startDate.month,
          _startDate.day,
          _startTime.hour,
          _startTime.minute,
        ),
        endDate: DateTime(
          _endDate.year,
          _endDate.month,
          _endDate.day,
          _endTime.hour,
          _endTime.minute,
        ),
        applicableTiers: _appliesTo == 'all'
            ? []
            : _selectedTiers.map((id) {
                final membership = _allMemberships.firstWhere((m) => m.id == id);
                return {
                  "id": membership.id,
                  "name": membership.name,
                };
              }).toList(),
      );

      MyPrint.printOnConsole("request to create discount: $gift");
      GiftModel? result = await _giftController.upsertGift(gift);
      MyPrint.printOnConsole("result after creating Gift: $result");

      if (result != null) {
        Navigator.pop(context, result);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to save gift')),
        );
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _codeController.dispose();
    _descriptionController.dispose();
    _durationController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _giftProvider = context.read<GiftProvider>();
    _giftController = GiftController(provider: _giftProvider);
    _membershipProvider = context.read<MembershipProvider>();
    _membershipController = MembershipController(provider: _membershipProvider);

    _generateGiftCode();

    _allMemberships = _membershipProvider.memberships.getList();
    if (_allMemberships.isEmpty) {
      _membershipController.getMemberships(isNotify: false).then((_) {
        setState(() {
          _allMemberships = _membershipProvider.memberships.getList();
        });
      });
    }

    if (widget.gift != null) {
      final g = widget.gift!;
      _nameController.text = g.title;
      _codeController.text = g.code;
      _descriptionController.text = g.description;
      _durationController.text = g.durationDays.toString();
      _giftType = giftTypeApiToDisplay[g.giftType] ?? 'Free trial (limited time access)';
      _isPublic = g.isPublic;
      _appliesTo = g.applicableTo;
      _selectedTiers = g.applicableTiers.map((tier) => tier['id'] ?? '').where((id) => id.isNotEmpty).toList();
      _startDate = g.startDate;
      _endDate = g.endDate;
      _startTime = TimeOfDay.fromDateTime(g.startDate);
      _endTime = TimeOfDay.fromDateTime(g.endDate);
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.gift == null ? 'Create Gift' : 'Edit Gift',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: themeData.colorScheme.onPrimary,
          ).withTiempos,
        ),
        backgroundColor: themeData.colorScheme.primary,
        leading: IconButton(
          icon: Icon(
            Icons.chevron_left,
            color: themeData.colorScheme.onPrimary,
            size: 32,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        elevation: 0,
        centerTitle: true,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionHeader('Basic Information'),
              _buildTextField(
                label: 'Name',
                controller: _nameController,
                hint: 'Name of the gift',
                required: true,
              ),
              const SizedBox(height: 12),
              _buildTextField(
                label: 'Code',
                controller: _codeController,
                hint: 'e.g., GIFT2024',
                suffix: IconButton(
                  icon: const Icon(Icons.refresh, size: 18),
                  onPressed: _generateGiftCode,
                ),
                required: true,
              ),
              const SizedBox(height: 12),
              _buildTextField(
                label: 'Description',
                controller: _descriptionController,
                hint: 'Short description of this gift',
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              _buildDropdown(
                label: 'Gift type',
                value: _giftType,
                options: _giftTypeOptions,
                onChanged: (value) {
                  setState(() {
                    _giftType = value!;
                  });
                },
              ),
              const SizedBox(height: 12),
              _buildTextField(
                label: 'Duration (days)',
                controller: _durationController,
                hint: '7',
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                required: true,
              ),
              _buildSectionHeader('Applicable Tiers'),
              _buildAppliesToSection(),
              _buildSectionHeader('Visibility'),
              _buildSwitchRow(
                title: 'Display this gift publicly',
                subtitle: 'Anyone (except paid members) can see this gift',
                value: _isPublic,
                onChanged: (value) {
                  setState(() {
                    _isPublic = value;
                  });
                },
              ),
              _buildSectionHeader('Schedule'),
              _buildDateTimeField(
                label: 'Start date',
                date: _startDate,
                time: _startTime,
                onDateTap: () => _selectDate(context, true),
                onTimeTap: () => _selectTime(context, true),
              ),
              const SizedBox(height: 12),
              _buildDateTimeField(
                label: 'End date',
                date: _endDate,
                time: _endTime,
                onDateTap: () => _selectDate(context, false),
                onTimeTap: () => _selectTime(context, false),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      child: Text(
                        'Cancel',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF4A5568)).withEpilogue,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _createGift,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF4299E1),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      child: Text(
                        widget.gift == null ? 'Create gift' : 'Update gift',
                        style: const TextStyle(fontSize: 12, color: Colors.white).withEpilogue,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: MediaQuery.of(context).viewPadding.bottom + 5),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 16, 4, 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: Color(0xFF2D3748),
        ).withEpilogue,
      ),
    );
  }

  Widget _buildAppliesToSection() {
    // Debug print to check memberships data
    MyPrint.printOnConsole('All memberships: $_allMemberships');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(bottom: 6.0, top: 12.0),
          child: Text('Applies to',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 12,
                color: Color(0xFF2D3748),
              )),
        ),
        ..._appliesOptions.map((option) {
          return RadioListTile<String>(
            contentPadding: EdgeInsets.zero,
            dense: true,
            visualDensity: VisualDensity.compact,
            title: Text(option, style: const TextStyle(fontSize: 12)),
            value: option,
            groupValue: _appliesTo,
            onChanged: (value) {
              setState(() {
                _appliesTo = value!;
                if (_appliesTo == 'All tiers') _selectedTiers.clear();
              });
            },
          );
        }),
        if (_appliesTo == 'Selected tiers only') ...[
          const Padding(
            padding: EdgeInsets.only(left: 6, top: 8, bottom: 2),
            child: Text('Select tiers', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500)),
          ),
          ..._allMemberships.map(
            (membership) => CheckboxListTile(
              dense: true,
              visualDensity: VisualDensity.compact,
              contentPadding: const EdgeInsets.only(left: 12, right: 0),
              title: RichText(
                text: TextSpan(
                  style: const TextStyle(fontSize: 11.5, color: Colors.black),
                  children: [
                    TextSpan(text: membership.name),
                    if (membership.monthlyRate > 0) ...[
                      const TextSpan(text: " ("),
                      const TextSpan(
                        text: "\$",
                        style: TextStyle(color: Colors.black), // pitch black dollar
                      ),
                      TextSpan(
                        text: "${membership.monthlyRate.toStringAsFixed(0)}/month",
                      ),
                      const TextSpan(text: ")"),
                    ] else
                      const TextSpan(text: " (Free)"),
                  ],
                ),
              ),
              value: _selectedTiers.contains(membership.id),
              onChanged: (bool? checked) {
                setState(() {
                  if (checked == true) {
                    _selectedTiers.add(membership.id);
                  } else {
                    _selectedTiers.remove(membership.id);
                  }
                });
              },
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    String? hint,
    int maxLines = 1,
    TextInputType? keyboardType,
    List<TextInputFormatter>? inputFormatters,
    Widget? suffix,
    bool required = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            style: const TextStyle(fontSize: 11, color: Color(0xFF4A5568)).withEpilogue,
            children: [
              TextSpan(text: label),
              if (required)
                TextSpan(
                  text: ' *',
                  style: const TextStyle(color: Colors.red).withEpilogue,
                ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: keyboardType,
          inputFormatters: inputFormatters,
          style: const TextStyle(fontSize: 12).withEpilogue,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(fontSize: 12, color: Color(0xFFA0AEC0)).withEpilogue,
            suffixIcon: suffix,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: const BorderSide(color: Color(0xFF4299E1)),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            isDense: true,
          ),
          validator: required
              ? (value) {
                  if (value == null || value.isEmpty) {
                    return 'This field is required';
                  }
                  return null;
                }
              : null,
        ),
      ],
    );
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<String> options,
    required ValueChanged<String?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: Color(0xFF4A5568)).withEpilogue,
        ),
        const SizedBox(height: 4),
        DropdownButtonFormField<String>(
          value: value,
          onChanged: onChanged,
          style: const TextStyle(fontSize: 12, color: Color(0xFF2D3748)).withEpilogue,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: const BorderSide(color: Color(0xFF4299E1)),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            isDense: true,
          ),
          items: options.map((option) {
            return DropdownMenuItem<String>(
              value: option,
              child: Text(option, style: const TextStyle(fontSize: 12).withEpilogue),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildDateTimeField({
    required String label,
    required DateTime date,
    required TimeOfDay time,
    required VoidCallback onDateTap,
    required VoidCallback onTimeTap,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: Color(0xFF4A5568),
          ).withEpilogue,
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            Expanded(
              flex: 2,
              child: InkWell(
                onTap: onDateTap,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 14, color: Color(0xFF718096)),
                      const SizedBox(width: 6),
                      Text(
                        '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF2D3748)).withEpilogue,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: InkWell(
                onTap: onTimeTap,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.access_time, size: 14, color: Color(0xFF718096)),
                      const SizedBox(width: 6),
                      Text(
                        time.format(context),
                        style: const TextStyle(fontSize: 12, color: Color(0xFF2D3748)).withEpilogue,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSwitchRow({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500).withEpilogue,
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 10, color: Color(0xFF718096)).withEpilogue,
                ),
              ],
            ),
          ),
          Transform.scale(
            scale: 0.8,
            child: Switch(
              value: value,
              onChanged: onChanged,
              activeColor: const Color(0xFF4299E1),
            ),
          ),
        ],
      ),
    );
  }
}
