"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Field,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingPageFooter } from "../marketing-page-footer";

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

    // Get access key from environment variable or use a placeholder
    // Users need to get their access key from https://web3forms.com/
    const accessKey =
      process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ||
      "8575bd15-9365-47f3-aeb0-b4eb8c3734ab";

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
          subject: "Support Request from Patreon Clone",
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
        // Reset form
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
      console.log(error);
      setSubmitStatus({
        type: "error",
        message: "Failed to send message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box color="#5A5954" bg="white">
      <MarketingHeader />

      <Box as="section" bg="white" pt={{ base: "5rem", md: "8rem" }} pb={20}>
        <Container maxW="3xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Box maxW="2xl" mx="auto">
            <Heading
              as="h1"
              fontSize="4xl"
              fontWeight="bold"
              color="#141413"
              mb="4"
              textAlign="center"
            >
              Contact Support
            </Heading>
            <Text
              color="#5A5954"
              fontSize="lg"
              mb="8"
              textAlign="center"
              maxW="xl"
              mx="auto"
            >
              Have a question or need help? Fill out the form below and
              we&apos;ll get back to you as soon as possible.
            </Text>

            <Box
              bg="white"
              boxShadow="md"
              borderRadius="12px"
              p={8}
              border="1px"
              borderColor="#E6E5DD"
            >
              <form onSubmit={handleSubmit}>
                <VStack gap={6} align="stretch">
                  {/* First Name and Last Name in a row */}
                  <Box
                    display="grid"
                    gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={4}
                  >
                    <Field.Root>
                      <Field.Label
                        fontSize="sm"
                        fontWeight="600"
                        color="#141413"
                      >
                        First Name
                      </Field.Label>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        bg="gray.50"
                        required
                        _focus={{
                          bg: "white",
                          borderColor: "#1D70BF",
                        }}
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label
                        fontSize="sm"
                        fontWeight="600"
                        color="#141413"
                      >
                        Last Name
                      </Field.Label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        bg="gray.50"
                        required
                        _focus={{
                          bg: "white",
                          borderColor: "#1D70BF",
                        }}
                      />
                    </Field.Root>
                  </Box>

                  {/* Email */}
                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="600" color="#141413">
                      Email Address
                    </Field.Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                      bg="gray.50"
                      required
                      _focus={{
                        bg: "white",
                        borderColor: "#1D70BF",
                      }}
                    />
                  </Field.Root>

                  {/* Phone Number */}
                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="600" color="#141413">
                      Phone Number
                    </Field.Label>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      bg="gray.50"
                      required
                      _focus={{
                        bg: "white",
                        borderColor: "#1D70BF",
                      }}
                    />
                  </Field.Root>

                  {/* Message */}
                  <Field.Root>
                    <Field.Label fontSize="sm" fontWeight="600" color="#141413">
                      Message
                    </Field.Label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      bg="gray.50"
                      required
                      resize="vertical"
                      _focus={{
                        bg: "white",
                        borderColor: "#1D70BF",
                      }}
                    />
                  </Field.Root>

                  {/* Status Message */}
                  {submitStatus.type && (
                    <Box
                      p={4}
                      borderRadius="md"
                      bg={
                        submitStatus.type === "success" ? "#B8E5BE" : "#FED7D7"
                      }
                      color={
                        submitStatus.type === "success" ? "#618967" : "#C53030"
                      }
                    >
                      <Text fontSize="sm" fontWeight="500">
                        {submitStatus.message}
                      </Text>
                    </Box>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    w="full"
                    size="lg"
                    bg="#1D70BF"
                    color="white"
                    _hover={{ bg: "#3283d1" }}
                    loading={isSubmitting}
                    loadingText="Sending..."
                    disabled={isSubmitting}
                  >
                    Send Message
                  </Button>
                </VStack>
              </form>
            </Box>

            {/* Additional Contact Info */}
            <Box mt={8} textAlign="center">
              <Text color="#5A5954" fontSize="sm">
                You can also reach us directly at{" "}
                <Text as="span" fontWeight="600" color="#1D70BF">
                  support@patreon-clone.example.com
                </Text>
              </Text>
            </Box>
          </Box>
        </Container>
      </Box>

      <MarketingPageFooter />
    </Box>
  );
};

export default SupportPage;
