import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:patreon_clone/models/collection/collection_data_model.dart';
import 'package:patreon_clone/models/membership/membership_model.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/models/post/request_model/create_audio_post_request_model.dart';
import 'package:patreon_clone/models/post/request_model/create_draft_audio_post_request_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:patreon_clone/helpers/image_helper.dart';
import 'package:provider/provider.dart';

import 'package:patreon_clone/backend/common/dependency_injection.dart';
import 'package:patreon_clone/backend/creator/my_creator_controller.dart';
import 'package:patreon_clone/backend/creator/my_creator_provider.dart';
import 'package:patreon_clone/backend/post_creation/post_creation_contoller.dart';
import 'package:patreon_clone/backend/post_creation/post_creation_provider.dart';
import 'package:patreon_clone/pages/creator/main/dialogs/create_collection_dialog.dart';

class CreateAudioPostScreen extends StatefulWidget {
  static const String routeName = '/CreateAudioPostScreen';

  final PostModel? post;
  final bool isTabbedView;

  const CreateAudioPostScreen({super.key, this.post, this.isTabbedView = false});

  @override
  State<CreateAudioPostScreen> createState() => _CreateAudioPostScreenState();
}

class _CreateAudioPostScreenState extends State<CreateAudioPostScreen> with MySafeState {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _tagController = TextEditingController();
  late PostCreationProvider _postCreationProvider;
  late PostCreationController _controller;
  late MyCreatorProvider myCreatorProvider;
  late MyCreatorController myCreatorController;

  File? _selectedAudioFile;
  String? _existingAudioUrl;
  String? _selectedCollection;
  List<CollectionModel> _availableCollections = [];
  List<String> _tags = [];
  bool _isPublicAccess = true;
  final List<File> _attachedImages = [];
  List<String> _selectedTiers = [];
  List<MembershipModel> _membershipTiers = [];
  // final bool _isCreatingCollection = false;
  bool _isLoading = false;
  final TextEditingController _newCollectionController = TextEditingController();

  // Theme constants for consistent styling
  static const double _cardBorderRadius = 12.0;
  static const double _inputBorderRadius = 8.0;
  static const double _smallSpacing = 8.0;
  static const double _mediumSpacing = 16.0;
  static const double _largeSpacing = 24.0;
  static const double _sectionPadding = 16.0;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _tagController.dispose();
    _newCollectionController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _postCreationProvider = context.read<PostCreationProvider>();
    _controller = PostCreationController(provider: _postCreationProvider);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
    if (widget.post != null) {
      final p = widget.post!;
      _titleController.text = p.title;
      _descriptionController.text = p.description;
      _tags = List<String>.from(p.tags);
      _selectedTiers = List<String>.from(p.tierAccess);
      if (p.collections.isNotEmpty) {
        _selectedCollection = p.collections.first;
      }
      if (p.mediaUrls.isNotEmpty) {
        _existingAudioUrl = p.mediaUrls.first;
      }
    }

    myCreatorProvider = context.read<MyCreatorProvider>();
    myCreatorController = MyCreatorController(
      myCreatorProvider: myCreatorProvider,
    );
  }

  Future<void> _loadData() async {
    await _controller.loadInitialData();
    _membershipTiers = _postCreationProvider.memberships.getList();
    _availableCollections = _postCreationProvider.collections.getList();
    mySetState();
  }

  Future<File?> _pickAudioFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['mp3', 'wav', 'm4a', 'aac'],
      );

      if (result != null && result.files.first.path != null) {
        setState(() {
          _selectedAudioFile = File(result.files.first.path!);
        });
        return _selectedAudioFile;
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error picking audio file: $e')),
      );
    }
    return null;
  }

  void _removeAudioFile() {
    setState(() {
      _selectedAudioFile = null;
      _existingAudioUrl = null;
      if (widget.post != null) {
        widget.post!.mediaUrls.clear();
      }
    });
  }

  void _addTag() {
    if (_tagController.text.trim().isEmpty) return;

    setState(() {
      if (!_tags.contains(_tagController.text.trim())) {
        _tags.add(_tagController.text.trim());
      }
      _tagController.clear();
    });
  }

  void _removeTag(String tag) {
    setState(() {
      _tags.remove(tag);
    });
  }

  Future<void> _pickImage() async {
    final File? processedImage = await ImageHelper.pickAndProcessImage(context: context);

    if (processedImage != null) {
      setState(() {
        _attachedImages.add(processedImage);
      });
    }
  }

  void _removeImage(int index) {
    setState(() {
      _attachedImages.removeAt(index);
    });
  }

  Future<void> _createNewCollection() async {
    final CollectionModel? newCollection = await showGeneralDialog<CollectionModel>(
      context: context,
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder: (context, animation, secondaryAnimation) {
        return const CreateCollectionDialog();
      },
    );

    if (!mounted || newCollection == null) return;

    final List<CollectionModel> collections = _postCreationProvider.collections.getList();
    final int existingIndex = collections.indexWhere((collection) => collection.id == newCollection.id);
    if (existingIndex != -1) {
      collections[existingIndex] = newCollection;
    } else {
      collections.add(newCollection);
    }

    _postCreationProvider.collections.setList(list: collections, isClear: true, isNotify: true);

    setState(() {
      _availableCollections = collections;
      _selectedCollection = newCollection.id;
    });
  }

  Future<void> createAudioPostScreen({bool isDraft = false}) async {
    MyPrint.printOnConsole("_savePost called from CreateAudioPostScreen");

    if (_selectedAudioFile == null && _existingAudioUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an audio file')),
      );
      return;
    }

    bool success = false;

    // Start loading
    _isLoading = true;
    mySetState();

    try {
      if (widget.post != null) {
        // Update existing audio post
        final post = widget.post!;
        post
          ..title = _titleController.text.trim()
          ..description = _descriptionController.text.trim()
          ..collections = _selectedCollection != null ? [_selectedCollection!] : []
          ..tags = _tags
          ..tierAccess = _selectedTiers;

        success = await _controller.updatePost(post: post);
      } else {
        // Create new audio post
        final request = CreateAudioPostRequestModel(
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          collections: _selectedCollection != null ? [_selectedCollection!] : [],
          tags: _tags,
          tierAccess: _selectedTiers,
        );

        success = await _controller.createAudioPost(
          request: request,
          audioFile: _selectedAudioFile!,
          attachments: _attachedImages,
        );
      }

      if (success) {
        final String creatorId = DependencyInjection.authenticationProvider.userId.get();

        MyPrint.printOnConsole("Refreshing creator posts for ID: $creatorId");

        await myCreatorController.getCreatorPostsPaginatedList(
          creatorId: creatorId,
          isRefresh: true,
          isNotify: true,
          isFromCache: false,
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Post saved successfully!')),
          );
          Navigator.pop(context);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to save post')),
          );
        }
      }
    } catch (e, st) {
      MyPrint.printOnConsole("Error creating/updating audio post: $e\n$st");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('An error occurred while saving post')),
        );
      }
    } finally {
      // Stop loading
      if (mounted) {
        _isLoading = false;
        mySetState();
      }
    }
  }

  Future<void> _saveDraftPost({bool isDraft = false}) async {
    MyPrint.printOnConsole("_saveDraftPost called from CreateAudioPostScreen");

    if (_selectedAudioFile == null && _existingAudioUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an audio file')),
      );
      return;
    }

    bool success = false;

    // Start loading
    _isLoading = true;
    mySetState();

    try {
      if (widget.post != null) {
        // Update existing draft audio post
        final post = widget.post!;
        post
          ..title = _titleController.text.trim()
          ..description = _descriptionController.text.trim()
          ..collections = _selectedCollection != null ? [_selectedCollection!] : []
          ..tags = _tags
          ..tierAccess = _selectedTiers
          ..isDraft = isDraft;

        success = await _controller.updatePost(post: post);
      } else {
        // Create new draft audio post
        final request = CreateDraftAudioPostRequestModel(
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          collections: _selectedCollection != null ? [_selectedCollection!] : [],
          tags: _tags,
          isDraft: isDraft,
          tierAccess: _selectedTiers,
        );

        success = await _controller.createDraftAudioPost(
          request: request,
          audioFile: _selectedAudioFile!,
          attachments: _attachedImages,
        );
      }

      if (success) {
        final String creatorId = DependencyInjection.authenticationProvider.userId.get();

        MyPrint.printOnConsole("Refreshing creator posts for ID: $creatorId");

        await myCreatorController.getCreatorPostsPaginatedList(
          creatorId: creatorId,
          isRefresh: true,
          isNotify: true,
          isFromCache: false,
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Post saved successfully!')),
          );
          Navigator.pop(context);
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to save draft')),
          );
        }
      }
    } catch (e, st) {
      MyPrint.printOnConsole("Error saving draft audio post: $e\n$st");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('An error occurred while saving post')),
        );
      }
    } finally {
      // Stop loading
      if (mounted) {
        _isLoading = false;
        mySetState();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    super.pageBuild();

    return ModalProgressHUD(
      inAsyncCall: _isLoading,
      child: Scaffold(
        appBar: widget.isTabbedView ? null : _buildAppBar(),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(_sectionPadding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildAudioFileSection(),
              const SizedBox(height: _mediumSpacing),
              _buildTitleSection(),
              const SizedBox(height: _mediumSpacing),
              _buildDescriptionSection(),
              const SizedBox(height: _mediumSpacing),
              _buildSideSections(),
              const SizedBox(height: _largeSpacing),
              _buildActionButtons(),
            ],
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      title: Text(
        widget.post != null ? 'Edit Audio Post' : 'Create Audio Post',
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600).withEpilogue,
      ),
      backgroundColor: Colors.white,
      foregroundColor: Colors.black87,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.chevron_left, size: 22),
        onPressed: () => Navigator.pop(context),
      ),
    );
  }

  Widget _buildAudioFileSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(_cardBorderRadius),
        border: Border.all(color: Colors.grey[300]!),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(_sectionPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Audio File',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ).withEpilogue,
              ),
              TextButton.icon(
                onPressed: _pickAudioFile,
                icon: const Icon(Icons.upload_file, size: 16),
                label: Text(
                  'Select Audio',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ).withEpilogue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_selectedAudioFile != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(_inputBorderRadius),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: themeData.primaryColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.audiotrack,
                      color: themeData.primaryColor,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _selectedAudioFile!.path.split('/').last,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ).withEpilogue,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Audio file selected',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey[600],
                          ).withEpilogue,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: _removeAudioFile,
                    icon: const Icon(Icons.close, size: 18),
                    color: Colors.grey[600],
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),
          ] else if (_existingAudioUrl != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(_inputBorderRadius),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: themeData.primaryColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.audiotrack,
                      color: themeData.primaryColor,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          Uri.parse(_existingAudioUrl!).pathSegments.last,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ).withEpilogue,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Current audio file',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey[600],
                          ).withEpilogue,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: _removeAudioFile,
                    icon: const Icon(Icons.close, size: 18),
                    color: Colors.grey[600],
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),
          ] else ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(_inputBorderRadius),
                border: Border.all(color: Colors.grey[200]!, style: BorderStyle.solid),
              ),
              child: Column(
                children: [
                  Icon(
                    Icons.audiotrack,
                    size: 32,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'No audio file selected',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey[500],
                    ).withEpilogue,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Supported formats: MP3, WAV, M4A, AAC, FLAC, OGG',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey[400],
                    ).withEpilogue,
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTitleSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(_cardBorderRadius),
        border: Border.all(color: Colors.grey[300]!),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(_sectionPadding),
      child: TextField(
        controller: _titleController,
        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600).withEpilogue,
        decoration: InputDecoration(
          hintText: 'Add a title',
          border: InputBorder.none,
          focusedBorder: InputBorder.none,
          enabledBorder: InputBorder.none,
          hintStyle: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w500,
            color: Colors.grey[500],
          ).withEpilogue,
        ),
      ),
    );
  }

  Widget _buildDescriptionSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(_cardBorderRadius),
        border: Border.all(color: Colors.grey[300]!),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(_sectionPadding),
      child: TextField(
        controller: _descriptionController,
        maxLines: 6,
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w400).withEpilogue,
        decoration: InputDecoration(
          hintText: 'Tell your members about this audio...',
          border: InputBorder.none,
          focusedBorder: InputBorder.none,
          enabledBorder: InputBorder.none,
          hintStyle: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w400,
            color: Colors.grey[500],
          ).withEpilogue,
        ),
      ),
    );
  }

  Widget _buildSideSections() {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth > 768) {
          // Desktop/Tablet layout - two columns
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 2,
                child: Column(
                  children: [
                    _buildCollectionsSection(),
                    const SizedBox(height: _mediumSpacing),
                    _buildTagsSection(),
                  ],
                ),
              ),
              const SizedBox(width: _mediumSpacing),
              Expanded(
                flex: 1,
                child: Column(
                  children: [
                    _buildPostAccessSection(),
                    const SizedBox(height: _mediumSpacing),
                    _buildAttachmentsSection(),
                  ],
                ),
              ),
            ],
          );
        } else {
          // Mobile layout - single column
          return Column(
            children: [
              _buildCollectionsSection(),
              const SizedBox(height: _mediumSpacing),
              _buildTagsSection(),
              const SizedBox(height: _mediumSpacing),
              _buildPostAccessSection(),
              const SizedBox(height: _mediumSpacing),
              _buildAttachmentsSection(),
            ],
          );
        }
      },
    );
  }

  Widget _buildCollectionsSection() {
    return _buildSection(
      title: 'Collections',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DropdownButtonFormField<String>(
            value: _selectedCollection,
            hint: Text(
              'Select a collection',
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey[500],
              ).withEpilogue,
            ),
            style: const TextStyle(
              fontSize: 13,
              color: Colors.black87,
            ).withEpilogue,
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(_inputBorderRadius),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
            items: _availableCollections.map((collection) {
              return DropdownMenuItem(
                value: collection.id,
                child: Text(
                  collection.title,
                  style: const TextStyle(fontSize: 13).withEpilogue,
                ),
              );
            }).toList(),
            onChanged: (value) {
              setState(() {
                _selectedCollection = value;
              });
            },
          ),
          const SizedBox(height: 10),
          _buildSmallButton(
            'Create Collection',
            icon: Icons.add,
            onPressed: _createNewCollection,
            isPrimary: true,
          ),
          const SizedBox(height: _smallSpacing),
          Text(
            'Help fans explore your work with collections of related posts.',
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey[600],
            ).withEpilogue,
          ),
        ],
      ),
    );
  }

  Widget _buildTagsSection() {
    return _buildSection(
      title: 'Tags',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _tagController,
                  style: const TextStyle(fontSize: 13).withEpilogue,
                  decoration: InputDecoration(
                    hintText: 'Add tag',
                    hintStyle: TextStyle(
                      fontSize: 13,
                      color: Colors.grey[500],
                    ).withEpilogue,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(_inputBorderRadius),
                      borderSide: BorderSide(color: Colors.grey[300]!),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                  onSubmitted: (_) => _addTag(),
                ),
              ),
              const SizedBox(width: _smallSpacing),
              Container(
                height: 40,
                width: 40,
                decoration: BoxDecoration(
                  color: themeData.primaryColor,
                  borderRadius: BorderRadius.circular(_inputBorderRadius),
                ),
                child: IconButton(
                  onPressed: _addTag,
                  icon: const Icon(Icons.add, size: 18),
                  color: Colors.white,
                  padding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
          if (_tags.isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: _tags.map((tag) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        tag,
                        style: const TextStyle(fontSize: 11).withEpilogue,
                      ),
                      const SizedBox(width: 4),
                      GestureDetector(
                        onTap: () => _removeTag(tag),
                        child: const Icon(Icons.close, size: 12),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPostAccessSection() {
    return _buildSection(
      title: 'Who can access this post?',
      child: Column(
        children: [
          _buildAccessTile(
            title: 'Everyone (Public)',
            value: _isPublicAccess,
            onChanged: (value) {
              setState(() {
                if (value == true) {
                  _isPublicAccess = true;
                  _selectedTiers.clear();
                } else {
                  if (_selectedTiers.isEmpty) {
                    _isPublicAccess = true;
                  } else {
                    _isPublicAccess = false;
                  }
                }
              });
            },
          ),
          ..._membershipTiers.where((tier) => tier.monthlyRate > 0).map((tier) {
            MyPrint.printOnConsole(
              "Membership tier: ${tier.name}, Price: ${tier.monthlyRate}",
            );
            return _buildAccessTile(
              title: "${tier.name} (\$${tier.monthlyRate}/Month)",
              value: _selectedTiers.contains(tier.id),
              onChanged: (value) {
                setState(() {
                  if (value == true) {
                    _selectedTiers.add(tier.id);
                    _isPublicAccess = false;
                  } else {
                    _selectedTiers.remove(tier.id);

                    if (_selectedTiers.isEmpty && !_isPublicAccess) {
                      _selectedTiers.add(tier.id);
                      const SnackBar(
                        content: Text(
                          'At least one access option must be selected',
                        ),
                      );
                    }
                  }
                });
              },
            );
          }),
        ],
      ),
    );
  }

  Widget _buildAccessTile({
    required String title,
    required bool value,
    required ValueChanged<bool?> onChanged,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      child: CheckboxListTile(
        title: Text(
          title,
          style: const TextStyle(fontSize: 13).withEpilogue,
        ),
        value: value,
        onChanged: onChanged,
        controlAffinity: ListTileControlAffinity.leading,
        contentPadding: EdgeInsets.zero,
        dense: true,
        visualDensity: VisualDensity.compact,
      ),
    );
  }

  Widget _buildAttachmentsSection() {
    return _buildSection(
      title: 'Attachments',
      headerAction: TextButton(
        onPressed: _pickImage,
        child: Text(
          'Upload',
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ).withEpilogue,
        ),
      ),
      child: _attachedImages.isEmpty
          ? Text(
              'No attachments added',
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey[500],
              ).withEpilogue,
            )
          : Column(
              children: List.generate(_attachedImages.length, (index) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey[300]!),
                    borderRadius: BorderRadius.circular(_inputBorderRadius),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(4),
                          image: DecorationImage(
                            image: FileImage(_attachedImages[index]),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _attachedImages[index].path.split('/').last,
                          style: const TextStyle(fontSize: 11).withEpilogue,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => _removeImage(index),
                        child: const Icon(Icons.close, size: 14),
                      ),
                    ],
                  ),
                );
              }),
            ),
    );
  }

  Widget _buildSection({
    required String title,
    required Widget child,
    Widget? headerAction,
  }) {
    return Container(
      padding: const EdgeInsets.all(_sectionPadding),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(_cardBorderRadius),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ).withEpilogue,
              ),
              if (headerAction != null) headerAction,
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _buildSmallButton(
    String text, {
    IconData? icon,
    required VoidCallback onPressed,
    bool isPrimary = false,
  }) {
    return SizedBox(
      height: 32,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: icon != null ? Icon(icon, size: 14) : const SizedBox.shrink(),
        label: Text(
          text,
          style: const TextStyle(fontSize: 11).withEpilogue,
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: themeData.primaryColor,
          foregroundColor: isPrimary ? Colors.white : Colors.grey[700],
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(_inputBorderRadius),
          ),
          elevation: 0,
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Container(
      padding: const EdgeInsets.all(_sectionPadding),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(_cardBorderRadius),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => _saveDraftPost(isDraft: true),
              style: OutlinedButton.styleFrom(
                backgroundColor: themeData.colorScheme.onPrimary,
                foregroundColor: themeData.primaryColor,
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: BorderSide(color: Colors.grey[300]!),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(_inputBorderRadius),
                ),
              ),
              child: Text(
                'Save as Draft',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ).withEpilogue,
              ),
            ),
          ),
          const SizedBox(width: _mediumSpacing),
          Expanded(
            child: ElevatedButton(
              onPressed: createAudioPostScreen,
              style: ElevatedButton.styleFrom(
                backgroundColor: themeData.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(_inputBorderRadius),
                ),
                elevation: 0,
              ),
              child: Text(
                'Publish Post',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ).withEpilogue,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
