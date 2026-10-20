import 'package:flutter/material.dart';
import 'package:patreon_clone/models/membership/membership_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/utils/my_toast.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:provider/provider.dart';

import 'package:patreon_clone/backend/memberships/membership_controller.dart';
import 'package:patreon_clone/backend/memberships/membership_provider.dart';
import 'package:patreon_clone/backend/messaging/direct_message_controller.dart';
import 'package:patreon_clone/backend/messaging/direct_message_provider.dart';
import 'package:patreon_clone/constants/constants.dart';

class CreateGroupChatDialog extends StatefulWidget {
  const CreateGroupChatDialog({super.key});

  @override
  State<CreateGroupChatDialog> createState() => _CreateGroupChatDialogState();
}

class _CreateGroupChatDialogState extends State<CreateGroupChatDialog> with MySafeState {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  bool _isLoading = false;
  String _accessType = ChatAccessTypes.all; // 'all', 'paid', 'selected'
  final List<String> _selectedTiers = [];

  late DirectMessageProvider messageProvider;
  late DirectMessageController messageController;

  late MembershipProvider _membershipProvider;
  late MembershipController _membershipController;
  List<MembershipModel> _membershipTiers = [];

  @override
  void initState() {
    super.initState();
    messageProvider = context.read<DirectMessageProvider>();
    messageController = DirectMessageController(provider: messageProvider);

    _membershipProvider = context.read<MembershipProvider>();
    _membershipController = MembershipController(provider: _membershipProvider);
    _membershipTiers = _membershipProvider.memberships.getList();
    if (_membershipTiers.isEmpty) {
      _membershipController.getMemberships(isNotify: false).then((_) {
        setState(() {
          _membershipTiers = _membershipProvider.memberships.getList();
        });
      });
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    if (_accessType == ChatAccessTypes.select && _selectedTiers.isEmpty) {
      // Use constant
      MyToast.showError(context: context, msg: 'Please select at least one tier.');
      return;
    }

    setState(() => _isLoading = true);

    final newChat = await messageController.createGroupChat(
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      accessType: _accessType,
      accessTiers: _selectedTiers,
    );

    if (mounted) {
      setState(() => _isLoading = false);
      if (newChat != null) {
        MyToast.showSuccess(context: context, msg: 'Group chat created!');
        messageController.getChats(isRefresh: true, isFromCache: false, isNotify: true);
        Navigator.pop(context, newChat);
      } else {
        MyToast.showError(context: context, msg: 'Failed to create group chat.');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    MyPrint.printOnConsole(
        "Membership Tiers: ${_membershipTiers.length}, name: ${_membershipTiers.map((e) => e.name).join(', ')}");

    super.pageBuild();
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('New Chat', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold).withEpilogue),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  )
                ],
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Chat name'),
                validator: (value) => value!.isEmpty ? 'Chat name cannot be empty' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(labelText: 'Description (optional)'),
              ),
              const SizedBox(height: 24),
              Text('Who can access this chat?', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600).withEpilogue),
              _buildAccessOption('All members', ChatAccessTypes.all),
              _buildAccessOption('Paid members only', ChatAccessTypes.paid),
              _buildAccessOption('Select tier', ChatAccessTypes.select),
              if (_accessType == ChatAccessTypes.select) _buildTierSelection(),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).primaryColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    onPressed: _isLoading ? null : _submit,
                    child: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Text(
                            'Create Chat',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAccessOption(String title, String value) {
    return RadioListTile<String>(
      title: Text(title),
      value: value,
      groupValue: _accessType,
      onChanged: (newValue) {
        setState(() {
          _accessType = newValue!;
        });
      },
      contentPadding: EdgeInsets.zero,
    );
  }

  Widget _buildTierSelection() {
    if (_membershipTiers.isEmpty) {
      return const Padding(
        padding: EdgeInsets.only(left: 16.0, top: 8.0),
        child: Text('No membership tiers found.', style: TextStyle(color: Colors.grey)),
      );
    }
    return Container(
      constraints: const BoxConstraints(maxHeight: 150),
      child: ListView(
        shrinkWrap: true,
        children: _membershipTiers.map((tier) {
          return CheckboxListTile(
            title: Text('${tier.name} (${tier.subscriberCount} members)'),
            value: _selectedTiers.contains(tier.id),
            onChanged: (bool? isChecked) {
              setState(() {
                if (isChecked == true) {
                  _selectedTiers.add(tier.id);
                } else {
                  _selectedTiers.remove(tier.id);
                }
              });
            },
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: const EdgeInsets.only(left: 16),
          );
        }).toList(),
      ),
    );
  }
}
