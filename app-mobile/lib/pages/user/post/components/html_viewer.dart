import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:patreon-clone/models/post/data_model/post_model.dart';
import 'package:patreon-clone/utils/my_print.dart';
import 'package:url_launcher/url_launcher.dart';

class MyHTMLViewer extends StatefulWidget {
  final PostModel post;
  final bool isSmall;

  const MyHTMLViewer({super.key, required this.post, this.isSmall = true});

  @override
  State<MyHTMLViewer> createState() => _MyHTMLViewerState();
}

class _MyHTMLViewerState extends State<MyHTMLViewer> {
  bool _isExpanded = false;
  static const double _collapsedHeight = 80.0;

  void _toggleExpanded() {
    setState(() {
      _isExpanded = !_isExpanded;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (widget.post.textContent.isEmpty && widget.post.description.isEmpty) {
      return const SizedBox.shrink();
    }

    final htmlContent = _buildHtmlWidget(context);
    final htmlData = widget.post.textContent.isNotEmpty ? widget.post.textContent : widget.post.description;

    final bool isPotentiallyLong = htmlData.length > 250;

    if (!widget.isSmall || !isPotentiallyLong) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
        child: htmlContent,
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AnimatedSize(
            duration: const Duration(milliseconds: 300),
            curve: Curves.fastOutSlowIn,
            alignment: Alignment.topCenter,
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: _isExpanded ? double.infinity : _collapsedHeight,
              ),
              child: ShaderMask(
                shaderCallback: (rect) {
                  if (_isExpanded) {
                    return const LinearGradient(
                      colors: [Colors.black, Colors.black],
                    ).createShader(rect);
                  }
                  return LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black,
                      Colors.black.withOpacity(0.0),
                    ],
                    stops: const [0.7, 1.0],
                  ).createShader(rect);
                },
                blendMode: BlendMode.dstIn,
                child: ClipRect(
                  child: htmlContent,
                ),
              ),
            ),
          ),
          // const SizedBox(height: 8),
          GestureDetector(
            onTap: _toggleExpanded,
            child: Text(
              _isExpanded ? "Read Less" : "Read More",
              style: TextStyle(
                color: Colors.grey.shade800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHtmlWidget(BuildContext context) {
    var themeData = Theme.of(context);

    var data = widget.post.textContent.isNotEmpty ? widget.post.textContent : widget.post.description;

    // if data is plan text, wrap it in <p> tags and convert new lines to <br> tags, and wrap link with <a> tags
    if (!data.contains(RegExp(r'<[^>]+>'))) {
      data = data.split('\n').map((line) {
        final trimmedLine = line.trim();
        // Detect URLs anywhere in the line and wrap them with <a> tags
        final urlRegex = RegExp(r'(https?:\/\/[^\s]+)');
        return trimmedLine.replaceAllMapped(urlRegex, (match) {
          final url = match.group(0)!;
          return '<a href="$url" target="_blank" rel="noopener noreferrer">$url</a>';
        });
      }).join('<br>');
      data = '<p>$data</p>';
    }

    return Html(
      data: data,
      onLinkTap: (url, attributes, element) async {
        if (url != null) {
          if (url.isNotEmpty) {
            try {
              final Uri uri = Uri.parse(url);
              if (!await launchUrl(uri, mode: LaunchMode.inAppBrowserView)) {
                throw Exception('Could not launch $uri');
              }
            } catch (e) {
              MyPrint.printOnConsole('Error launching URL: $e');
            }
          }
        }
      },
      style: {
        "*": Style(
          margin: Margins.zero,
          padding: HtmlPaddings.zero,
          lineHeight: LineHeight.em(1.4),
        ),
        "body": Style(
          fontSize: FontSize(15),
          fontFamily: 'Epilogue',
          color: themeData.textTheme.bodyMedium?.color,
        ),
        "strong": Style(
          fontWeight: FontWeight.bold,
        ),
        "h1": Style(
          fontSize: FontSize(17),
          fontWeight: FontWeight.bold,
        ),
        "br": Style(
          lineHeight: const LineHeight(0.01),
        ),
        // add styles for link if needed
        "a": Style(
          color: themeData.primaryColor,
          textDecoration: TextDecoration.underline,
        ),
      },
    );
  }
}
