import 'package:flutter/material.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/backend/user_deletion/user_deletion_repository.dart';
import 'package:patreon-clone/navigation/app_router.dart';
import 'package:go_router/go_router.dart';
// import 'package:provider/provider.dart';
import 'package:patreon-clone/backend/common/dependency_injection.dart';

class DeleteAccountDialog extends StatefulWidget {
  const DeleteAccountDialog({super.key});

  @override
  State<DeleteAccountDialog> createState() => _DeleteAccountDialogState();
}

class _DeleteAccountDialogState extends State<DeleteAccountDialog> with MySafeState {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // Controllers
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _reasonController = TextEditingController();

  // State variables
  bool _confirmDeletion = false;
  bool _isLoading = false;
  final UserDeletionRepository _repository = UserDeletionRepository();

  @override
  void initState() {
    super.initState();
    // Check if user likely has a password (local auth)
    // For now, we'll assume yes if email is present, but backend handles the actual check.
    // Ideally we might check the auth provider metadata if available.
    // Based on user request, password is verified for local auth only.
    // We will show the field, and let user/backend handle it.
    // If the user signed in with Google, they might not have a password.
    // However, the backend requirement says "password: string".
    // We will provide an empty string if they don't input one (e.g. social login),
    // but better UI would be to hide it if we knew for sure.
    // For this implementation, we will show it but mark as optional if social login (simulated logic).

    // Actually, let's always show it but make it optional in validation if likely social login?
    // No, the requirements say "Verified only for users with local/email+password auth".
    // We'll require it in the form validation for now to be safe, unless we detect social login clearly.
    // Checking AuthProvider for providerId could be useful but might be out of scope for this specific file.
    // We will stick to standard form.
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _handleDelete() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_confirmDeletion) {
      MyToast.showError(context: context, msg: 'You must confirm that this action cannot be undone.');
      return;
    }

    setState(() => _isLoading = true);

    final result = await _repository.deleteAccount(
      password: _passwordController.text.trim(),
      reason: _reasonController.text.trim(),
      confirmDeletion: _confirmDeletion,
    );

    if (mounted) {
      setState(() => _isLoading = false);

      if (result['success'] == true) {
        // Close dialog
        Navigator.of(context).pop();

        // Show success message
        MyToast.showSuccess(context: context, msg: 'Account successfully deleted.');

        // Perform Logout and Redirect
        final authController = DependencyInjection.authenticationController;
        await authController.logout(isNavigateToLogin: false); // We handle nav manually

        context.goNamed(Routes.login);
      } else {
        MyToast.showError(context: context, msg: result['message'] ?? 'Failed to delete account');
      }
    }
  }

  Widget _buildWarningStep() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 48),
        const SizedBox(height: 16),
        Text(
          'We\'re sorry to see you go',
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold).withEpilogue,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Text(
          'Deleting your account is permanent. You will lose access to all your subscriptions, content, and any active payments will be stopped immediately.',
          style: TextStyle(fontSize: 14, color: Colors.grey[700], height: 1.4).withEpilogue,
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => setState(() => _currentStep = 1),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: Text('Continue', style: const TextStyle(color: Colors.white).withEpilogue),
          ),
        ),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text('Cancel', style: TextStyle(color: Colors.grey[600]).withEpilogue),
        ),
      ],
    );
  }

  Widget _buildInputStep() {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Final Confirmation',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold).withEpilogue,
          ),
          const SizedBox(height: 16),

          // Reason Field
          TextFormField(
            controller: _reasonController,
            decoration: InputDecoration(
              labelText: 'Reason for leaving',
              hintText: 'Tell us why you are deleting (10-500 chars)',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
            ),
            maxLines: 2,
            validator: (value) {
              if (value == null || value.trim().length < 10) {
                return 'Reason must be at least 10 characters';
              }
              if (value.trim().length > 500) {
                return 'Reason too long (max 500)';
              }
              return null;
            },
            style: const TextStyle(fontSize: 14).withEpilogue,
          ),
          const SizedBox(height: 16),

          // Password Field
          TextFormField(
            controller: _passwordController,
            decoration: InputDecoration(
              labelText: 'Password',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
            ),
            obscureText: true,
            // We won't strictly validate password length here to allow for backend flexibility
            // but we can check not empty if we want to enforce it.
            // Given "password verified only for local auth", we might keep it optional in UI valid
            // if we are unsure, but usually safer to ask.
            // Let's assume it IS required if shown.
            // Actually simplest is to not validate empty in UI, let backend 401 if wrong.
            style: const TextStyle(fontSize: 14).withEpilogue,
          ),
          const SizedBox(height: 16),

          // Checkbox
          CheckboxListTile(
            value: _confirmDeletion,
            onChanged: (val) => setState(() => _confirmDeletion = val ?? false),
            title: Text(
              'I understand this cannot be undone',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500).withEpilogue,
            ),
            contentPadding: EdgeInsets.zero,
            controlAffinity: ListTileControlAffinity.leading,
            activeColor: Colors.red,
          ),

          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text('Cancel', style: TextStyle(color: Colors.grey[600]).withEpilogue),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: (_confirmDeletion && !_isLoading) ? _handleDelete : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    disabledBackgroundColor: Colors.red.withOpacity(0.3),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text('Delete  Forever', style: const TextStyle(color: Colors.white, fontSize: 13).withEpilogue),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: SingleChildScrollView(
          child: _currentStep == 0 ? _buildWarningStep() : _buildInputStep(),
        ),
      ),
    );
  }
}
