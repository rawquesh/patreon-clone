import 'package:flutter/material.dart';
import 'package:patreon_clone/utils/extensions.dart';
import 'package:patreon_clone/utils/my_safe_state.dart';
import 'package:patreon_clone/pages/components/widgets/spacer.dart';
import 'package:loading_animation_widget/loading_animation_widget.dart';

import 'package:patreon_clone/constants/constants.dart';

class SplashScreen extends StatefulWidget {
  static const String routeName = "/SplashScreen";

  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with MySafeState {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    themeData = Theme.of(context);

    return Container(
      color: themeData.colorScheme.onPrimary,
      child: Scaffold(
        backgroundColor: themeData.colorScheme.onPrimary,
        body: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 30),
          child: Column(
            children: [
              space36v,
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(8),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: SizedBox.square(
                      dimension: context.sizeData.width * 0.7,
                      child: Image(
                        // image: AssetImage(AppAssets.splashLogo3),
                        image: const AssetImage(AppAssets.patreon_cloneLogo),
                        width: 120,
                        height: 120,
                        loadingBuilder: (BuildContext context, Widget child, ImageChunkEvent? loadingProgress) {
                          if (loadingProgress == null) {
                            return child;
                          }
                          return Center(
                            child: CircularProgressIndicator(
                              value: loadingProgress.expectedTotalBytes != null
                                  ? loadingProgress.cumulativeBytesLoaded / loadingProgress.expectedTotalBytes!
                                  : null,
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ),
              Center(
                child: LoadingAnimationWidget.inkDrop(color: themeData.primaryColor, size: 40),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
