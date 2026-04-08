import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';

class AnimatedHeartButton extends StatefulWidget {
  final bool isLiked;
  final int likesCount;
  final VoidCallback onTap;
  final double size;
  final Color likedColor;
  final Color unlikedColor;
  final bool showCount;
  final TextStyle? countTextStyle;

  const AnimatedHeartButton({
    super.key,
    required this.isLiked,
    required this.likesCount,
    required this.onTap,
    this.size = 20,
    this.likedColor = Colors.red,
    this.unlikedColor = Colors.grey,
    this.showCount = true,
    this.countTextStyle,
  });

  @override
  State<AnimatedHeartButton> createState() => _AnimatedHeartButtonState();
}

class _AnimatedHeartButtonState extends State<AnimatedHeartButton>
    with TickerProviderStateMixin {
  late AnimationController _heartController;
  late AnimationController _particleController;
  late Animation<double> _heartAnimation;
  late Animation<double> _scaleAnimation;

  // Define 15 shades for particles (yellow, orange, red, pink shades)
  final List<Color> _particleColors = [
    const Color(0xFFFFC107), // Yellow
    const Color(0xFFFFA000), // Orange-ish Yellow
    const Color(0xFFFF7043), // Orange
    const Color(0xFFFF5722), // Deep Orange
    const Color(0xFFF44336), // Red
    const Color(0xFFE53935), // Deep Red
    const Color(0xFFD81B60), // Pinkish Red
    const Color(0xFFE91E63), // Pink
    const Color(0xFFFF4081), // Hot Pink
    const Color(0xFFFF80AB), // Light Pink
    const Color(0xFFFFC1E3), // Very Light Pink
    const Color(0xFFFFD54F), // Yellow-Orange
    const Color(0xFFFF6F00), // Strong Orange
    const Color(0xFFFF1744), // Bright Red
    const Color(0xFFFF8A65), // Light Orange
  ];

  final int _particleCount = 15;
  late List<_ConfettiParticle> _confettiParticles;

  @override
  void initState() {
    super.initState();

    _heartController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _particleController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _heartAnimation = Tween<double>(
      begin: 1.0,
      end: 1.3,
    ).animate(CurvedAnimation(
      parent: _heartController,
      curve: Curves.elasticOut,
    ));
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.95,
    ).animate(CurvedAnimation(
      parent: _heartController,
      curve: Curves.easeInOut,
    ));

    _generateConfettiParticles(); // Initialize confetti
  }

  @override
  void didUpdateWidget(AnimatedHeartButton oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.isLiked != widget.isLiked) {
      if (widget.isLiked) {
        _triggerLikeAnimation();
      }
    }
  }

  void _triggerLikeAnimation() {
    _generateConfettiParticles();
    _heartController.forward().then((_) {
      _heartController.reverse();
    });

    if (widget.isLiked) {
      _particleController.forward().then((_) {
        _particleController.reset();
      });
    }
  }

  // Generate confetti particles with random angle/distance each time
  void _generateConfettiParticles() {
    final math.Random rng = math.Random();
    _confettiParticles = List.generate(_particleCount, (index) {
      final angle = rng.nextDouble() * 2 * math.pi;
      final distance = 20.0 + rng.nextDouble() * 24.0; // 20~44 px from heart
      final color = _particleColors[index % _particleColors.length];
      final size = 4.0 + rng.nextDouble() * 3.5; // 4~7.5 px
      return _ConfettiParticle(
        angle: angle,
        distance: distance,
        color: color,
        size: size,
      );
    });
  }

  @override
  void dispose() {
    _heartController.dispose();
    _particleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        widget.onTap();
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedBuilder(
            animation: Listenable.merge([_heartController, _particleController]),
            builder: (context, child) {
              return Transform.scale(
                scale: _scaleAnimation.value,
                child: Stack(
                  clipBehavior: Clip.none,
                  alignment: Alignment.center,
                  children: [
                    if (widget.isLiked && _particleController.isAnimating)
                      ..._buildConfettiParticles(),

                    Transform.scale(
                      scale: _heartAnimation.value,
                      child: Icon(
                        widget.isLiked
                            ? CupertinoIcons.heart_fill
                            : CupertinoIcons.heart,
                        size: widget.size,
                        color: widget.isLiked
                            ? widget.likedColor
                            : widget.unlikedColor,
                      ),
                    )
                        .animate(target: widget.isLiked ? 1 : 0)
                        .shimmer(
                      duration: 600.ms,
                      color: widget.likedColor.withOpacity(0.5),
                    )
                        .then()
                        .shake(hz: 4, curve: Curves.easeInOut),
                  ],
                ),
              );
            },
          ),

          if (widget.showCount) ...[
            const SizedBox(width: 4),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              transitionBuilder: (Widget child, Animation<double> animation) {
                return ScaleTransition(
                  scale: animation,
                  child: child,
                );
              },
              child: Text(
                "${widget.likesCount}",
                key: ValueKey(widget.likesCount),
                style: widget.countTextStyle ??
                    TextStyle(
                      fontSize: widget.size * 0.7,
                      color: widget.unlikedColor,
                      fontWeight: FontWeight.w500,
                    ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  List<Widget> _buildConfettiParticles() {
    return List.generate(_particleCount, (index) {
      final particle = _confettiParticles[index];
      final progress = _particleController.value;
      final opacity = 1.0 - progress;

      return Positioned(
        left: particle.distance * progress * math.cos(particle.angle),
        top: particle.distance * progress * math.sin(particle.angle),
        child: Opacity(
          opacity: opacity,
          child: Container(
            width: particle.size,
            height: particle.size,
            decoration: BoxDecoration(
              color: particle.color,
              shape: BoxShape.circle,
            ),
          ),
        ),
      );
    });
  }
}

// Helper class for a single confetti particle's path
class _ConfettiParticle {
  final double angle;
  final double distance;
  final Color color;
  final double size;

  _ConfettiParticle({
    required this.angle,
    required this.distance,
    required this.color,
    required this.size,
  });
}
