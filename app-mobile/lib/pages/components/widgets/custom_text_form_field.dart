import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CustomTextFormField extends StatelessWidget {
  final TextEditingController controller;
  final String? hinttext;
  final String? labeltext;
  final FormFieldValidator<String>? validator;
  final TextInputType? keyboardType;
  final bool obscureText;
  final Widget? suffixIcon;
  final Widget? prefixIcon;
  final List<TextInputFormatter>? inputFormatters;
  final Function(String)? onFieldSubmitted;
  final bool filled;
  final bool isUnderLine;
  final Color borderColor;
  final TextStyle? labelStyle;
  final TextStyle? style;
  final Color? fillColor;
  final bool? enabled;
  final EdgeInsetsGeometry? contentPadding;
  final bool? readOnly;
  final double borderRadius;

  final TextStyle? hintStyle;
  final ValueChanged<String>? onChanged;

  const CustomTextFormField({
    super.key,
    required this.controller,
    this.hinttext,
    this.keyboardType,
    this.labeltext,
    this.validator,
    this.obscureText = false,
    this.suffixIcon,
    this.prefixIcon,
    this.inputFormatters,
    this.onFieldSubmitted,
    this.filled = false,
    this.isUnderLine = false,
    this.borderColor = Colors.white,
    this.labelStyle,
    this.contentPadding,
    this.style,
    this.fillColor,
    this.enabled,
    this.hintStyle,
    this.readOnly,
    this.onChanged,
    this.borderRadius = 10.0,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      readOnly: readOnly ?? false,
      onChanged: onChanged,
      inputFormatters: inputFormatters,
      style: style ??
          const TextStyle(
            fontWeight: FontWeight.w400,
            fontSize: 14,
            color: Colors.white,
          ),
      obscureText: obscureText,
      controller: controller,
      enabled: enabled,
      onFieldSubmitted: onFieldSubmitted,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      decoration: InputDecoration(
          contentPadding: contentPadding,
          hintText: hinttext,
          hintStyle: hintStyle ??
              const TextStyle(
                fontWeight: FontWeight.w400,
                fontSize: 14,
                color: Colors.white,
              ),
          labelText: labeltext,
          suffixIcon: suffixIcon,
          prefixIcon: prefixIcon,
          filled: filled,
          fillColor: fillColor ?? const Color(0xff181818),
          labelStyle: labelStyle ??
              const TextStyle(
                fontWeight: FontWeight.w400,
                fontSize: 14,
                color: Colors.white,
              ),
          enabledBorder: isUnderLine
              ? const UnderlineInputBorder(borderSide: BorderSide(color: Colors.black))
              : OutlineInputBorder(
                  borderRadius: BorderRadius.circular(borderRadius),
                  borderSide: BorderSide(
                    color: borderColor,
                    width: 0.5,
                  ),
                ),
          border: isUnderLine
              ? const UnderlineInputBorder(borderSide: BorderSide(color: Colors.black))
              : OutlineInputBorder(
                  borderRadius: BorderRadius.circular(borderRadius),
                  borderSide: BorderSide(
                    color: borderColor,
                    width: 0.5,
                  ),
                ),
          focusedBorder: isUnderLine
              ? const UnderlineInputBorder(borderSide: BorderSide(color: Colors.black))
              : OutlineInputBorder(
                  borderRadius: BorderRadius.circular(borderRadius),
                  borderSide: BorderSide(
                    color: borderColor,
                    width: 0.5,
                  ))),
      validator: validator,
      keyboardType: keyboardType,
    );
  }
}
