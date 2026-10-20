import 'dart:io';

import 'package:country_picker/country_picker.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:patreon_clone/backend/user/user_repository.dart';
import 'package:patreon_clone/constants/shared_preference_constants.dart';
import 'package:patreon_clone/constants/user_constants.dart';
import 'package:patreon_clone/models/user/data_model/user_model.dart';
import 'package:patreon_clone/models/user/request_model/profile_update_request_model.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/utils/my_toast.dart';
import 'package:patreon_clone/utils/my_utils.dart';
import 'package:patreon_clone/managers/shared_pref_manager.dart';
import 'package:patreon_clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon_clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:patreon_clone/helpers/image_helper.dart';
import 'package:provider/provider.dart';

import 'package:go_router/go_router.dart';
import 'package:patreon_clone/navigation/app_router.dart';

import 'package:patreon_clone/backend/authentication/authentication_provider.dart';
import 'package:patreon_clone/backend/authentication/authentication_repository.dart';

class SignUpScreen extends StatefulWidget {
  static const String routeName = "/SignUpScreen";

  final UserModel? userModel;
  final bool isGoogleSignIn;

  const SignUpScreen({
    super.key,
    this.userModel,
    this.isGoogleSignIn = false,
  });

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> with MySafeState {
  bool isLoading = false;
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  late AuthenticationRepository authenticationRepository;
  late UserRepository userRepository;
  late AuthenticationProvider authenticationProvider;

  // Controllers, FocusNodes, and Field States...
  TextEditingController firstNameController = TextEditingController();
  TextEditingController lastNameController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  TextEditingController countryController = TextEditingController();
  final FocusNode firstNameFocusNode = FocusNode();
  final FocusNode lastNameFocusNode = FocusNode();
  final FocusNode passwordFocusNode = FocusNode();
  bool isFirstNameEntered = false;
  bool isLastNameEntered = false;
  bool isPasswordEntered = false;
  bool passwordVisible = false;

  File? _selectedImage;
  String? selectedCountry;
  String? selectedGender;
  String? selectedContentGenderPreference;
  bool isGenderSelected = false;

  bool isFormValid() {
    if (widget.isGoogleSignIn) {
      return isFirstNameEntered && isLastNameEntered && isGenderSelected;
    }
    return isFirstNameEntered &&
        isLastNameEntered &&
        isPasswordEntered &&
        isGenderSelected &&
        passwordController.text.length >= 8;
  }

  // MODIFIED: Added logic to download and re-upload the Google Photo
  void signUp() async {
    if (!_formKey.currentState!.validate() || !isFormValid()) {
      MyToast.showCustomToast(
          context: context, msg: "Please fill all required fields", toastColor: Colors.orange, textColor: Colors.white);
      return;
    }

    isLoading = true;
    mySetState();

    // STEP 1: Register User
    UserModel newUserModel = UserModel(
      userId: MyUtils.getNewId(),
      firstName: firstNameController.text.trim(),
      lastName: lastNameController.text.trim(),
      displayName: "${firstNameController.text.trim()} ${lastNameController.text.trim()}",
      email: widget.userModel?.email ?? '',
      gender: GenderTypes.uiToApi(selectedGender) ?? '',
      authenticationMode: widget.userModel?.authenticationMode ?? '',
      password: passwordController.text,
    );
    final result = await authenticationRepository.registerNewUser(newUserModel);

    if (!result.isSuccess || result.data == null) {
      MyToast.showError(context: context, msg: result.errorMessage ?? 'Registration failed. Please try again.');
      isLoading = false;
      mySetState();
      return;
    }

    final String token = result.data!['token'] as String? ?? '';
    final userData = result.data!['user'] ?? result.data!;
    UserModel registeredUser = UserModel.fromMap(userData as Map<String, dynamic>);
    await SharedPrefManager().setString(SharedPreferenceConstants.authToken, token);

    // STEP 2: Handle Profile Photo
    bool profileUpdateSuccess = true;
    File? photoToUpload;

    if (_selectedImage != null) {
      photoToUpload = _selectedImage;
    }

    if (photoToUpload != null) {
      final photoResult = await userRepository.uploadProfilePhoto(token: token, imageFile: photoToUpload);
      if (photoResult.isSuccess && photoResult.data != null) {
        registeredUser.profilePicture = photoResult.data!;
      } else {
        profileUpdateSuccess = false;
        MyToast.showError(context: context, msg: photoResult.errorMessage ?? 'Account created, but failed to upload photo.');
      }
    }

    // STEP 3: Update other profile details
    if (selectedCountry != null || selectedContentGenderPreference != null) {
      final updateModel = ProfileUpdateRequestModel(
        displayName: registeredUser.displayName,
        email: registeredUser.email,
        gender: GenderTypes.uiToApi(selectedGender),
        countryOfResidence: selectedCountry,
        genderPreference: GenderPreferenceTypes.uiToApi(selectedContentGenderPreference),
      );

      final updateResult = await userRepository.updateUserProfileFromModel(token: token, data: updateModel);
      if (updateResult.isSuccess && updateResult.data != null) {
        registeredUser.country = selectedCountry ?? '';
        registeredUser.preferredContentGender = GenderPreferenceTypes.uiToApi(selectedContentGenderPreference) ?? '';
      } else {
        profileUpdateSuccess = false;
        MyToast.showError(context: context, msg: updateResult.errorMessage ?? 'Account created, but failed to save profile details.');
      }
    }

    // STEP 4: Finalize and navigate
    await SharedPrefManager().setString(SharedPreferenceConstants.userId, registeredUser.userId);
    await SharedPrefManager().setString(SharedPreferenceConstants.loginSessionId, MyUtils.getNewId());
    authenticationProvider.userModel.set(value: registeredUser, isNotify: true);

    isLoading = false;
    mySetState();

    MyToast.showSuccess(
        context: context,
        msg: profileUpdateSuccess ? "Registration successful" : "Welcome! You can complete your profile later.");

    context.goNamed(Routes.main);
  }

  Future<void> _pickImage() async {
    var file = await ImageHelper.pickAndProcessImage(context: context, isProfilePhoto: true);
    if (file != null) {
      setState(() {
        _selectedImage = file;
      });
    }
  }

  @override
  void initState() {
    super.initState();

    authenticationRepository = AuthenticationRepository();
    userRepository = UserRepository();
    authenticationProvider = context.read<AuthenticationProvider>();

    // Listeners and pre-filling logic...
    firstNameController.addListener(() => setState(() => isFirstNameEntered = firstNameController.text.trim().isNotEmpty));
    lastNameController.addListener(() => setState(() => isLastNameEntered = lastNameController.text.trim().isNotEmpty));
    passwordController.addListener(() => setState(() => isPasswordEntered = passwordController.text.trim().isNotEmpty));

    if (widget.isGoogleSignIn) {
      firstNameController.text = widget.userModel?.firstName ?? '';
      lastNameController.text = widget.userModel?.lastName ?? '';
    }
  }

  @override
  void dispose() {
    firstNameController.dispose();
    lastNameController.dispose();
    passwordController.dispose();
    countryController.dispose();
    firstNameFocusNode.dispose();
    lastNameFocusNode.dispose();
    passwordFocusNode.dispose();
    super.dispose();
  }

  Widget _buildPhotoUploadSection() {
    String initialPhotoUrl = widget.userModel?.profilePicture ?? '';
    bool hasPhoto = _selectedImage != null || initialPhotoUrl.isNotEmpty;

    return Column(
      children: [
        ClipOval(
          child: SizedBox.fromSize(
            size: const Size.fromRadius(50),
            child: _selectedImage != null
                ? Image.file(_selectedImage!, fit: BoxFit.cover)
                : (initialPhotoUrl.isNotEmpty
                    ? CommonCachedNetworkImage(imageUrl: initialPhotoUrl, fit: BoxFit.cover)
                    : Container(
                        color: Colors.grey[200],
                        alignment: Alignment.center,
                        child: Icon(Icons.person, size: 60, color: Colors.grey[400]),
                      )),
          ),
        ),
        TextButton(
          onPressed: _pickImage,
          child: Text(hasPhoto ? "Change Photo" : "Upload Photo"),
        ),
      ],
    );
  }

  // ... rest of the build methods are the same as the previous response ...
  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    return PopScope(
      canPop: !isLoading,
      child: ModalProgressHUD(
        inAsyncCall: isLoading,
        child: Scaffold(
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: _buildForm(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 20),
          _buildTitleSection(),
          const SizedBox(height: 15),
          _buildEmailSection(),
          const SizedBox(height: 20),
          _buildPhotoUploadSection(),
          const SizedBox(height: 20),
          _buildFirstNameField(),
          const SizedBox(height: 15),
          _buildLastNameField(),
          const SizedBox(height: 15),
          _buildGenderField(),
          const SizedBox(height: 15),
          _buildCountryPicker(),
          const SizedBox(height: 15),
          _buildContentGenderPreferenceDropdown(),
          const SizedBox(height: 15),
          if (!widget.isGoogleSignIn) ...[
            _buildPasswordField(),
            const SizedBox(height: 5),
            _buildPasswordRequirementText(),
          ],
          const SizedBox(height: 30),
          _buildContinueButton(),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildContinueButton() {
    final bool isActive = isFormValid();
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: isActive ? themeData.primaryColor : Colors.grey.shade400,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          elevation: 0,
        ),
        onPressed: isActive ? signUp : null,
        child: Text('Agree and Continue',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: isActive ? Colors.white : Colors.black38)
                .withEpilogue),
      ),
    );
  }

  Widget _buildTitleSection() => Text('Complete your account',
      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black).withEpilogue,
      textAlign: TextAlign.center);
  Widget _buildEmailSection() => Text('Signing up as ${widget.userModel?.email ?? ''}',
      style: const TextStyle(fontSize: 16, color: Colors.black87).withEpilogue);

  Widget _buildFirstNameField() => _buildTextField(
      controller: firstNameController, label: 'First Name', validator: (v) => v!.isEmpty ? 'First name required' : null);
  Widget _buildLastNameField() => _buildTextField(
      controller: lastNameController, label: 'Last Name', validator: (v) => v!.isEmpty ? 'Last name required' : null);

  Widget _buildTextField(
      {required TextEditingController controller, required String label, String? Function(String?)? validator}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black87).withEpilogue),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          validator: validator,
          decoration: InputDecoration(
            hintText: label,
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
      ],
    );
  }

  Widget _buildGenderField() {
    return _buildDropdown<String>(
      label: "Gender",
      value: selectedGender,
      hint: "Select Gender",
      items: GenderTypes.uiValues,
      onChanged: (value) => setState(() {
        selectedGender = value;
        isGenderSelected = value != null;
      }),
      validator: (value) => value == null ? 'Please select a gender' : null,
    );
  }

  Widget _buildCountryPicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Country of Residence", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black87)),
        const SizedBox(height: 8),
        TextFormField(
          controller: countryController,
          readOnly: true,
          onTap: () {
            showCountryPicker(
              context: context,
              showPhoneCode: false,
              favorite: const ['IL', 'US', 'FR', 'CA', 'GB'],
              onSelect: (Country c) => setState(() {
                selectedCountry = c.name;
                countryController.text = c.name;
              }),
            );
          },
          decoration: InputDecoration(
            hintText: "Select country",
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            suffixIcon: const Icon(Icons.arrow_drop_down),
          ),
        ),
      ],
    );
  }

  Widget _buildContentGenderPreferenceDropdown() {
    return _buildDropdown<String>(
      label: "Content Preference",
      value: selectedContentGenderPreference,
      hint: "Select content gender preference",
      items: GenderPreferenceTypes.uiValues,
      onChanged: (value) => setState(() => selectedContentGenderPreference = value),
    );
  }

  Widget _buildDropdown<T>(
      {required String label,
      T? value,
      required String hint,
      required List<T> items,
      required ValueChanged<T?> onChanged,
      String? Function(T?)? validator}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black87).withEpilogue),
        const SizedBox(height: 8),
        DropdownButtonFormField<T>(
          value: items.contains(value) ? value : null,
          validator: validator,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          ),
          items: items
              .map((item) => DropdownMenuItem<T>(
                  value: item,
                  child: Text(
                    item.toString() == "Other" ? "Group" : item.toString(),
                  )))
              .toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildPasswordField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Create a password', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black87)),
        const SizedBox(height: 8),
        TextFormField(
          controller: passwordController,
          obscureText: !passwordVisible,
          validator: (v) => v!.length < 8 ? 'Password must be at least 8 characters' : null,
          decoration: InputDecoration(
            hintText: '••••••••',
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            suffixIcon: IconButton(
              icon: Icon(passwordVisible ? CupertinoIcons.eye : CupertinoIcons.eye_slash),
              onPressed: () => setState(() => passwordVisible = !passwordVisible),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordRequirementText() =>
      const Text('Passwords need to have at least 8 characters.', style: TextStyle(fontSize: 10, color: Colors.grey));
}
