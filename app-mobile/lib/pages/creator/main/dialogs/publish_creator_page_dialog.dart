import 'package:flutter/material.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/styles/font_manager.dart';

class PublishCreatorPageDialog extends StatefulWidget {
  final VoidCallback? onCancel;
  final Function(bool)? onContinue;

  const PublishCreatorPageDialog({
    super.key,
    this.onCancel,
    this.onContinue,
  });

  @override
  State<PublishCreatorPageDialog> createState() => _PublishCreatorPageDialogState();
}

class _PublishCreatorPageDialogState extends State<PublishCreatorPageDialog> with MySafeState {
  bool _isAgreed = false;
  // 1. ADD a state variable to track the loading state.
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    super.pageBuild();
    final themeData = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        padding: const EdgeInsets.all(24.0),
        constraints: const BoxConstraints(maxWidth: 500),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Title
              Text(
                'Publish Your Creator Page',
                style: themeData.textTheme.titleLarge
                    ?.copyWith(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                    )
                    .withEpilogue,
              ),
              const SizedBox(height: 16),

              // Description
              Text(
                'Publishing your page will make it visible to everyone and allow you to start accepting payments from your supporters.\n\nYou\'ll need to complete a few steps with Stripe, our payment processor, to set up your account and verify your identity. This process has simple steps and conditions and takes only a few minutes.',
                style: themeData.textTheme.bodyMedium
                    ?.copyWith(
                      color: Colors.grey[600],
                      fontSize: 14,
                      height: 1.5,
                    )
                    .withEpilogue,
              ),
              const SizedBox(height: 24),

              // Checkbox with agreement text
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Checkbox(
                    value: _isAgreed,
                    onChanged: (bool? value) {
                      // Prevent changing while loading
                      if (_isLoading) return;
                      setState(() {
                        _isAgreed = value ?? false;
                      });
                    },
                    activeColor: themeData.primaryColor,
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        // Prevent changing while loading
                        if (_isLoading) return;
                        setState(() {
                          _isAgreed = !_isAgreed;
                        });
                      },
                      child: Container(
                        color: Colors.transparent,
                        padding: const EdgeInsets.only(top: 12.0),
                        child: Text(
                          'I accept the terms and conditions for creators',
                          style: themeData.textTheme.bodyMedium
                              ?.copyWith(
                                color: Colors.grey[700],
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              )
                              .withEpilogue,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Action Buttons
              Wrap(
                alignment: WrapAlignment.center,
                spacing: 8.0,
                runSpacing: 8.0,
                children: [
                  // Cancel Button
                  TextButton(
                    onPressed: _isLoading
                        ? null // Disable cancel button while loading
                        : (widget.onCancel ?? () => Navigator.of(context).pop()),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      'Cancel',
                      style: TextStyle(
                        color: Colors.grey[700],
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ).withEpilogue,
                    ),
                  ),

                  // Continue to Stripe Button
                  ElevatedButton(
                    // 2. UPDATE onPressed to disable the button when agreed AND loading.
                    onPressed: (_isAgreed && !_isLoading)
                        ? () {
                            setState(() {
                              _isLoading = true;
                            });
                            widget.onContinue?.call(_isAgreed);
                            // The parent widget is responsible for navigation/closing.
                          }
                        : null, // Disabled when not agreed OR when loading.
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isAgreed ? themeData.primaryColor : Colors.grey[300],
                      foregroundColor: _isAgreed ? Colors.white : Colors.grey[500],
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: _isAgreed ? 2 : 0,
                      shadowColor: themeData.primaryColor.withOpacity(0.4),
                    ),
                    // 3. UPDATE the child to be conditional based on _isLoading.
                    child: _isLoading
                        ? Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2.5,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'Connecting to Stripe...',
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                ).withEpilogue,
                              ),
                            ],
                          )
                        : Text(
                            'Continue to Stripe',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ).withEpilogue,
                          ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
