"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingPageFooter } from "../marketing-page-footer";
import { branding } from "@/config/branding";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const SupportPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    const accessKey = branding.services.web3FormsAccessKey;

    if (!accessKey) {
      setSubmitStatus({
        type: "error",
        message:
          "Form is not configured. Please set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY in your environment variables.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Support Request from ${branding.name}`,
          from_name: `${formData.firstName} ${formData.lastName}`,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message: "Thank you for contacting us! We'll get back to you soon.",
        });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: result.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Support form submission error:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to send message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box css={{ background: "var(--app-bg)" }}>
      <MarketingHeader />

      <Box
        as="section"
        pt={{ base: "5rem", md: "8rem" }}
        pb={20}
        className="page-header"
      >
        <Box maxW="3xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
          <Box maxW="2xl" mx="auto" className="animate-fade-in-up">
            <Heading
              as="h1"
              fontSize="4xl"
              fontWeight="bold"
              textAlign="center"
              mb="4"
              css={{
                background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Contact Support
            </Heading>
            <Text
              css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
              fontSize="lg"
              mb="8"
              textAlign="center"
              maxW="xl"
              mx="auto"
            >
              Have a question or need help? Fill out the form below and
              we&apos;ll get back to you as soon as possible.
            </Text>

            <Box className="glass-card" p={8} borderRadius="20px">
              <form onSubmit={handleSubmit}>
                <VStack gap={6} align="stretch">
                  <Box
                    display="grid"
                    gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={4}
                  >
                    <Field.Root>
                      <Field.Label
                        fontSize="sm"
                        fontWeight="600"
                        css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                      >
                        First Name
                      </Field.Label>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="glass-input"
                        required
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label
                        fontSize="sm"
                        fontWeight="600"
                        css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                      >
                        Last Name
                      </Field.Label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="glass-input"
                        required
                      />
                    </Field.Root>
                  </Box>

                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="600" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                      Email Address
                    </Field.Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      className="glass-input"
                      required
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="600" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                      Phone Number
                    </Field.Label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="glass-input"
                      required
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="600" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                      Message
                    </Field.Label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      className="glass-input"
                      required
                      resize="vertical"
                    />
                  </Field.Root>

                  {submitStatus.type && (
                    <Box
                      p={4}
                      borderRadius="12px"
                      css={{
                        background: submitStatus.type === "success"
                          ? "linear-gradient(135deg, hsl(160, 60%, 45% / 0.1), hsl(160, 60%, 45% / 0.05))"
                          : "linear-gradient(135deg, hsl(0, 78%, 52% / 0.1), hsl(0, 78%, 52% / 0.05))",
                        border: `1px solid ${submitStatus.type === "success" ? "hsl(160, 60%, 45% / 0.2)" : "hsl(0, 78%, 52% / 0.2)"}`,
                      }}
                    >
                      <Text fontSize="sm" fontWeight="500" css={{ color: submitStatus.type === "success" ? "hsl(160, 60%, 45%)" : "hsl(0, 78%, 52%)" }}>
                        {submitStatus.message}
                      </Text>
                    </Box>
                  )}

                  <Button
                    type="submit"
                    w="full"
                    size="lg"
                    className="btn-gradient"
                    loading={isSubmitting}
                    loadingText="Sending..."
                    disabled={isSubmitting}
                    css={{ fontWeight: 600 }}
                  >
                    Send Message
                  </Button>
                </VStack>
              </form>
            </Box>

            <Box mt={8} textAlign="center">
              <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} fontSize="sm">
                You can also reach us directly at{" "}
                <Text as="span" fontWeight="600" css={{ color: "hsl(211, 71%, 43%)" }}>
                  {branding.contact.supportEmail}
                </Text>
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      <MarketingPageFooter />
    </Box>
  );
};

export default SupportPage;
