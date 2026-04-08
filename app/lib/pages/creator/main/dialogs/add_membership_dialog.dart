import 'dart:io';

import 'package:flutter/material.dart';
import 'package:patreon-clone/models/membership/membership_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/helpers/image_helper.dart';
import 'package:provider/provider.dart';

import 'package:patreon-clone/backend/authentication/authentication_provider.dart';
import 'package:patreon-clone/backend/memberships/membership_controller.dart';
import 'package:patreon-clone/backend/memberships/membership_provider.dart';
import 'package:patreon-clone/utils/my_toast.dart';

class AddMembershipDialog extends StatefulWidget {
  final MembershipModel? membership;

  const AddMembershipDialog({super.key, this.membership});

  @override
  State<AddMembershipDialog> createState() => _AddMembershipDialogState();
}

class _AddMembershipDialogState extends State<AddMembershipDialog> {
  late MembershipController _membershipController;
  late MembershipProvider _membershipProvider;
  late AuthenticationProvider _authenticationProvider;
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _monthlyRateController = TextEditingController(text: "0.0");
  File? _selectedImage;

  @override
  void initState() {
    super.initState();
    _membershipProvider = context.read<MembershipProvider>();
    _authenticationProvider = context.read<AuthenticationProvider>();
    _membershipController = MembershipController(provider: _membershipProvider);

    if (widget.membership != null) {
      _nameController.text = widget.membership!.name;
      _descriptionController.text = widget.membership!.description;
      if (widget.membership!.monthlyRate != 0) {
        _monthlyRateController.text = widget.membership!.monthlyRate.toString();
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _monthlyRateController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final File? processedImage = await ImageHelper.pickAndProcessImage(context: context, isProfilePhoto: true);

    if (processedImage != null) {
      setState(() {
        _selectedImage = processedImage;
      });
    }
  }

  void _removeImage() {
    setState(() {
      _selectedImage = null;
    });
  }

  Future<void> _createMembershipTier() async {
    final user = _authenticationProvider.userModel.get();
    if (user == null || !user.hasCompletedStripeOnboarding) {
      MyToast.showError(
        context: context,
        msg: "Publish your account before you can create tiers",
      );
      return;
    }

    if (_selectedImage == null && (widget.membership == null || widget.membership!.coverImage.isEmpty)) {
      MyToast.showError(
        context: context,
        msg: "Please select a cover image for the membership tier",
      );
      return;
    }

    // _monthlyRateController validation: greater than 0 and valid double and can be zero and less than 500
    if (_monthlyRateController.text.trim().isNotEmpty) {
      final double? monthlyRate = double.tryParse(_monthlyRateController.text.trim());
      if (monthlyRate == null || monthlyRate < 0 || monthlyRate > 500) {
        MyToast.showError(
          context: context,
          msg: "Please enter a valid monthly rate between 0 and 500",
        );
        return;
      }
    } else {
      _monthlyRateController.text = "0.0";
    }

    final String name = _nameController.text.trim();
    final String description = _descriptionController.text.trim();
    final double monthlyRate = double.tryParse(_monthlyRateController.text.trim()) ?? 0.0;

    final MembershipModel modelToSend = MembershipModel(
      id: widget.membership?.id ?? '',
      name: name,
      description: description,
      monthlyRate: monthlyRate,
      yearlyPrice: widget.membership?.yearlyPrice ?? 0.0,
      benefits: widget.membership?.benefits ?? [],
      isLimited: widget.membership?.isLimited ?? false,
      seatsLeft: widget.membership?.seatsLeft ?? 0,
      isFeatured: widget.membership?.isFeatured ?? false,
      isActive: widget.membership?.isActive ?? true,
      coverImage: widget.membership?.coverImage ?? '',
      subscriberCount: widget.membership?.subscriberCount ?? 0,
      creator: widget.membership?.creator ?? '',
      totalEarnings: widget.membership?.totalEarnings ?? 0.0,
      stripePriceId: widget.membership?.stripePriceId ?? '',
      stripeProductId: widget.membership?.stripeProductId ?? '',
    );

    MembershipModel? model = await _membershipController.createOrUpdateMembership(
      model: modelToSend,
      coverImage: _selectedImage,
    );

    MyPrint.printOnConsole("New membership created/updated: ${model?.toMap()}");

    if (model != null) {
      Navigator.of(context).pop(model);
    } else {}
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        const SizedBox(height: 120),
        ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: 400,
            maxHeight: MediaQuery.of(context).size.height * 0.85,
          ),
          child: Material(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              width: MediaQuery.of(context).size.width * 0.88,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: MediaQuery.of(context).size.width * 0.88,
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Colors.grey, width: 0.2),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          widget.membership == null ? 'Add Membership Tier' : 'Update Membership Tier',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w600,
                          ).withEpilogue,
                        ),
                        IconButton(
                          onPressed: () => Navigator.of(context).pop(),
                          icon: const Icon(Icons.close, size: 20),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      ],
                    ),
                  ),
                  Flexible(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Center(
                            child: GestureDetector(
                              onTap: _selectedImage == null ? _pickImage : null,
                              child: Container(
                                width: 120,
                                height: 120,
                                decoration: BoxDecoration(
                                  color: Colors.grey[100],
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Colors.grey[300]!,
                                    style: BorderStyle.solid,
                                    width: 1,
                                  ),
                                ),
                                child: _selectedImage != null
                                    ? Stack(
                                        children: [
                                          ClipRRect(
                                            borderRadius: BorderRadius.circular(7),
                                            child: Image.file(
                                              _selectedImage!,
                                              width: 120,
                                              height: 120,
                                              fit: BoxFit.cover,
                                            ),
                                          ),
                                          Positioned(
                                            top: 4,
                                            right: 4,
                                            child: GestureDetector(
                                              onTap: _removeImage,
                                              child: Container(
                                                padding: const EdgeInsets.all(2),
                                                decoration: const BoxDecoration(
                                                  color: Colors.black54,
                                                  shape: BoxShape.circle,
                                                ),
                                                child: const Icon(
                                                  Icons.close,
                                                  color: Colors.white,
                                                  size: 16,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      )
                                    : widget.membership != null && widget.membership!.coverImage.isNotEmpty
                                        ? Stack(
                                            children: [
                                              ClipRRect(
                                                borderRadius: BorderRadius.circular(7),
                                                child: CommonCachedNetworkImage(
                                                  imageUrl: widget.membership!.coverImage,
                                                  height: 120,
                                                  width: 120,
                                                ),
                                              ),
                                              Positioned(
                                                top: 4,
                                                right: 4,
                                                child: GestureDetector(
                                                  onTap: _removeImage,
                                                  child: Container(
                                                    padding: const EdgeInsets.all(2),
                                                    decoration: const BoxDecoration(
                                                      color: Colors.black54,
                                                      shape: BoxShape.circle,
                                                    ),
                                                    child: const Icon(
                                                      Icons.close,
                                                      color: Colors.white,
                                                      size: 16,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          )
                                        : Column(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Icon(
                                                Icons.image_outlined,
                                                size: 32,
                                                color: Colors.grey[600],
                                              ),
                                              const SizedBox(height: 8),
                                              Text(
                                                'Recommended size',
                                                style: TextStyle(
                                                  fontSize: 9,
                                                  fontWeight: FontWeight.w500,
                                                  color: Colors.grey[700],
                                                ).withEpilogue,
                                              ),
                                              Text(
                                                '1024×1024px. JPG, JPEG, PNG, or GIF. Max 2 GB.',
                                                style: TextStyle(
                                                  fontSize: 9,
                                                  color: Colors.grey[600],
                                                ).withEpilogue,
                                                textAlign: TextAlign.center,
                                              ),
                                            ],
                                          ),
                              ),
                            ),
                          ),
                          if (_selectedImage == null) ...[
                            const SizedBox(height: 16),
                            Center(
                              child: ElevatedButton(
                                onPressed: _pickImage,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF1976D2),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 8,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                ),
                                child: Text(
                                  'Select Image',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w500,
                                  ).withEpilogue,
                                ),
                              ),
                            ),
                          ],
                          const SizedBox(height: 24),
                          Text(
                            'Tier Name',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: Colors.black87,
                            ).withEpilogue,
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _nameController,
                            decoration: InputDecoration(
                              hintText: 'Enter tier name',
                              hintStyle: TextStyle(
                                color: Colors.grey[500],
                                fontSize: 14,
                              ).withEpilogue,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: const BorderSide(color: Color(0xFF1976D2)),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 12,
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Monthly Price',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: Colors.black87,
                            ).withEpilogue,
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _monthlyRateController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: InputDecoration(
                              hintText: 'e.g. 5.99 (leave 0 if free)',
                              hintStyle: TextStyle(
                                color: Colors.grey[500],
                                fontSize: 14,
                              ).withEpilogue,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: const BorderSide(color: Color(0xFF1976D2)),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 12,
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Description',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: Colors.black87,
                            ).withEpilogue,
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _descriptionController,
                            maxLines: 4,
                            decoration: InputDecoration(
                              hintText: '(Optional) Add description',
                              hintStyle: TextStyle(
                                color: Colors.grey[500],
                                fontSize: 14,
                              ).withEpilogue,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: BorderSide(color: Colors.grey[300]!),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(6),
                                borderSide: const BorderSide(color: Color(0xFF1976D2)),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Action Buttons
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Colors.grey, width: 0.2),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: Text(
                            'Cancel',
                            style: TextStyle(
                              color: Colors.grey[700],
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ).withEpilogue,
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: _nameController.text.trim().isNotEmpty ? _createMembershipTier : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1976D2),
                            foregroundColor: Colors.white,
                            disabledBackgroundColor: Colors.grey[300],
                            disabledForegroundColor: Colors.grey[600],
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 12,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                          child: Text(
                            widget.membership == null ? 'Create Membership' : 'Update Membership',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ).withEpilogue,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
