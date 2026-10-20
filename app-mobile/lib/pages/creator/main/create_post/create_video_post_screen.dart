import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:patreon_clone/models/collection/collection_data_model.dart';
import 'package:patreon_clone/models/membership/membership_model.dart';
import 'package:patreon_clone/models/post/data_model/post_model.dart';
import 'package:patreon_clone/models/post/request_model/create_video_post_request_model.dart';
import 'package:patreon_clone/utils/my_print.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/pages/components/widgets/modal_progress_hud.dart';
import 'package:patreon_clone/styles/font_manager.dart';
import 'package:patreon_clone/helpers/image_helper.dart';
import 'package:provider/provider.dart';
import 'package:video_player/video_player.dart';
import 'package:video_compress/video_compress.dart';

import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:patreon_clone/backend/common/dependency_injection.dart';
import 'package:patreon_clone/backend/creator/my_creator_controller.dart';
import 'package:patreon_clone/backend/creator/my_creator_provider.dart';
import 'package:patreon_clone/backend/post_creation/post_creation_contoller.dart';
import 'package:patreon_clone/backend/post_creation/post_creation_provider.dart';
import 'package:patreon_clone/pages/creator/main/dialogs/create_collection_dialog.dart';
import 'package:go_router/go_router.dart';
import 'package:patreon_clone/navigation/app_router.dart';

class CreateVideoPostScreen extends StatefulWidget {
  static const String routeName = '/CreateVideoPostScreen';
  final PostModel? post;
  final bool isTabbedView;
  const CreateVideoPostScreen({super.key, this.post, this.isTabbedView = false});
  @override
  State<CreateVideoPostScreen> createState() => _CreateVideoPostScreenState();
}

class _CreateVideoPostScreenState extends State<CreateVideoPostScreen> with MySafeState {
  final TextEditingController _videoUrlController = TextEditingController();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _tagController = TextEditingController();
  late PostCreationProvider _postCreationProvider;
  late PostCreationController _controller;
  YoutubePlayerController? _youtubeController;
  bool _isVideoUrlValid = false;
  bool _isLoading = false;
  late MyCreatorProvider myCreatorProvider;
  late MyCreatorController myCreatorController;
  String? _selectedCollection;
  List<CollectionModel> _availableCollections = [];
  List<String> _tags = [];
  bool _isPublicAccess = true;
  File? _selectedVideoFile;
  bool _isLocalVideoLoading = false;
  bool _hasLocalVideoError = false;
  VideoPlayerController? _localVideoController;
  File? _originalVideoFile;
  File? _processedVideoFile;
  bool _isHD = false;
  double? _videoSize;
  String? _existingUploadedVideoUrl;
  VideoPlayerController? _networkVideoController;
  bool _isNetworkVideoLoading = false;
  bool _hasNetworkVideoError = false;
  final List<File> _attachedImages = [];
  List<String> _selectedTiers = [];
  List<MembershipModel> _membershipTiers = [];
  final TextEditingController _newCollectionController = TextEditingController();
  static const double _cardBorderRadius = 12.0;
  static const double _inputBorderRadius = 8.0;
  static const double _smallSpacing = 8.0;
  static const double _mediumSpacing = 16.0;
  static const double _largeSpacing = 24.0;
  static const double _sectionPadding = 16.0;
  @override
  void dispose() {
    _localVideoController?.dispose();
    _youtubeController?.dispose();
    _networkVideoController?.dispose();
    _videoUrlController.dispose();
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
      _isPublicAccess = _selectedTiers.isEmpty;
      if (p.collections.isNotEmpty) {
        _selectedCollection = p.collections.first;
      }
      final provider = p.videoProvider.toLowerCase();
      final existingUrl = p.videoUrl;
      if (provider == 'youtube' && existingUrl.isNotEmpty) {
        _videoUrlController.text = existingUrl;
        _onVideoUrlChanged(existingUrl);
      } else if (existingUrl.isNotEmpty) {
        _existingUploadedVideoUrl = existingUrl;
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) _initializeNetworkVideoController(existingUrl);
        });
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

  Future<void> _initializeNetworkVideoController(String url) async {
    if (url.isEmpty) return;
    _disposeNetworkVideoController();
    setState(() {
      _isNetworkVideoLoading = true;
      _hasNetworkVideoError = false;
    });
    try {
      final controller = VideoPlayerController.networkUrl(Uri.parse(url));
      await controller.initialize();
      controller.setLooping(true);
      controller.addListener(() {
        if (mounted) mySetState();
      });
      if (!mounted) {
        controller.dispose();
        return;
      }
      setState(() {
        _networkVideoController = controller;
      });
    } catch (e, st) {
      MyPrint.printOnConsole("Error initializing uploaded video preview: $e\n$st");
      if (!mounted) return;
      setState(() {
        _hasNetworkVideoError = true;
      });
    } finally {
      // ignore: control_flow_in_finally
      if (!mounted) return;
      setState(() {
        _isNetworkVideoLoading = false;
      });
    }
  }

  void _disposeNetworkVideoController() {
    _networkVideoController?.dispose();
    _networkVideoController = null;
  }

  void _toggleNetworkVideoPlayback() {
    final controller = _networkVideoController;
    if (controller == null) return;
    if (controller.value.isPlaying) {
      controller.pause();
    } else {
      controller.play();
    }
    setState(() {});
  }

  void _clearExistingUploadedVideoPreview() {
    _existingUploadedVideoUrl = null;
    _hasNetworkVideoError = false;
    _isNetworkVideoLoading = false;
    _disposeNetworkVideoController();
    setState(() {
      _originalVideoFile = null;
      _processedVideoFile = null;
      _videoSize = null;
      _isLocalVideoLoading = false;
      _hasLocalVideoError = false;
      _disposeLocalVideoController();
    });
  }

  String _getVideoUrlForSubmission() {
    if (_selectedVideoFile != null) {
      return '';
    }
    final trimmed = _videoUrlController.text.trim();
    if (trimmed.isNotEmpty) {
      return trimmed;
    }
    return _existingUploadedVideoUrl ?? '';
  }

  void _onVideoUrlChanged(String url) {
    if (url.trim().isNotEmpty) {
      _clearExistingUploadedVideoPreview();
    }
    final videoId = YoutubePlayer.convertUrlToId(url);
    _isVideoUrlValid = videoId != null;
    if (_isVideoUrlValid && videoId != null) {
      _youtubeController?.dispose();
      _youtubeController = YoutubePlayerController(
        initialVideoId: videoId,
        flags: const YoutubePlayerFlags(
          autoPlay: false,
          mute: false,
          enableCaption: true,
          captionLanguage: 'en',
        ),
      );
    } else {
      _youtubeController?.dispose();
      _youtubeController = null;
    }
    mySetState();
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

  Future<void> _pickVideoFromDevice() async {
    final pickedFile = await ImagePicker().pickVideo(source: ImageSource.gallery);
    if (pickedFile != null) {
      final original = File(pickedFile.path);
      setState(() {
        _clearExistingUploadedVideoPreview();
        _originalVideoFile = original;
        _processedVideoFile = original;
        _selectedVideoFile = _processedVideoFile;
        _isLocalVideoLoading = true;
        _hasLocalVideoError = false;
        _videoUrlController.clear();
        _youtubeController?.dispose();
        _youtubeController = null;
        _isVideoUrlValid = false;
      });
      await _updateVideoSize();
      await _initializeLocalVideoController();
    }
  }

  Future<void> _initializeLocalVideoController() async {
    if (_processedVideoFile == null) return;
    _disposeLocalVideoController();
    if (!mounted) return;
    setState(() {
      _isLocalVideoLoading = true;
      _hasLocalVideoError = false;
    });
    try {
      final controller = VideoPlayerController.file(_processedVideoFile!);
      await controller.initialize();
      controller.setLooping(true);
      controller.addListener(() {
        if (mounted) mySetState();
      });
      if (!mounted) {
        controller.dispose();
        return;
      }
      if (mounted) {
        setState(() {
          _localVideoController = controller;
        });
      }
    } catch (e, st) {
      MyPrint.printOnConsole("Error initializing local video preview: $e\n$st");
      if (!mounted) return;
      setState(() {
        _hasLocalVideoError = true;
      });
    } finally {
      // ignore: control_flow_in_finally
      if (!mounted) return;
      setState(() {
        _isLocalVideoLoading = false;
      });
    }
  }

  void _disposeLocalVideoController() {
    _localVideoController?.dispose();
    _localVideoController = null;
  }

  void _toggleLocalVideoPlayback() {
    final controller = _localVideoController;
    if (controller == null) return;
    if (controller.value.isPlaying) {
      controller.pause();
    } else {
      controller.play();
    }
    setState(() {});
  }

  Future<void> _updateVideoSize() async {
    if (_processedVideoFile == null) {
      if (mounted) {
        setState(() {
          _videoSize = null;
        });
      }
      return;
    }
    final bytes = await _processedVideoFile!.length();
    if (mounted) {
      setState(() {
        _videoSize = bytes / (1024 * 1024);
      });
    }
  }

  String _getVideoSizeString() {
    if (_videoSize == null) return '';
    if (_videoSize! >= 1) {
      return '${_videoSize!.toStringAsFixed(1)} MB';
    } else {
      return '${(_videoSize! * 1024).toStringAsFixed(0)} KB';
    }
  }

  void _toggleHD() {
    setState(() {
      _isHD = !_isHD;
    });
  }

  void _showVideoTrimmer() {
    if (_processedVideoFile == null) return;
    context.pushNamed(
      Routes.videoTrimmer,
      extra: {
        'videoFile': _processedVideoFile!,
        'onTrimmed': (File trimmedFile) async {
          // Optional: delete previous trimmed file if different from original
          if (_processedVideoFile != null && _processedVideoFile!.path != _originalVideoFile!.path) {
            try {
              await _processedVideoFile!.delete();
            } catch (_) {}
          }
          setState(() {
            _processedVideoFile = trimmedFile;
            _selectedVideoFile = trimmedFile;
          });
          await _updateVideoSize();
          await _initializeLocalVideoController();
        },
      },
    );
  }

  void _revertToOriginal() {
    if (_originalVideoFile == null || _processedVideoFile!.path == _originalVideoFile!.path) return;
    setState(() {
      _processedVideoFile = _originalVideoFile;
      _selectedVideoFile = _processedVideoFile;
    });
    _updateVideoSize();
    _initializeLocalVideoController();
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
    _availableCollections = collections;
    _selectedCollection = newCollection.id;
    mySetState();
  }

  Future<void> createVideoPostScreen({bool isDraft = false}) async {
    MyPrint.printOnConsole("_savePost called from CreateVideoPostScreen");
    bool success = false;
    _isLoading = true;
    mySetState();
    try {
      if (widget.post != null) {
        final post = widget.post!;
        post
          ..title = _titleController.text.trim()
          ..videoUrl = _getVideoUrlForSubmission()
          ..description = _descriptionController.text.trim()
          ..collections = _selectedCollection != null ? [_selectedCollection!] : []
          ..tags = _tags
          ..tierAccess = _selectedTiers;
        success = await _controller.updatePost(post: post);
      } else {
        File? uploadFile = _selectedVideoFile;
        if (uploadFile != null) {
          final info = await VideoCompress.compressVideo(
            uploadFile.path,
            quality: _isHD ? VideoQuality.HighestQuality : VideoQuality.MediumQuality,
            deleteOrigin: false,
            includeAudio: true,
          );
          if (info?.file != null) {
            uploadFile = info!.file!;
          }
        }
        final request = CreateVideoPostRequestModel(
          title: _titleController.text.trim(),
          videoUrl: uploadFile == null ? _getVideoUrlForSubmission() : '',
          description: _descriptionController.text.trim(),
          collections: _selectedCollection != null ? [_selectedCollection!] : [],
          tags: _tags,
          isDraft: isDraft,
          tierAccess: _selectedTiers,
        );
        success = await _controller.createVideoPost(
          request: request,
          videoFile: uploadFile,
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
      MyPrint.printOnConsole("Error creating/updating video post: $e\n$st");
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
    MyPrint.printOnConsole("_saveDraftPost called from CreateVideoPostScreen");
    bool success = false;
    _isLoading = true;
    mySetState();
    try {
      File? uploadFile = _selectedVideoFile;
      if (uploadFile != null) {
        final info = await VideoCompress.compressVideo(
          uploadFile.path,
          quality: _isHD ? VideoQuality.HighestQuality : VideoQuality.MediumQuality,
          deleteOrigin: false,
          includeAudio: true,
        );
        if (info?.file != null) {
          uploadFile = info!.file!;
        }
      }
      final request = CreateVideoPostRequestModel(
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim(),
        collections: _selectedCollection != null ? [_selectedCollection!] : [],
        tags: _tags,
        isDraft: isDraft,
        tierAccess: _selectedTiers,
        videoUrl: uploadFile == null ? _getVideoUrlForSubmission() : '',
      );
      success = await _controller.createVideoPost(
        request: request,
        videoFile: uploadFile,
        attachments: _attachedImages,
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
            const SnackBar(content: Text('Failed to save draft')),
          );
        }
      }
    } catch (e, st) {
      MyPrint.printOnConsole("Error saving draft video post: $e\n$st");
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
              _buildVideoInputSection(),
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
        widget.post != null ? 'Edit Video Post' : 'Create Video Post',
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

  Widget _buildVideoInputSection() {
    final uploadPreview = _buildUploadedVideoPreview();
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
                'Video',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ).withEpilogue,
              ),
              ElevatedButton.icon(
                onPressed: _pickVideoFromDevice,
                icon: const Icon(Icons.video_library_outlined, size: 16),
                label: Text(
                  _selectedVideoFile == null ? 'Upload Video' : 'Change Video',
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
          if (uploadPreview != null) ...[
            uploadPreview,
            if (_originalVideoFile != null &&
                _processedVideoFile != null &&
                _processedVideoFile!.path != _originalVideoFile!.path) ...[
              const SizedBox(height: 10),
              Center(
                child: TextButton.icon(
                  onPressed: _revertToOriginal,
                  icon: const Icon(Icons.undo, size: 16),
                  label: const Text('Revert to original'),
                  style: TextButton.styleFrom(
                    foregroundColor: themeData.primaryColor,
                  ),
                ),
              ),
            ],
          ] else if (_isVideoUrlValid && _youtubeController != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: YoutubePlayer(
                controller: _youtubeController!,
                showVideoProgressIndicator: true,
                progressIndicatorColor: themeData.primaryColor,
                progressColors: ProgressBarColors(
                  playedColor: themeData.primaryColor,
                  handleColor: themeData.primaryColor,
                ),
              ),
            ),
          ] else ...[
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
                    Icons.video_library_outlined,
                    size: 48,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Upload a video or paste a YouTube link',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[500],
                    ).withEpilogue,
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: Divider(color: Colors.grey[300])),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Text(
                  'OR',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ).withEpilogue,
                ),
              ),
              Expanded(child: Divider(color: Colors.grey[300])),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _videoUrlController,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500).withEpilogue,
            decoration: InputDecoration(
              hintText: 'Paste YouTube video link (optional)',
              prefixIcon: Icon(Icons.link, color: Colors.grey[500], size: 20),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(_inputBorderRadius),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(_inputBorderRadius),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(_inputBorderRadius),
                borderSide: BorderSide(color: themeData.primaryColor),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
            ),
            onChanged: _onVideoUrlChanged,
          ),
        ],
      ),
    );
  }

  Widget? _buildUploadedVideoPreview() {
    if (_selectedVideoFile != null) {
      return _buildLocalVideoPreview();
    } else if (_existingUploadedVideoUrl != null) {
      return _buildExistingUploadedVideoPreview();
    }
    return null;
  }

  Widget _buildLocalVideoPreview() {
    Widget content;
    if (_isLocalVideoLoading) {
      content = Container(
        color: Colors.black,
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: Colors.white),
            SizedBox(height: 12),
            Text('Loading video...', style: TextStyle(color: Colors.white)),
          ],
        ),
      );
    } else if (_hasLocalVideoError) {
      content = const Center(
        child: Text('Unable to load video', style: TextStyle(color: Colors.white)),
      );
    } else if (_localVideoController != null && _localVideoController!.value.isInitialized) {
      content = GestureDetector(
        onTap: _toggleLocalVideoPlayback,
        child: Stack(
          alignment: Alignment.center,
          children: [
            AspectRatio(
              aspectRatio: _localVideoController!.value.aspectRatio,
              child: VideoPlayer(_localVideoController!),
            ),
            if (!_localVideoController!.value.isPlaying)
              Container(
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.4),
                  shape: BoxShape.circle,
                ),
                padding: const EdgeInsets.all(12),
                child: const Icon(Icons.play_arrow, color: Colors.white, size: 48),
              ),
          ],
        ),
      );
    } else {
      content = const Center(
        child: Icon(Icons.videocam, color: Colors.white70, size: 48),
      );
    }
    final videoName = _processedVideoFile!.path.split('/').last;
    final sizeText = _getVideoSizeString();
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        height: 200,
        width: double.infinity,
        child: Stack(
          fit: StackFit.expand,
          children: [
            content,
            Positioned(
              top: 8,
              left: 8,
              child: GestureDetector(
                onTap: _toggleHD,
                child: Stack(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 7),
                      decoration: BoxDecoration(
                        color: _isHD ? Colors.black.withOpacity(0.5) : Colors.black.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(50),
                      ),
                      child: Icon(
                        _isHD ? Icons.hd : Icons.hd_outlined,
                        color: _isHD ? Colors.white : Colors.white,
                        size: 25,
                      ),
                    ),
                    if (_isHD) ...[
                      Positioned(
                        bottom: 3,
                        right: 3,
                        child: Icon(
                          Icons.check,
                          color: Colors.white,
                          shadows: [
                            Shadow(
                              color: Colors.black.withOpacity(0.7),
                              offset: const Offset(-1, -1),
                              blurRadius: 5,
                            ),
                          ],
                          size: 17,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.3),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(Icons.content_cut, color: Colors.white, size: 24),
                  onPressed: _showVideoTrimmer,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ),
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      Colors.black.withOpacity(0.8),
                      Colors.black.withOpacity(0.4),
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.video_file, color: Colors.white, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        videoName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                          fontSize: 13,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                    if (sizeText.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      Text(
                        sizeText,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExistingUploadedVideoPreview() {
    Widget content;
    if (_isNetworkVideoLoading) {
      content = Container(
        color: Colors.black,
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: Colors.white),
            SizedBox(height: 12),
            Text('Loading uploaded video...', style: TextStyle(color: Colors.white)),
          ],
        ),
      );
    } else if (_hasNetworkVideoError) {
      content = const Center(
        child: Text('Unable to load video', style: TextStyle(color: Colors.white)),
      );
    } else if (_networkVideoController != null && _networkVideoController!.value.isInitialized) {
      content = GestureDetector(
        onTap: _toggleNetworkVideoPlayback,
        child: Stack(
          alignment: Alignment.center,
          children: [
            AspectRatio(
              aspectRatio: _networkVideoController!.value.aspectRatio,
              child: VideoPlayer(_networkVideoController!),
            ),
            if (!_networkVideoController!.value.isPlaying)
              Container(
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.4),
                  shape: BoxShape.circle,
                ),
                padding: const EdgeInsets.all(12),
                child: const Icon(Icons.play_arrow, color: Colors.white, size: 48),
              ),
          ],
        ),
      );
    } else {
      content = const Center(
        child: Text('Preparing video...', style: TextStyle(color: Colors.white)),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: SizedBox(
        height: 200,
        width: double.infinity,
        child: Stack(
          fit: StackFit.expand,
          children: [
            content,
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      Colors.black.withOpacity(0.8),
                      Colors.black.withOpacity(0.4),
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.video_library_outlined, color: Colors.white, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _getExistingUploadedVideoName(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                          fontSize: 13,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Tap to play/pause',
                      style: TextStyle(color: Colors.white70, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getExistingUploadedVideoName() {
    if (_existingUploadedVideoUrl == null || _existingUploadedVideoUrl!.isEmpty) {
      return 'Uploaded video';
    }
    try {
      final uri = Uri.parse(_existingUploadedVideoUrl!);
      if (uri.pathSegments.isNotEmpty) {
        return uri.pathSegments.last;
      }
    } catch (_) {}
    return _existingUploadedVideoUrl!;
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
          hintText: 'Tell your members about this video...',
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
              onPressed: createVideoPostScreen,
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
