import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:path_provider/path_provider.dart' as path_provider;

/// A utility class to handle image picking, cropping, and compression.
class ImageHelper {
  static final ImagePicker _imagePicker = ImagePicker();

  static Future<File?> pickAndProcessImage({
    required BuildContext context,
    ImageSource source = ImageSource.gallery,
    bool isProfilePhoto = false,
    bool isCoverImage = false,
  }) async {
    MyPrint.printOnConsole(
        "ImageHelper: Image picking process started (isProfilePhoto: $isProfilePhoto, isCoverImage: $isCoverImage)...");
    final themeData = Theme.of(context);

    // Define crop settings based on flags
    CropAspectRatioPreset initAspectRatio;
    List<CropAspectRatioPreset> aspectRatioPresets;
    bool lockAspectRatio;

    if (isCoverImage) {
      initAspectRatio = CropAspectRatioPreset.ratio16x9;
      aspectRatioPresets = [CropAspectRatioPreset.ratio16x9];
      lockAspectRatio = true;
    } else if (isProfilePhoto) {
      initAspectRatio = CropAspectRatioPreset.square;
      aspectRatioPresets = [CropAspectRatioPreset.square];
      lockAspectRatio = true;
    } else {
      initAspectRatio = CropAspectRatioPreset.original;
      aspectRatioPresets = [
        CropAspectRatioPreset.original,
        CropAspectRatioPreset.square,
        CropAspectRatioPreset.ratio3x2,
        CropAspectRatioPreset.ratio4x3,
        CropAspectRatioPreset.ratio16x9,
      ];
      lockAspectRatio = false;
    }

    try {
      // 1. Pick Image from Gallery
      final XFile? pickedFile = await _imagePicker.pickImage(source: source);
      if (pickedFile == null) {
        MyPrint.printOnConsole("ImageHelper: No image selected.");
        return null;
      }
      MyPrint.printOnConsole("ImageHelper: Image picked: ${pickedFile.path}");

      // 2. Crop Image
      final CroppedFile? croppedFile = await ImageCropper().cropImage(
        sourcePath: pickedFile.path,
        compressQuality: 100,
        uiSettings: [
          AndroidUiSettings(
            toolbarTitle: 'Crop Image',
            toolbarColor: themeData.primaryColor,
            statusBarColor: themeData.primaryColor,
            toolbarWidgetColor: Colors.white,
            initAspectRatio: initAspectRatio,
            aspectRatioPresets: aspectRatioPresets,
            lockAspectRatio: lockAspectRatio,
          ),
          IOSUiSettings(
            title: 'Crop Image',
            resetAspectRatioEnabled: !lockAspectRatio,
            aspectRatioPresets: aspectRatioPresets,
            aspectRatioLockEnabled: lockAspectRatio,
          ),
        ],
      );

      if (croppedFile == null) {
        MyPrint.printOnConsole("ImageHelper: Image cropping cancelled.");
        return null;
      }
      MyPrint.printOnConsole("ImageHelper: Image cropped: ${croppedFile.path}");

      // 3. Compress Image
      final imageFile = File(croppedFile.path);
      final compressedImage = await _compressImage(imageFile, isProfilePhoto: isProfilePhoto);
      // The _compressImage function will now automatically delete the temporary 'imageFile' (the cropped version).

      if (compressedImage == null) {
        MyPrint.printOnConsole("ImageHelper: Image compression failed.");
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to process image')),
          );
        }
        return null;
      }
      MyPrint.printOnConsole("ImageHelper: Image processing successful.");
      return compressedImage;
    } catch (e) {
      MyPrint.printOnConsole("ImageHelper: Error picking image: $e");
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to pick image: $e')),
        );
      }
      return null;
    }
  }

  /// Picks multiple images and compresses them.
  static Future<List<File>> pickAndProcessMultipleImages({
    required BuildContext context,
  }) async {
    MyPrint.printOnConsole("ImageHelper: Multi-image picking process started...");
    List<File> processedImages = [];

    try {
      final List<XFile> pickedFiles = await _imagePicker.pickMultiImage();
      if (pickedFiles.isEmpty) {
        MyPrint.printOnConsole("ImageHelper: No images selected.");
        return [];
      }
      MyPrint.printOnConsole("ImageHelper: ${pickedFiles.length} images picked.");

      for (final pickedFile in pickedFiles) {
        MyPrint.printOnConsole("ImageHelper: Processing ${pickedFile.path}...");
        final imageFile = File(pickedFile.path);

        final compressedImage = await _compressImage(imageFile, isProfilePhoto: false);
        // The _compressImage function automatically deletes the temporary 'imageFile' from the picker cache.

        if (compressedImage != null) {
          processedImages.add(compressedImage);
        } else {
          MyPrint.printOnConsole("ImageHelper: Failed to compress ${pickedFile.path}.");
        }
      }

      MyPrint.printOnConsole("ImageHelper: Finished processing. Returning ${processedImages.length} images.");
      return processedImages;
    } catch (e) {
      MyPrint.printOnConsole("ImageHelper: Error picking multiple images: $e");
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error picking images: $e')),
        );
      }
      return [];
    }
  }

  /// Opens the cropper UI for an existing image file.
  static Future<File?> cropImage({
    required BuildContext context,
    required File imageFile,
  }) async {
    // This function does NOT delete the original 'imageFile' passed into it.
    // The calling widget is responsible for managing the original file.
    MyPrint.printOnConsole("ImageHelper: Cropping process started for ${imageFile.path}...");
    final themeData = Theme.of(context);

    try {
      final CroppedFile? croppedFile = await ImageCropper().cropImage(
          sourcePath: imageFile.path,
          // Other properties remain the same
          uiSettings: [
            AndroidUiSettings(
              toolbarTitle: 'Crop Image',
              toolbarColor: themeData.primaryColor,
              statusBarColor: themeData.primaryColor,
              toolbarWidgetColor: Colors.white,
              aspectRatioPresets: [
                CropAspectRatioPreset.original,
                CropAspectRatioPreset.square,
                CropAspectRatioPreset.ratio3x2,
                CropAspectRatioPreset.ratio4x3,
                CropAspectRatioPreset.ratio16x9,
              ],
            ),
            IOSUiSettings(
              title: 'Crop Image',
              resetAspectRatioEnabled: true,
              aspectRatioPresets: [
                CropAspectRatioPreset.original,
                CropAspectRatioPreset.square,
                CropAspectRatioPreset.ratio3x2,
                CropAspectRatioPreset.ratio4x3,
                CropAspectRatioPreset.ratio16x9,
              ],
            ),
          ]);

      if (croppedFile == null) {
        MyPrint.printOnConsole("ImageHelper: Image cropping cancelled.");
        return null;
      }

      _deleteFile(imageFile); // Delete the original file after cropping
      MyPrint.printOnConsole("ImageHelper: Original image deleted: ${imageFile.path}");

      MyPrint.printOnConsole("ImageHelper: Image cropped successfully: ${croppedFile.path}");
      return File(croppedFile.path);
    } catch (e) {
      MyPrint.printOnConsole("ImageHelper: Error cropping image: $e");
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error cropping image: $e')),
        );
      }
      return null;
    }
  }

  /// Compresses the given image file and deletes the source.
  static Future<File?> _compressImage(File file, {required bool isProfilePhoto}) async {
    final tempDir = await path_provider.getTemporaryDirectory();
    final targetPath = '${tempDir.path}/${DateTime.now().millisecondsSinceEpoch}.jpg';

    final sizeInMb = file.lengthSync() / (1024 * 1024);
    MyPrint.printOnConsole("ImageHelper: Original image size: ${sizeInMb.toStringAsFixed(2)} MB");

    int baseQuality;
    if (sizeInMb > 2.0) {
      baseQuality = 50;
    } else if (sizeInMb < 1.0) {
      baseQuality = 80;
    } else {
      baseQuality = 65;
    }

    int finalQuality;
    if (isProfilePhoto) {
      const double compressionIncreaseFactor = 2;
      double currentCompression = 100.0 - baseQuality;
      double increasedCompression = currentCompression * compressionIncreaseFactor;
      finalQuality = (100.0 - increasedCompression).round().clamp(10, 100);
    } else {
      finalQuality = baseQuality;
    }
    MyPrint.printOnConsole("ImageHelper: Compressing with quality $finalQuality.");

    final result = await FlutterImageCompress.compressAndGetFile(
      file.absolute.path,
      targetPath,
      quality: finalQuality,
    );

    if (result == null) {
      MyPrint.printOnConsole("ImageHelper: Compression returned null.");
      return null;
    }

    _deleteFile(file);

    final compressedFile = File(result.path);
    MyPrint.printOnConsole("ImageHelper: Compressed image size: ${(compressedFile.lengthSync() / 1024).toStringAsFixed(2)} KB");
    return compressedFile;
  }

  static Future<void> _deleteFile(File file) async {
    try {
      if (await file.exists()) {
        await file.delete();
        MyPrint.printOnConsole("ImageHelper: Deleted temporary file: ${file.path}");
      }
    } catch (e) {
      MyPrint.printOnConsole("ImageHelper: Error deleting file ${file.path}: $e");
    }
  }
}
