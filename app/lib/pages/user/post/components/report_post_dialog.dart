import 'package:flutter/material.dart';
import 'package:patreon-clone/utils/my_safe_state.dart';
import 'package:patreon-clone/utils/my_toast.dart';
import 'package:patreon-clone/styles/font_manager.dart';
import 'package:patreon-clone/backend/post_report/post_report_repository.dart';
import 'package:patreon-clone/backend/post_report/report_reason.dart';

class ReportPostDialog extends StatefulWidget {
  final String postId;

  const ReportPostDialog({super.key, required this.postId});

  @override
  State<ReportPostDialog> createState() => _ReportPostDialogState();
}

class _ReportPostDialogState extends State<ReportPostDialog> with MySafeState {
  final _formKey = GlobalKey<FormState>();
  ReportReason? _selectedReason;
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _additionalContextController = TextEditingController();
  bool _isLoading = false;
  final PostReportRepository _repository = PostReportRepository();

  @override
  void dispose() {
    _descriptionController.dispose();
    _additionalContextController.dispose();
    super.dispose();
  }

  Future<void> _submitReport() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedReason == null) {
      MyToast.showError(context: context, msg: 'Please select a reason.');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final result = await _repository.submitReport(
      postId: widget.postId,
      reason: _selectedReason!,
      description: _descriptionController.text.trim(),
      additionalContext: _additionalContextController.text.trim(),
    );

    if (mounted) {
      setState(() {
        _isLoading = false;
      });

      if (result['success']) {
        Navigator.of(context).pop();
        MyToast.showSuccess(context: context, msg: 'Report submitted successfully. Thank you!');
      } else {
        MyToast.showError(context: context, msg: result['message'] ?? 'Failed to submit report');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Report Post',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold).withEpilogue,
                ),
                const SizedBox(height: 20),
                DropdownButtonFormField<ReportReason>(
                  value: _selectedReason,
                  decoration: InputDecoration(
                    hintText: 'Select Reason',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                  ),
                  items: ReportReason.values.map((reason) {
                    return DropdownMenuItem(
                      value: reason,
                      child: Text(reason.displayName, style: const TextStyle(fontSize: 14).withEpilogue),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedReason = value;
                    });
                  },
                  validator: (value) => value == null ? 'Please select a reason' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _descriptionController,
                  decoration: InputDecoration(
                    hintText: 'Description (10-1000 characters)',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    alignLabelWithHint: true,
                  ),
                  maxLines: 3,
                  validator: (value) {
                    if (value == null || value.trim().length < 10) {
                      return 'Description must be at least 10 characters.';
                    }
                    if (value.trim().length > 1000) {
                      return 'Description must be at most 1000 characters.';
                    }
                    return null;
                  },
                  style: const TextStyle(fontSize: 14).withEpilogue,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _additionalContextController,
                  decoration: InputDecoration(
                    hintText: 'Additional Context (Optional)',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    alignLabelWithHint: true,
                  ),
                  maxLines: 2,
                  style: const TextStyle(fontSize: 14).withEpilogue,
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: Text('Cancel', style: const TextStyle(color: Colors.grey).withEpilogue),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _submitReport,
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        backgroundColor: Theme.of(context).primaryColor,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Text('Submit', style: const TextStyle(color: Colors.white).withEpilogue),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
