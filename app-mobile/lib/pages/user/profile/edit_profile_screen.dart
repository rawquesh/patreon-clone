import 'dart:io';

import 'package:flutter/material.dart';
import 'package:patreon-clone/config/index.dart';
import 'package:patreon-clone/backend/user/user_repository.dart';
import 'package:patreon-clone/constants/shared_preference_constants.dart';
import 'package:patreon-clone/constants/user_constants.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/models/user/request_model/profile_update_request_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/managers/shared_pref_manager.dart';
import 'package:patreon-clone/pages/components/common/common_cachednetwork_image.dart';
import 'package:patreon-clone/backend/authentication/authentication_controller.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/helpers/image_helper.dart';
import 'package:provider/provider.dart';

import 'package:country_picker/country_picker.dart';

import 'package:patreon-clone/backend/authentication/authentication_provider.dart';
import 'package:patreon-clone/backend/common/dependency_injection.dart';

class EditProfileScreen extends StatefulWidget {
  static const String routeName = "/EditProfileScreen";

  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> with MySafeState {
  late AuthenticationController authenticationController;
  late AuthenticationProvider authenticationProvider;
  late UserModel? userModel;

  final TextEditingController displayNameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController countryController = TextEditingController(); // For Country Picker

  String? selectedGender;
  String? selectedContentGenderPreference;
  String? selectedCountry;

  bool _isLoading = false;
  File? _selectedImage;

  Future<void> _pickImage() async {
    var file = await ImageHelper.pickAndProcessImage(context: context, isProfilePhoto: true);

    if (file != null) {
      MyPrint.printOnConsole("Image picked successfully: ${file.path}");
      setState(() {
        _selectedImage = file;
      });
    }
  }

  Future<void> _uploadProfilePhoto() async {
    MyPrint.printOnConsole("Upload profile photo called");

    if (_selectedImage == null) {
      MyPrint.printOnConsole("No image selected. Upload aborted.");
      return;
    }

    setState(() {
      _isLoading = true;
    });
    MyPrint.printOnConsole("Uploading started, isLoading set to true");

    try {
      String? token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);
      MyPrint.printOnConsole("Retrieved token: $token");

      final UserRepository userRepository = UserRepository();

      final photoUrl = await userRepository.uploadProfilePhoto(
        token: token,
        imageFile: _selectedImage!,
      );
      MyPrint.printOnConsole("Photo URL from server: $photoUrl");

      if (photoUrl != null) {
        if (userModel != null) {
          userModel!.profilePicture = photoUrl;
          authenticationProvider.userModel.set(value: userModel);
          MyPrint.printOnConsole("User model updated with new image URL: $photoUrl");
        }

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile photo updated successfully')),
        );
      } else {
        MyPrint.printOnConsole("Photo upload failed, null URL returned.");
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to upload profile photo')),
        );
      }
    } catch (e) {
      MyPrint.printOnConsole("Error uploading profile photo: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error uploading profile photo: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
      MyPrint.printOnConsole("Uploading complete, isLoading set to false");
    }
  }

  Future<void> _updateProfile() async {
    if (displayNameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Display name cannot be empty')),
      );
      return;
    }

    if (emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Email cannot be empty')),
      );
      return;
    }

    String? mappedGenderPreference;
    if (selectedContentGenderPreference != null) {
      switch (selectedContentGenderPreference) {
        case "Show Both Male and Female":
          mappedGenderPreference = "both";
          break;
        case "Show Only Male":
          mappedGenderPreference = "male";
          break;
        case "Show Only Female":
          mappedGenderPreference = "female";
          break;
      }
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final updateModel = ProfileUpdateRequestModel(
        displayName: displayNameController.text.trim(),
        email: emailController.text.trim(),
        countryOfResidence: selectedCountry,
        gender: GenderTypes.uiToApi(selectedGender),
        genderPreference: GenderPreferenceTypes.uiToApi(selectedContentGenderPreference),
      );

      String? token = await SharedPrefManager().getString(SharedPreferenceConstants.authToken);

      final UserRepository userRepository = UserRepository();
      final updatedUser = await userRepository.updateUserProfileFromModel(
        token: token,
        data: updateModel,
      );

      if (updatedUser != null) {
        if (userModel != null) {
          userModel!.displayName = updatedUser.displayName;
          userModel!.email = updatedUser.email;
          userModel!.country = selectedCountry ?? '';
          userModel!.gender = selectedGender ?? '';
          userModel!.preferredContentGender = mappedGenderPreference ?? '';

          authenticationProvider.userModel.set(value: userModel);
        }

        if (_selectedImage != null) {
          await _uploadProfilePhoto();
        }

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully')),
        );

        Navigator.of(context).pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update profile')),
        );
      }
    } catch (e) {
      MyPrint.printOnConsole("Error updating profile: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating profile: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    authenticationProvider = context.read<AuthenticationProvider>();
    authenticationController = DependencyInjection.authenticationController;
    userModel = authenticationProvider.userModel.get();

    displayNameController.text = userModel?.displayName ?? '';
    emailController.text = userModel?.email ?? '';
    selectedGender = GenderTypes.apiToUi(userModel?.gender);
    selectedContentGenderPreference = GenderPreferenceTypes.apiToUi(userModel?.preferredContentGender);

    selectedCountry = userModel?.country;
    if (selectedCountry != null && selectedCountry!.isNotEmpty) {
      countryController.text = selectedCountry!;
    }
  }

  @override
  Widget build(BuildContext context) {
    MyPrint.printOnConsole("display name: ${userModel?.displayName}");
    super.pageBuild();
    return Scaffold(
      appBar: AppBar(
        title: Text(
          "Profile Settings",
          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white).withEpilogue,
        ),
        backgroundColor: themeData.primaryColor,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 10),
                  _buildPhotoUploadSection(),
                  const SizedBox(height: 10),
                  _buildDisplayNameField(),
                  _buildEmailField(),
                  _buildCountryPicker(), // Updated
                  _buildGenderDropdown(),
                  _buildContentGenderPreferenceDropdown(),
                  const SizedBox(height: 40),
                  _buildSaveButton(),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
          if (_isLoading)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPhotoUploadSection() {
    String profilePicture = userModel?.profilePicture ?? '';
    return Center(
      child: Row(
        children: [
          const SizedBox(width: 20),
          Hero(
            tag: "${profilePicture}ProfilePicture",
            child: ClipOval(
              child: SizedBox.fromSize(
                size: const Size.fromRadius(60),
                child: _selectedImage != null
                    ? Image.file(
                        _selectedImage!,
                        fit: BoxFit.cover,
                      )
                    : (profilePicture.isNotEmpty
                        ? CommonCachedNetworkImage(
                            imageUrl: profilePicture,
                            fit: BoxFit.cover,
                          )
                        : Container(
                            color: Colors.grey[300],
                            alignment: Alignment.center,
                            child: Icon(Icons.person, size: 80, color: Colors.grey[500]),
                          )),
              ),
            ),
          ),
          const SizedBox(width: 16),
          ElevatedButton.icon(
            icon: const Icon(Icons.photo_camera, size: 18),
            onPressed: _pickImage,
            style: ElevatedButton.styleFrom(
              backgroundColor: themeData.primaryColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            ),
            label: const Text("Upload Photo"),
          ),
        ],
      ),
    );
  }

  Widget _buildDisplayNameField() {
    return _buildTextField("Display name", userModel?.displayName ?? "", displayNameController);
  }

  Widget _buildEmailField() {
    return _buildTextField("Email", userModel?.email ?? "", emailController, isEdit: false);
  }

  Widget _buildTextField(
    String label,
    String hint,
    TextEditingController controller, {
    bool? isEdit,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text(
          label,
          style: themeData.textTheme.labelMedium
              ?.copyWith(
                color: themeData.colorScheme.onSurface,
                fontWeight: FontWeight.w600,
              )
              .withEpilogue,
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          enabled: isEdit ?? true,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: themeData.textTheme.labelMedium
                ?.copyWith(
                  color: themeData.colorScheme.onSurface.withOpacity(0.4),
                  fontWeight: FontWeight.w600,
                )
                .withEpilogue,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(4),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildCountryPicker() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text(
          "Country of Residence",
          style: themeData.textTheme.labelMedium
              ?.copyWith(
                color: themeData.colorScheme.onSurface,
                fontWeight: FontWeight.w600,
              )
              .withEpilogue,
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: countryController,
          readOnly: true,
          onTap: () {
            List<String> topJewishPopulationCountries = AppConfig.suggestedCountryCodes;
            showCountryPicker(
              context: context,
              showPhoneCode: false,
              favorite: topJewishPopulationCountries,
              onSelect: (Country country) {
                setState(() {
                  selectedCountry = country.name;
                  countryController.text = country.name;
                });
              },
            );
          },
          decoration: InputDecoration(
            hintText: "Select country",
            hintStyle: themeData.textTheme.labelMedium
                ?.copyWith(
                  color: themeData.colorScheme.onSurface.withOpacity(0.4),
                  fontWeight: FontWeight.w600,
                )
                .withEpilogue,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(4),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            suffixIcon: const Icon(Icons.arrow_drop_down),
          ),
        ),
      ],
    );
  }

  Widget _buildGenderDropdown() {
    return _buildDropdown<String>(
      label: "Gender",
      value: selectedGender,
      hint: "Select gender",
      items: GenderTypes.uiValues,
      onChanged: (value) => setState(() => selectedGender = value),
    );
  }

  Widget _buildContentGenderPreferenceDropdown() {
    return _buildDropdown<String>(
      label: "Content Gender Preference",
      value: selectedContentGenderPreference,
      hint: "Select content gender preference",
      items: GenderPreferenceTypes.uiValues,
      onChanged: (value) => setState(() => selectedContentGenderPreference = value),
    );
  }

  Widget _buildDropdown<T>({
    required String label,
    required T? value,
    required String hint,
    required List<T> items,
    required ValueChanged<T?> onChanged,
  }) {
    final textStyle = (themeData.textTheme.labelMedium ?? const TextStyle()).copyWith(fontWeight: FontWeight.w600).withEpilogue;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Text(label, style: textStyle),
        const SizedBox(height: 8),
        DropdownButtonFormField<T>(
          isExpanded: true,
          menuMaxHeight: 300.0,
          elevation: 2,
          borderRadius: BorderRadius.circular(8.0),
          icon: const Icon(Icons.keyboard_arrow_down_rounded),
          value: items.contains(value) ? value : null,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: textStyle.copyWith(color: textStyle.color?.withOpacity(0.4)),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(4)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
          items: items
              .map(
                (item) => DropdownMenuItem<T>(
                  value: item,
                  child: Text(
                    item.toString(),
                    style: textStyle,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              )
              .toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildSaveButton() {
    return ElevatedButton(
      onPressed: _isLoading ? null : _updateProfile,
      style: ElevatedButton.styleFrom(
        backgroundColor: themeData.primaryColor,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        padding: const EdgeInsets.symmetric(vertical: 14),
      ),
      child: Text(
        "Save Changes",
        style: themeData.textTheme.labelLarge
            ?.copyWith(color: themeData.colorScheme.onPrimary, fontWeight: FontWeight.bold)
            .withEpilogue,
      ),
    );
  }
}
