import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
// import 'package:patreon_clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon_clone/navigation/navigation_type.dart';
import 'package:patreon_clone/config/index.dart';
import 'package:patreon_clone/backend/user/user_repository.dart';
import 'package:patreon_clone/constants/shared_preference_constants.dart';
import 'package:patreon_clone/constants/user_constants.dart';
import 'package:patreon_clone/constants/app_constants.dart';
import 'package:patreon_clone/constants/data_constants.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/utils/my_toast.dart';
import 'package:patreon_clone/managers/shared_pref_manager.dart';

import 'package:patreon_clone/styles/font_manager.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import 'package:patreon_clone/backend/authentication/authentication_provider.dart';
import 'package:patreon_clone/navigation/app_router.dart';

class BecomeCreatorOnboarding extends StatefulWidget {
  static const String routeName = '/BecomeCreatorOnboarding';

  const BecomeCreatorOnboarding({super.key});

  @override
  State<BecomeCreatorOnboarding> createState() => _BecomeCreatorOnboardingState();
}

class _BecomeCreatorOnboardingState extends State<BecomeCreatorOnboarding> with MySafeState {
  final TextEditingController _urlController = TextEditingController();
  String? _selectedGender;
  String? _selectedContentVisibility;
  String? _selectedCreatorCategory;
  bool _isAgreed = false;
  // final bool _isLoading = false;
  late AuthenticationProvider _authProvider;

  final RegExp _slugAllowed = RegExp(r'^[a-z0-9](?:[a-z0-9._-]{0,28}[a-z0-9])?$');

  final Map<String, String> _genderOptions = {
    Gender.male: 'Male',
    Gender.female: 'Female',
    Gender.other: 'Other',
  };

  final Map<String, String> _contentVisibilityOptions = {
    ContentVisibilityTypes.both: 'Everyone - Visible to all users',
    ContentVisibilityTypes.male: 'Male Only - Only visible to male users',
    ContentVisibilityTypes.female: 'Female Only - Only visible to female users',
  };

  bool get _isFormValid {
    final slug = _urlController.text;
    return _slugAllowed.hasMatch(slug) &&
        _selectedGender != null &&
        _selectedContentVisibility != null &&
        _selectedCreatorCategory != null &&
        _isAgreed;
  }

  void _showLoadingDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return Dialog(
          elevation: 0,
          backgroundColor: Colors.transparent,
          child: Center(
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircularProgressIndicator(),
                  const SizedBox(height: 20),
                  Text('Submitting...', style: const TextStyle().withEpilogue),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Future<void> _submitOnboarding() async {
    final token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);

    if (token == null || token.isEmpty) {
      MyToast.showError(context: context, msg: 'Authentication required');
      return;
    }

    _showLoadingDialog();

    try {
      final repo = UserRepository();
      final result = await repo.onboardCreator(
        token: token,
        username: _urlController.text.trim(),
        contentVisibleTo: _selectedContentVisibility!,
        category: _selectedCreatorCategory!,
      );

      if (mounted) Navigator.of(context, rootNavigator: true).pop();

      if (result.isSuccess && result.data != null) {
        final user = result.data!;
        final userModel = _authProvider.userModel.get();
        userModel?.updateFromMap(user.toMap());
        if (userModel != null) {
          _authProvider.userModel.set(value: userModel, isNotify: true);
        }
        if (mounted) {
          MyToast.showSuccess(context: context, msg: 'Onboarded successfully');
          context.pushNamed(Routes.creatorMain);
        }
      } else {
        if (mounted) {
          MyToast.showError(context: context, msg: result.errorMessage ?? 'Failed to onboard');
        }
      }
    } catch (e) {
      if (mounted) {
        Navigator.of(context, rootNavigator: true).pop();
        MyToast.showError(context: context, msg: 'Error: $e');
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _authProvider = context.read<AuthenticationProvider>();
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    var sizedBox = const SizedBox(height: 4);
    return Scaffold(
      appBar: AppBar(
        backgroundColor: themeData.primaryColor,
        centerTitle: false,
        title: Text(
          'K.',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: themeData.colorScheme.onPrimary,
            letterSpacing: -0.5,
          ).withTiempos,
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                height: 160,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: themeData.primaryColor,
                  borderRadius: BorderRadius.circular(16),
                  image: const DecorationImage(
                    image: AssetImage(
                      AppAssets.bgImage,
                    ),
                    opacity: 0.2,
                    fit: BoxFit.cover,
                  ),
                ),
                child: Image.asset(
                  AppAssets.create,
                  fit: BoxFit.fitHeight,
                ),
              ),
            ),
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Choose your URL',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  sizedBox,
                  Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            '${AppConfig.frontendDomain.replaceAll('https://', '').replaceAll('http://', '').replaceAll('www.', '')}/',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                        ),
                        Expanded(
                          child: TextFormField(
                            controller: _urlController,
                            keyboardType: TextInputType.url,
                            textInputAction: TextInputAction.done,
                            inputFormatters: [
                              FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9._-]')),
                              TextInputFormatter.withFunction((oldValue, newValue) {
                                String t = newValue.text.toLowerCase();

                                t = t.replaceFirst(RegExp(r'^[-._]+'), '');

                                t = t.replaceAllMapped(RegExp(r'[-._]{2,}'), (m) => m.group(0)![0]);

                                const maxLen = 30;
                                if (t.length > maxLen) t = t.substring(0, maxLen);

                                return TextEditingValue(
                                  text: t,
                                  selection: TextSelection.collapsed(offset: t.length),
                                );
                              }),
                            ],
                            onChanged: (_) => setState(() {}),
                            style: const TextStyle(fontSize: 14),
                            decoration: InputDecoration(
                              hintText: 'your-handle',
                              hintStyle: TextStyle(fontSize: 13, color: Colors.grey[400]).withEpilogue,
                              border: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 15),
                  const Text(
                    'Gender',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  sizedBox,
                  Container(
                    height: 48, // Changed from 40 to 48
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: DropdownButtonFormField<String>(
                      value: _selectedGender,
                      onChanged: (value) => setState(() => _selectedGender = value),
                      decoration: InputDecoration(
                        hintText: 'Select your gender',
                        hintStyle: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[400],
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                      style: const TextStyle(fontSize: 14, color: Colors.black),
                      dropdownColor: Colors.white,
                      items: _genderOptions.entries.map((entry) {
                        return DropdownMenuItem<String>(
                          value: entry.key,
                          child: Text(
                            entry.value == "Other" ? "Group" : entry.value,
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 15),
                  const Text(
                    'Content Visibility',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  sizedBox,
                  Container(
                    height: 48, // Changed from 40 to 48
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: DropdownButtonFormField<String>(
                      value: _selectedContentVisibility,
                      onChanged: (value) => setState(() => _selectedContentVisibility = value),
                      decoration: InputDecoration(
                        hintText: 'Everyone - Visible to all users',
                        hintStyle: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[400],
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                      style: const TextStyle(fontSize: 14, color: Colors.black),
                      dropdownColor: Colors.white,
                      items: _contentVisibilityOptions.entries.map((entry) {
                        return DropdownMenuItem<String>(
                          value: entry.key,
                          child: Text(entry.value),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 15),
                  const Text(
                    'Creator Category',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                    ),
                  ),
                  sizedBox,
                  Container(
                    height: 48, // Changed from 40 to 48
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: DropdownButtonFormField<String>(
                      value: _selectedCreatorCategory,
                      onChanged: (value) => setState(() => _selectedCreatorCategory = value),
                      decoration: InputDecoration(
                        hintText: 'General Education',
                        hintStyle: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[400],
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      ),
                      style: const TextStyle(fontSize: 14, color: Colors.black),
                      dropdownColor: Colors.white,
                      items: categories.map((String value) {
                        return DropdownMenuItem<String>(
                          value: value,
                          child: Text(value),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 15),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Transform.scale(
                        scale: 0.9,
                        child: Checkbox(
                          value: _isAgreed,
                          onChanged: (value) => setState(() => _isAgreed = value ?? false),
                          activeColor: themeData.primaryColor,
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: RichText(
                          text: TextSpan(
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.black87,
                              height: 1.4,
                            ),
                            children: [
                              TextSpan(text: AppConfig.creatorConsent()),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: _isFormValid ? _submitOnboarding : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isFormValid ? themeData.primaryColor : Colors.grey[300],
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text(
                        'Continue',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        'Back',
                        style: TextStyle(
                          fontSize: 14,
                          color: themeData.primaryColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
