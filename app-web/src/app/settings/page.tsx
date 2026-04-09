"use client";
import { useEffect, useState } from "react";
import {
  Fieldset,
  Input,
  Box,
  Flex,
  Skeleton,
  Heading,
  Text,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import {
  NativeSelectField,
  NativeSelectRoot,
} from "@/components/ui/native-select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth.provider";
import { countries } from "countries-list";
import { toaster } from "@/components/ui/toaster";

enum GenderPreference {
  MALE = "male",
  FEMALE = "female",
  BOTH = "both",
}

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name cannot exceed 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  countryOfResidence: z.string().min(1, "Please select a country"),
  gender: z.string().optional(),
  genderPreference: z.nativeEnum(GenderPreference).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const countryOptions = Object.entries(countries)
  .map(([code, country]) => ({
    label: country.name,
    value: code,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default function ProfileForm() {
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { user, isLoadingUser, updateProfile, updateProfilePhoto } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      const displayName =
        user.firstName || user.lastName
          ? `${user.firstName || ""} ${user.lastName || ""}`
          : "";

      setValue("displayName", displayName);
      setValue("email", user.email);
      setValue("countryOfResidence", user.countryOfResidence || "");
      setValue("gender", user.gender || "");
      setValue(
        "genderPreference",
        user.genderPreference || GenderPreference.BOTH
      );
      setPhotoUrl(user.profilePicture || "");
    }
  }, [user, setValue]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("photo", selectedFile);
        await updateProfilePhoto.mutateAsync(formData);
      }

      await updateProfile.mutateAsync({
        displayName: data.displayName,
        email: data.email,
        countryOfResidence: data.countryOfResidence,
        gender: data.gender,
        genderPreference: data.genderPreference,
      });

      toaster.create({
        title: "Success",
        description: "Profile updated successfully",
        type: "success",
        duration: 3000,
      });

      setFormError("");
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      setFormError("Error updating profile. Please try again.");
      toaster.create({
        title: "Error",
        description: "Failed to update profile",
        type: "error",
        duration: 3000,
      });
    }
  };

  const isInvalid = Object.keys(errors).length > 0;

  return (
    <Box
      maxW="container.md"
      mx="auto"
      py={8}
      px={4}
      className="animate-fade-in-up"
    >
      <Box className="glass-card" p={8} borderRadius="20px">
        <Heading
          fontSize="2xl"
          fontWeight="bold"
          mb={6}
          css={{
            background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Profile information
        </Heading>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Fieldset.Root size="lg" invalid={isInvalid}>
            <Fieldset.Content>
              <Field>
                <Flex
                  alignItems={"center"}
                  position="relative"
                  width="fit-content"
                  gap={4}
                >
                  {isLoadingUser ? (
                    <Skeleton h={"44px"} w={"44px"} borderRadius={"999px"} />
                  ) : (
                    <Avatar
                      size="lg"
                      src={photoUrl}
                      name={photoUrl ? undefined : "G"}
                      css={{
                        background: "var(--gradient-primary)",
                        color: "white",
                      }}
                    />
                  )}
                  <Button
                    size="sm"
                    className="btn-gradient"
                    onClick={() =>
                      document.getElementById("photo-upload")?.click()
                    }
                    disabled={isLoadingUser}
                  >
                    Upload photo
                  </Button>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    display="none"
                    onChange={handlePhotoUpload}
                  />
                </Flex>
              </Field>

              <Field label="Display name" invalid={!!errors.displayName}>
                <Input
                  {...register("displayName")}
                  placeholder="Enter your display name"
                  className="glass-input"
                  css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}
                />
                <Fieldset.ErrorText>
                  {errors.displayName?.message}
                </Fieldset.ErrorText>
              </Field>

              <Field label="Email" invalid={!!errors.email}>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="Enter your email"
                  disabled
                  className="glass-input"
                  css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 500 }}
                />
                <Fieldset.ErrorText>{errors.email?.message}</Fieldset.ErrorText>
              </Field>

              <Field label="Country of Residence" invalid={!!errors.countryOfResidence}>
                <NativeSelectRoot>
                  <NativeSelectField
                    {...register("countryOfResidence")}
                    placeholder="Please select a country..."
                    items={countryOptions}
                    className="glass-input"
                    css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}
                  />
                </NativeSelectRoot>
                <Fieldset.ErrorText>
                  {errors.countryOfResidence?.message}
                </Fieldset.ErrorText>
              </Field>
              <Field label="Gender" invalid={!!errors.gender}>
                <NativeSelectRoot>
                  <NativeSelectField
                    {...register("gender")}
                    placeholder="Select gender..."
                    items={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Other", value: "other" },
                    ]}
                    className="glass-input"
                    css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}
                  />
                </NativeSelectRoot>
                <Fieldset.ErrorText>{errors.gender?.message}</Fieldset.ErrorText>
              </Field>

              <Field label="Content Gender Preference" invalid={!!errors.genderPreference}>
                <NativeSelectRoot>
                  <NativeSelectField
                    {...register("genderPreference")}
                    placeholder="Select gender preference..."
                    items={[
                      {
                        label: "Show Both Male and Female",
                        value: GenderPreference.BOTH,
                      },
                      { label: "Show Male Only", value: GenderPreference.MALE },
                      {
                        label: "Show Female Only",
                        value: GenderPreference.FEMALE,
                      },
                    ]}
                    className="glass-input"
                    css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}
                  />
                </NativeSelectRoot>
                <Fieldset.ErrorText>
                  {errors.genderPreference?.message}
                </Fieldset.ErrorText>
              </Field>

              <Button
                type="submit"
                className="btn-gradient"
                loading={isSubmitting}
                mt={4}
                w={"fit"}
                css={{ fontWeight: 600 }}
              >
                Save Changes
              </Button>
            </Fieldset.Content>

            {formError && <Fieldset.ErrorText>{formError}</Fieldset.ErrorText>}
          </Fieldset.Root>
        </form>
      </Box>
    </Box>
  );
}
