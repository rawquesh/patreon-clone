import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:patreon_clone/models/collection/collection_data_model.dart';
import 'package:patreon_clone/models/membership/membership_model.dart';
import 'package:patreon_clone/models/message/attachment_data_model.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/models/post/request_model/create_draft_images_post_request_model.dart';
import 'package:patreon_clone/models/post/request_model/create_images_post_request_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:patreon_clone/helpers/image_helper.dart';
import 'package:provider/provider.dart';
import 'package:path_provider/path_provider.dart';

import 'package:patreon_clone/backend/common/dependency_injection.dart';
import 'package:patreon_clone/backend/creator/my_creator_controller.dart';
import 'package:patreon_clone/backend/creator/my_creator_provider.dart';
import 'package:patreon_clone/backend/post_creation/post_creation_contoller.dart';
import 'package:patreon_clone/backend/post_creation/post_creation_provider.dart';
import 'package:patreon_clone/pages/creator/main/dialogs/create_collection_dialog.dart';

class CreateImagePostScreen extends StatefulWidget {
  final PostModel? post;
  final bool isTabbedView;

  const CreateImagePostScreen({super.key, this.post, this.isTabbedView = false});

  @override
  State<CreateImagePostScreen> createState() => _CreateImagePostScreenState();
}

class _CreateImagePostScreenState extends State<CreateImagePostScreen> with MySafeState {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _tagController = TextEditingController();
  late PostCreationProvider _postCreationProvider;
  late PostCreationController _controller;
  late MyCreatorProvider myCreatorProvider;
  late MyCreatorController myCreatorController;

  String? _selectedCollection;
  List<CollectionModel> _availableCollections = [];
  List<String> _tags = [];
  bool _isPublicAccess = true;
  bool _isLoading = false;
  final List<File> _attachedImages = [];
  List<File> _selectedImages = [];
  final List<File> _selectedAudioFiles = [];
  List<String> _selectedTiers = [];
  List<MembershipModel> _membershipTiers = [];
  // final bool _isCreatingCollection = false;
  final TextEditingController _newCollectionController = TextEditingController();

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
    _loadData();
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
        _loadImagesFromUrls(p.mediaUrls);
      }

      if (p.attachments.isNotEmpty) {
        _loadAttachmentsFromUrls(p.attachments);
      }
    }

    myCreatorProvider = context.read<MyCreatorProvider>();
    myCreatorController = MyCreatorController(
      myCreatorProvider: myCreatorProvider,
    );
  }

  Future<void> _loadData() async {
    await _controller.loadInitialData();
    setState(() {
      _membershipTiers = _postCreationProvider.memberships.getList();
      _availableCollections = _postCreationProvider.collections.getList();
    });
  }

  Future<void> _loadAttachmentsFromUrls(List<AttachmentModel> attachments) async {
    // This function assumes your AttachmentModel has a `url` property.
    try {
      final tempDir = await getTemporaryDirectory();
      List<File> downloadedAttachments = [];

      await Future.wait(attachments.map((attachment) async {
        try {
          final file = await _downloadFileFromUrl(attachment.url, tempDir.path);
          if (file != null) {
            downloadedAttachments.add(file);
          }
        } catch (e) {
          MyPrint.printOnConsole("Error downloading attachment ${attachment.url}: $e");
        }
      }));

      if (mounted) {
        setState(() {
          // This combines any newly picked attachments with the loaded ones.
          _attachedImages.addAll(downloadedAttachments);
        });
      }
    } catch (e) {
      MyPrint.printOnConsole("An error occurred in _loadAttachmentsFromUrls: $e");
    }
  }

  Future<void> _loadImagesFromUrls(List<String> urls) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final tempDir = await getTemporaryDirectory();
      List<File> downloadedImages = [];

      await Future.wait(urls.map((url) async {
        try {
          final file = await _downloadFileFromUrl(url, tempDir.path);
          if (file != null) {
            downloadedImages.add(file);
          }
        } catch (e) {
          MyPrint.printOnConsole("Error downloading image $url: $e");
        }
      }));

      if (mounted) {
        setState(() {
          _selectedImages = downloadedImages;
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  /// Downloads a file from URL using dart:io HttpClient
  Future<File?> _downloadFileFromUrl(String url, String tempDirPath) async {
    try {
      final httpClient = HttpClient();
      final request = await httpClient.getUrl(Uri.parse(url));
      final response = await request.close();

      if (response.statusCode == 200) {
        final fileName = '${DateTime.now().millisecondsSinceEpoch}-${url.split('/').last}';
        final file = File('$tempDirPath/$fileName');

        final List<int> bytes = [];
        await for (var chunk in response) {
          bytes.addAll(chunk);
        }
        await file.writeAsBytes(Uint8List.fromList(bytes));
        httpClient.close();
        return file;
      }
      httpClient.close();
    } catch (e) {
      MyPrint.printOnConsole("Error in _downloadFileFromUrl: $e");
    }
    return null;
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

  Future<void> _pickImages() async {
    final List<File> processedImages = await ImageHelper.pickAndProcessMultipleImages(context: context);

    if (processedImages.isNotEmpty) {
      setState(() {
        for (var imageFile in processedImages) {
          if (_selectedImages.length < 10) {
            _selectedImages.add(imageFile);
          } else {
            break;
          }
        }
      });

      if (_selectedImages.length >= 10) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Maximum 10 images allowed'),
          ),
        );
      }
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  void _removeAttachmentImage(int index) {
    setState(() {
      _attachedImages.removeAt(index);
    });
  }

  Future<void> _pickImage() async {
    final File? processedImage = await ImageHelper.pickAndProcessImage(
      context: context,
    );

    if (processedImage != null) {
      setState(() {
        _attachedImages.add(processedImage);
      });
    }
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

  Future<void> createImagePost({bool isDraft = false}) async {
    MyPrint.printOnConsole("_savePost called from CreateImagePostScreen");

    bool success = false;

    _isLoading = true;
    mySetState();

    try {
      if (widget.post != null) {
        final post = widget.post!;
        post
          ..title = _titleController.text.trim()
          ..description = _descriptionController.text.trim()
          ..collections = _selectedCollection != null ? [_selectedCollection!] : []
          ..tags = _tags
          ..tierAccess = _selectedTiers;

        success = await _controller.updateImagePost(
          post: post,
          imageFiles: _selectedImages,
          attachments: [..._attachedImages, ..._selectedAudioFiles],
        );
      } else {
        final request = CreateImagesPostRequestModel(
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          collections: _selectedCollection != null ? [_selectedCollection!] : [],
          tags: _tags,
          tierAccess: _selectedTiers,
        );

        MyPrint.printOnConsole("Creating new image post with request: $request");

        success = await _controller.createImagePost(
          request: request,
          imageFiles: _selectedImages,
          attachments: [..._attachedImages, ..._selectedAudioFiles],
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
      MyPrint.printOnConsole("Error creating/updating image post: $e\n$st");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('An error occurred while saving post')),
        );
      }
    } finally {
      if (mounted) {
        _isLoading = false;
        mySetState();
      }
    }
  }

  Future<void> _saveDraftPost({bool isDraft = false}) async {
    MyPrint.printOnConsole("_saveDraftPost called from CreateImagePostScreen");

    bool success = false;

    _isLoading = true;
    mySetState();

    try {
      final request = CreateDraftImagesPostRequestModel(
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        collections: _selectedCollection != null ? [_selectedCollection!] : [],
        tags: _tags,
        isDraft: isDraft,
        tierAccess: _selectedTiers,
      );

      success = await _controller.createDraftImagePost(
        request: request,
        imageFiles: _selectedImages,
        attachments: [..._attachedImages, ..._selectedAudioFiles],
      );

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
      MyPrint.printOnConsole("Error saving draft image post: $e\n$st");
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('An error occurred while saving post')),
        );
      }
    } finally {
      if (mounted) {
        _isLoading = false;
        mySetState();
      }
    }
  }

  Future<void> _cropImage(int index) async {
    final File imageToCrop = _selectedImages[index];

    final File? croppedImage = await ImageHelper.cropImage(
      context: context,
      imageFile: imageToCrop,
    );

    if (croppedImage != null) {
      setState(() {
        _selectedImages[index] = croppedImage;
      });
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
              _buildImagesSection(),
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
        widget.post != null ? 'Edit Image Post' : 'Create Image Post',
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

  Widget _buildImagesSection() {
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
                'Images (${_selectedImages.length}/10)',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ).withEpilogue,
              ),
              ElevatedButton.icon(
                onPressed: _selectedImages.length < 10 ? _pickImages : null,
                icon: const Icon(Icons.add_photo_alternate, size: 16),
                label: Text(
                  'Add Images',
                  style: const TextStyle(fontSize: 12).withEpilogue,
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: themeData.primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(_inputBorderRadius),
                  ),
                  elevation: 0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_selectedImages.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(_inputBorderRadius),
                border: Border.all(color: Colors.grey[200]!, style: BorderStyle.solid),
              ),
              child: Column(
                children: [
                  Icon(
                    Icons.add_photo_alternate,
                    size: 48,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Add up to 10 images',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[500],
                    ).withEpilogue,
                  ),
                ],
              ),
            )
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
                childAspectRatio: 1,
              ),
              itemCount: _selectedImages.length,
              itemBuilder: (context, index) {
                return Stack(
                  fit: StackFit.expand,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(_inputBorderRadius),
                      child: Image.file(
                        _selectedImages[index],
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () => _removeImage(index),
                        child: Container(
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.6),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.close,
                            size: 16,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    Center(
                      child: GestureDetector(
                        onTap: () => _cropImage(index),
                        child: Container(
                          padding: const EdgeInsets.all(3),
                          decoration: const BoxDecoration(
                            color: Colors.black12,
                          ),
                          child: const Opacity(
                            opacity: 0.5,
                            child: Icon(
                              Icons.crop_free_sharp,
                              size: 50,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
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
          hintText: 'Tell your members about this image post...',
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
                        onTap: () => _removeAttachmentImage(index),
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
              onPressed: createImagePost,
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
