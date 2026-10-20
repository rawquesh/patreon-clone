import 'dart:io';

import 'package:flutter/material.dart';
import 'package:patreon_clone/models/collection/collection_data_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:patreon_clone/helpers/image_helper.dart';
import 'package:provider/provider.dart';

import 'package:patreon_clone/backend/collections/collection_controller.dart';
import 'package:patreon_clone/backend/collections/collection_provider.dart';

class CreateCollectionDialog extends StatefulWidget {
  final CollectionModel? collection;
  const CreateCollectionDialog({super.key, this.collection});

  @override
  State<CreateCollectionDialog> createState() => _CreateCollectionDialogState();
}

class _CreateCollectionDialogState extends State<CreateCollectionDialog> with MySafeState {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  File? _selectedImage;
  String? _existingImageUrl;
  // ignore: unused_field
  int _descriptionLength = 0;
  final int _maxDescriptionLength = 180;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.collection != null) {
      _titleController.text = widget.collection!.title;
      _descriptionController.text = widget.collection!.description;
      _descriptionLength = _descriptionController.text.length;
      if (widget.collection!.coverImage.isNotEmpty) {
        _existingImageUrl = widget.collection!.coverImage;
      }
    }
    _descriptionController.addListener(() {
      setState(() {
        _descriptionLength = _descriptionController.text.length;
      });
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final File? processedImage = await ImageHelper.pickAndProcessImage(context: context);

    if (processedImage != null) {
      setState(() {
        _selectedImage = processedImage;
        _existingImageUrl = null;
      });
    }
  }

  void _removeImage() {
    setState(() {
      _selectedImage = null;
      _existingImageUrl = null;
    });
  }

  Future<void> _saveCollection() async {
    final provider = context.read<CollectionProvider>();
    final controller = CollectionController(provider: provider);

    _isLoading = true;
    mySetState();

    CollectionModel? model;
    if (widget.collection == null) {
      model = await controller.createCollection(
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        coverImage: _selectedImage,
      );
      MyPrint.printOnConsole(
        "New collection created: ${model?.toMap()}",
      );
    } else {
      model = await controller.updateCollection(
        collection: widget.collection!,
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        coverImage: _selectedImage,
        isActive: widget.collection!.isActive,
      );
      MyPrint.printOnConsole(
        "Collection updated: ${model?.toMap()}",
      );
    }

    _isLoading = false;
    mySetState();

    if (model != null) {
      Navigator.of(context).pop(model);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to save collection')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        const SizedBox(height: 120),
        ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: 400,
            maxHeight: MediaQuery.of(context).size.height * 0.8,
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
                          widget.collection == null ? 'New Collection' : 'Edit Collection',
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
                              onTap: _selectedImage == null && _existingImageUrl == null ? _pickImage : null,
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
                                child: _selectedImage != null || _existingImageUrl != null
                                    ? Stack(
                                        children: [
                                          ClipRRect(
                                            borderRadius: BorderRadius.circular(7),
                                            child: _selectedImage != null
                                                ? Image.file(
                                                    _selectedImage!,
                                                    width: 120,
                                                    height: 120,
                                                    fit: BoxFit.cover,
                                                  )
                                                : Image.network(
                                                    _existingImageUrl!,
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
                          if (_selectedImage == null && _existingImageUrl == null) ...[
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
                            'Collection title',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: Colors.black87,
                            ).withEpilogue,
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _titleController,
                            decoration: InputDecoration(
                              hintText: 'Add title',
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
                            maxLength: _maxDescriptionLength,
                            buildCounter: (context, {required currentLength, required isFocused, maxLength}) {
                              return Container(
                                alignment: Alignment.centerRight,
                                child: Text(
                                  '$currentLength / $_maxDescriptionLength',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              );
                            },
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
                          onPressed: _titleController.text.trim().isNotEmpty && !_isLoading ? _saveCollection : null,
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
                          child: AnimatedSwitcher(
                            duration: const Duration(milliseconds: 180),
                            transitionBuilder: (child, anim) => FadeTransition(opacity: anim, child: child),
                            child: _isLoading
                                ? const SizedBox(
                                    key: ValueKey('loader'),
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
                                  )
                                : Text(
                                    widget.collection == null ? 'Create collection' : 'Save changes',
                                    key: const ValueKey('text'),
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                    ).withEpilogue,
                                  ),
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
