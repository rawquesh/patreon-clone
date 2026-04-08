import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class CommonCachedNetworkImage extends StatelessWidget {
  final String imageUrl;
  final double borderRadius;
  final double? height;
  final double? width;
  final BoxFit fit;
  final bool onlyPlaceholderSize;

  const CommonCachedNetworkImage({
    super.key,
    required this.imageUrl,
    this.borderRadius = 0,
    this.height,
    this.width,
    this.fit = BoxFit.cover,
    this.onlyPlaceholderSize = false,
  });

  @override
  Widget build(BuildContext context) {
    final String finalUrl = (imageUrl.trim().isNotEmpty) ? imageUrl : 'https://picsum.photos/40'; // fallback

    return SizedBox(
      height: onlyPlaceholderSize ? null : height,
      width: onlyPlaceholderSize ? null : width,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: CachedNetworkImage(
          imageUrl: finalUrl,
          fit: fit,
          placeholder: (context, _) {
            return SizedBox(
              height: height,
              width: width,
              child: Shimmer.fromColors(
                baseColor: const Color(0xffb6b6b6),
                highlightColor: const Color(0xfff2f2f2),
                child: Container(
                  alignment: Alignment.center,
                  color: const Color(0xffc2c2c2),
                  child: const Icon(
                    Icons.image,
                    size: 20,
                  ),
                ),
              ),
            );
          },
          errorWidget: (___, __, _) => Container(
            color: Colors.grey[200],
            child: Icon(
              Icons.image_outlined,
              color: Colors.grey[400],
              size: 20,
            ),
          ),
        ),
      ),
    );
  }
}
