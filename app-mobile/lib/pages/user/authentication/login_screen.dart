import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
// import 'package:patreon-clone/navigation/navigation_operation_perameters.dart';
// import 'package:patreon-clone/navigation/navigation_type.dart';
import 'package:patreon-clone/config/index.dart';
import 'package:patreon-clone/constants/constants.dart';
import 'package:patreon-clone/styles/styles.dart';
import 'package:patreon-clone/models/user/data_model/user_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon-clone/navigation/app_router.dart';
import 'package:patreon-clone/backend/authentication/authentication_controller.dart';
import 'package:patreon-clone/backend/authentication/authentication_provider.dart';
import 'package:patreon-clone/backend/common/dependency_injection.dart';

import 'package:flutter/gestures.dart';

class LoginScreen extends StatefulWidget {
  static const String routeName = "/LoginScreen";

  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with MySafeState {
  bool isLoading = false;
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  final FocusNode emailFocusNode = FocusNode();
  final FocusNode passwordFocusNode = FocusNode();
  late AuthenticationProvider authenticationProvider;
  late AuthenticationController authenticationController;
  bool isEmailEntered = false;
  bool isEmailFocused = false;
  bool isPasswordEntered = false;
  bool isPasswordFocused = false;
  bool isPasswordStep = false;
  bool passwordVisible = false;

  void signInWithGoogle() async {
    if (isLoading) return;

    isLoading = true;
    mySetState();
    _showLoadingDialog();

    try {
      final googleUser = await authenticationController.authenticationRepository.getGoogleAccount();

      if (googleUser == null) {
        if (Navigator.canPop(context)) Navigator.of(context, rootNavigator: true).pop();
        isLoading = false;
        mySetState();
        return;
      }

      final email = googleUser.email;
      final result = await authenticationController.authenticationRepository.checkEmailExists(email);

      if (Navigator.canPop(context)) Navigator.of(context, rootNavigator: true).pop();

      if (result == null) {
        MyToast.showError(context: context, msg: 'Failed to connect to server. Please try again.');
        isLoading = false;
        mySetState();
        return;
      }

      final bool userExists = result['isInUse'] ?? false;

      if (userExists) {
        _showLoadingDialog();
        bool success = await authenticationController.signInWithGoogle(
          context: context,
          googleUser: googleUser,
        );
        if (Navigator.canPop(context)) Navigator.of(context, rootNavigator: true).pop();

        if (success) {
          MyToast.showSuccess(context: context, msg: "Google Sign In successful");
        } else {
          MyToast.showError(context: context, msg: 'Google Sign In failed');
        }
      } else {
        final displayName = googleUser.displayName ?? '';
        final nameParts = displayName.split(' ');
        final String firstName = nameParts.isNotEmpty ? nameParts.first : '';
        final String lastName = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : '';

        final userModel = UserModel(
          email: email,
          firstName: firstName,
          lastName: lastName,
          displayName: displayName,
          authenticationMode: AuthenticationModes.google,
          profilePicture: googleUser.photoUrl ??
              "https://lh3.googleusercontent.com/a/ACg8ocIFnchkIaDmcv_kZ2QfxTg6bMgAWUa1ILTIKVMtp52tPCIn2Q=s96-c",
        );

        await context.pushNamed(
          Routes.signUp,
          extra: {
            'userModel': userModel,
            'isGoogleSignIn': true,
          },
        );
      }
    } catch (e) {
      if (Navigator.canPop(context)) Navigator.of(context, rootNavigator: true).pop();
      MyPrint.printOnConsole('Error during Google Sign In: $e');
      MyToast.showError(context: context, msg: 'An error occurred during sign in');
    } finally {
      isLoading = false;
      mySetState();
    }
  }

  // ... rest of the file is unchanged ...
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
                  Text('Signing in...', style: const TextStyle().withEpilogue),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void signInWithEmail() async {
    if (emailController.text.isEmpty) {
      MyToast.showCustomToast(
          context: context, msg: "Please enter your email", toastColor: Colors.orange, textColor: Colors.white);
      return;
    }

    if (!isPasswordStep) {
      final email = emailController.text.trim();
      try {
        isLoading = true;
        mySetState();

        final result = await authenticationController.authenticationRepository.checkEmailExists(email);

        if (result == null) {
          MyToast.showError(context: context, msg: 'Failed to check email. Please try again.');
          isLoading = false;
          mySetState();
          return;
        }

        if (result['isInUse'] == true && result['passwordSet'] == true) {
          isPasswordStep = true;
          mySetState();
          FocusScope.of(context).requestFocus(passwordFocusNode);
        } else if (result['isInUse'] == false) {
          MyPrint.printOnConsole("called LoginScreen for SignUpScreenNavigation");
          MyToast.showCustomToast(
              context: context,
              msg: "Email not found, redirecting to sign up",
              toastColor: Colors.orange,
              textColor: Colors.white);
          await context.pushNamed(
            Routes.signUp,
            extra: {
              'userModel': UserModel(
                email: email,
              ),
              'isGoogleSignIn': false,
            },
          );
        }
      } catch (e) {
        MyPrint.printOnConsole('Error checking email: $e');
        MyToast.showError(context: context, msg: 'Failed to check email: ${e.toString()}');
      } finally {
        isLoading = false;
        mySetState();
      }
    } else {
      final email = emailController.text.trim();
      final password = passwordController.text.trim();

      if (password.isEmpty) {
        MyToast.showCustomToast(
            context: context, msg: "Please enter your password", toastColor: Colors.orange, textColor: Colors.white);
        return;
      }

      isLoading = true;
      mySetState();

      try {
        _showLoadingDialog();

        final result = await authenticationController.signInWithEmail(
          email: email,
          password: password,
        );

        if (Navigator.canPop(context)) {
          Navigator.of(context, rootNavigator: true).pop();
        }

        if (result != null) {
          await authenticationController.onLoginSuccess(
            context: context,
            authenticationMode: AuthenticationModes.email,
          );
          MyToast.showSuccess(context: context, msg: "Logged in successfully");
        } else {
          MyToast.showError(context: context, msg: 'Invalid email or password');
        }
      } catch (e) {
        if (Navigator.canPop(context)) {
          Navigator.of(context, rootNavigator: true).pop();
        }

        MyPrint.printOnConsole('Error during email sign in: $e');
        MyToast.showError(context: context, msg: 'An error occurred during sign in');
      } finally {
        isLoading = false;
        mySetState();
      }
    }
  }

  void _onEmailChanged() {
    isEmailEntered = emailController.text.trim().isNotEmpty;
    mySetState();
  }

  void _onPasswordChanged() {
    isPasswordEntered = passwordController.text.trim().isNotEmpty;
    mySetState();
  }

  void _onEmailTapped() {
    isEmailFocused = emailFocusNode.hasFocus;
    mySetState();
  }

  void _onPasswordTapped() {
    isPasswordFocused = passwordFocusNode.hasFocus;
    mySetState();
  }

  void clearEmailField() {
    emailController.clear();
    isEmailEntered = false;
    isPasswordStep = false;
    mySetState();
  }

  @override
  void initState() {
    super.initState();
    emailController.addListener(_onEmailChanged);
    emailFocusNode.addListener(_onEmailTapped);
    passwordController.addListener(_onPasswordChanged);
    passwordFocusNode.addListener(_onPasswordTapped);
    authenticationProvider = DependencyInjection.authenticationProvider;
    authenticationController = DependencyInjection.authenticationController;

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      bool isLoggedIn = await authenticationController.isUserLoggedIn();
      if (isLoggedIn) {
        UserModel? userModel = authenticationController.authenticationProvider.userModel.get();
        if (userModel != null) {
          context.goNamed(Routes.main);
        }
      }
    });
  }

  @override
  void dispose() {
    emailController.removeListener(_onEmailChanged);
    emailFocusNode.removeListener(_onEmailTapped);
    passwordController.removeListener(_onPasswordChanged);
    passwordFocusNode.removeListener(_onPasswordTapped);
    emailController.dispose();
    emailFocusNode.dispose();
    passwordController.dispose();
    passwordFocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 40),
              _buildHeaderLogoSection(context),
              SizedBox(height: MediaQuery.of(context).size.height * 0.03),
              const SizedBox(height: 35),
              _buildHeaderSection(context),
              const SizedBox(height: 35),
              _buildSignInButtons(context),
              const SizedBox(height: 16),
              _buildDivider(context),
              const SizedBox(height: 16),
              _buildEmailField(context),
              if (isPasswordStep)
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: TextField(
                    controller: passwordController,
                    focusNode: passwordFocusNode,
                    obscureText: !passwordVisible,
                    style: TextStyle(color: themeData.colorScheme.onSurface).withEpilogue,
                    decoration: InputDecoration(
                      hintText: "Password",
                      hintStyle: const TextStyle(color: Colors.grey).withEpilogue,
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: isPasswordFocused || isPasswordEntered ? Colors.black : Colors.grey,
                          width: isPasswordFocused ? 2 : 1,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(
                          color: Colors.black,
                          width: 1.2,
                        ),
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          passwordVisible ? CupertinoIcons.eye : CupertinoIcons.eye_slash,
                          color: Colors.black,
                          size: 18,
                        ),
                        onPressed: () {
                          passwordVisible = !passwordVisible;
                          mySetState();
                        },
                      ),
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              _buildContinueButton(context),
              SizedBox(height: MediaQuery.of(context).size.height * 0.1),
              _buildHelpText(context),
              const SizedBox(height: 16),
              _buildTermsText(context),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderLogoSection(BuildContext context) => ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: Image.asset(AppAssets.patreon-cloneLogo, height: 150, width: 150, fit: BoxFit.cover));
  Widget _buildHeaderSection(BuildContext context) => Text("Log in or sign up",
      style: themeData.textTheme.headlineMedium
          ?.copyWith(color: themeData.colorScheme.onSurface, fontWeight: FontWeight.bold, fontSize: 24)
          .withEpilogue,
      textAlign: TextAlign.center);
  Widget _buildEmailField(BuildContext context) {
    return TextField(
      controller: emailController,
      focusNode: emailFocusNode,
      style: TextStyle(color: themeData.colorScheme.onSurface).withEpilogue,
      decoration: InputDecoration(
        hintText: "Email",
        hintStyle: const TextStyle(color: Colors.grey).withEpilogue,
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide:
                BorderSide(color: isEmailFocused || isEmailEntered ? Colors.black : Colors.grey, width: isEmailFocused ? 2 : 1)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Colors.black, width: 1.2)),
        suffixIcon: IconButton(icon: const Icon(Icons.clear, color: Colors.black), onPressed: clearEmailField),
      ),
      keyboardType: TextInputType.emailAddress,
      textCapitalization: TextCapitalization.none,
      inputFormatters: [
        TextInputFormatter.withFunction((oldValue, newValue) {
          newValue = newValue.copyWith(text: newValue.text.replaceAll(' ', ''));
          return newValue.copyWith(text: newValue.text.toLowerCase());
        }),
      ],
    );
  }

  Widget _buildContinueButton(BuildContext context) {
    final isActive = isPasswordStep ? isPasswordEntered : isEmailEntered;
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: isActive ? themeData.primaryColor : Colors.grey.shade400,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
          elevation: 0,
        ),
        onPressed: isActive ? signInWithEmail : null,
        child: Text(isPasswordStep ? "Login" : "Continue",
            style: Theme.of(context)
                .textTheme
                .bodyLarge
                ?.copyWith(fontWeight: FontWeight.w600, color: isActive ? Colors.white : Colors.black38)
                .withEpilogue),
      ),
    );
  }

  Widget _buildDivider(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text("or",
              style: themeData.textTheme.bodyMedium
                  ?.copyWith(color: themeData.colorScheme.onSurface.withValues(alpha: 0.5), fontWeight: FontWeight.bold)
                  .withEpilogue),
        ),
      ],
    );
  }

  Widget _buildSignInButtons(BuildContext context) {
    return Column(
      children: [
        _buildSignInButton(
          context,
          icon: "G",
          text: "Continue with Google",
          onPressed: signInWithGoogle,
        ),
      ],
    );
  }

  Widget _buildSignInButton(BuildContext context, {required String icon, required String text, required VoidCallback onPressed}) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: OutlinedButton(
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: Styles.blue600, width: 1),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        onPressed: onPressed,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            icon == "G"
                ? Image.network("https://cdn-icons-png.flaticon.com/512/2991/2991148.png", width: 24, height: 24)
                : Text(icon,
                    style:
                        TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Styles().lightPrimaryVariant).withEpilogue),
            const SizedBox(width: 12),
            Text(text,
                style: Theme.of(context)
                    .textTheme
                    .bodyLarge
                    ?.copyWith(fontWeight: FontWeight.w600, color: Styles.blue600)
                    .withEpilogue),
          ],
        ),
      ),
    );
  }

  Widget _buildHelpText(BuildContext context) {
    return TextButton(
      onPressed: () async {
        final Uri emailLaunchUri =
            Uri(scheme: 'mailto', path: AppConfig.supportEmail, query: Uri.encodeFull('subject=${AppConfig.appName} App Login Help'));
        if (await canLaunchUrl(emailLaunchUri)) {
          await launchUrl(emailLaunchUri);
        }
      },
      child: Text("Need help signing in?", style: TextStyle(color: Styles().lightPrimaryVariant).withEpilogue),
    );
  }

  Widget _buildTermsText(BuildContext context) {
    return RichText(
      textAlign: TextAlign.center,
      text: TextSpan(
        style: TextStyle(
          color: Styles().lightPrimaryVariant,
          fontSize: 12,
          // fontFamily: FontManager.fontFamily,
        ),
        children: [
          const TextSpan(text: "By signing up, you are creating a ${AppConfig.appName} account and agree to ${AppConfig.appName}'s "),
          TextSpan(
            text: "Terms",
            style: const TextStyle(fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
            recognizer: TapGestureRecognizer()
              ..onTap = () {
                context.pushNamed(
                  Routes.legal,
                  extra: {
                    'url': AppConfig.termsOfServiceUrl,
                    'title': "Terms of Service",
                  },
                );
              },
          ),
          const TextSpan(text: " and "),
          TextSpan(
            text: "Privacy Policy",
            style: const TextStyle(fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
            recognizer: TapGestureRecognizer()
              ..onTap = () {
                context.pushNamed(
                  Routes.legal,
                  extra: {
                    'url': AppConfig.privacyPolicyUrl,
                    'title': "Privacy Policy",
                  },
                );
              },
          ),
          const TextSpan(text: "."),
        ],
      ),
    );
  }
}
