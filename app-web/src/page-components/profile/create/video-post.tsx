"use client";
import {
  Flex,
  Input,
  Separator,
  Stack,
  Text,
  Box,
  Textarea,
  Tabs,
  Progress,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import CreateCollection from "./create-collection";
import Tags from "./tags";
import YouTubePlayer from "./youtube-input";
import VideoUpload from "./video-upload";
import Attachments from "./attachments";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import api from "@/lib/api";
import { ApiEndpoints } from "@/lib/backend-services/api_endpoints";
import { useRouter, useParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { uploadVideoToS3 } from "@/lib/s3-video-upload";
import { ApiEndpoints } from "@/lib/backend-services/api_endpoints";

interface Membership {
  _id: string;
  name: string;
  monthlyRate: number;
}

interface VideoPostProps {
  postId?: string;
  mode?: "create" | "edit";
}

const CreateVideoPost: React.FC<VideoPostProps> = ({
  postId,
  mode = "create",
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [videoMethod, setVideoMethod] = useState<"url" | "upload">("url");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const router = useRouter();
  const params = useParams();
  const currentPostId = postId || (params?.postId as string);
  const isEditMode = mode === "edit" || !!currentPostId;

  const { data: memberships } = useQuery({
    queryKey: ["memberships-post"],
    queryFn: async () => {
      const { data } = await api.get<{ memberships: Membership[] }>(
        "/memberships/creator"
      );
      return data.memberships || [];
    },
  });

  useEffect(() => {
    if (isEditMode && currentPostId) {
      const fetchPostData = async () => {
        setIsLoading(true);
        try {
          const { data } = await api.get(ApiEndpoints.post(currentPostId));
          setTitle(data.title || "");
          const url = data.videoUrl || "";
          setVideoUrl(url);
          setExistingVideoUrl(url);
          setDescription(data.description || "");
          setTags(data.tags || []);
          // Determine if it's a YouTube URL or uploaded video
          if (url) {
            const isYouTubeUrl = /(youtube\.com|youtu\.be)/.test(url);
            setVideoMethod(isYouTubeUrl ? "url" : "upload");
          }
          if (data.collections?.length) {
            setCollectionId(data.collections[0]);
          }
          if (data.attachments?.length) {
            setExistingAttachments(data.attachments);
          }
          if (data.tierAccess) {
            const tiers = data.tierAccess.map((t: { id: string }) => t.id);
            setSelectedTiers(tiers);
          }
        } catch (error: any) {
          console.log(error);
          toaster.create({
            title: "Error",
            description: "Failed to load post data",
            type: "error",
            duration: 3000,
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchPostData();
    }
  }, [currentPostId, isEditMode]);

  const handleSubmit = async (isDraft?: boolean) => {
    if (!title.trim()) {
      toaster.create({
        title: "Error",
        description: "Title is required",
        type: "error",
        duration: 3000,
      });
      return;
    }
    // Validate that either videoUrl or videoFile is provided
    if (videoMethod === "url" && !videoUrl.trim()) {
      toaster.create({
        title: "Error",
        description: "Video URL is required",
        type: "error",
        duration: 3000,
      });
      return;
    }
    if (videoMethod === "upload" && !videoFile && !existingVideoUrl) {
      toaster.create({
        title: "Error",
        description: "Please upload a video file",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(null);
    setIsUploading(false);

    try {
      let finalVideoUrl = "";

      // If uploading a new video file, upload to S3 first
      if (videoMethod === "upload" && videoFile) {
        setIsUploading(true);
        setUploadProgress(0);

        try {
          finalVideoUrl = await uploadVideoToS3(videoFile, (progress) => {
            setUploadProgress(progress.percentage);
          });
          setIsUploading(false);
          setUploadProgress(null);
        } catch (uploadError: any) {
          setIsUploading(false);
          setUploadProgress(null);
          toaster.create({
            title: "Upload Error",
            description:
              uploadError.message ||
              "Failed to upload video. Please try again.",
            type: "error",
            duration: 5000,
          });
          setIsSubmitting(false);
          return;
        }
      } else if (videoMethod === "url") {
        // Use YouTube URL
        finalVideoUrl = videoUrl.trim();
      } else if (videoMethod === "upload" && existingVideoUrl) {
        // Use existing video URL (edit mode)
        finalVideoUrl = existingVideoUrl;
      }

      // Create form data for post creation
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("videoUrl", finalVideoUrl);
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (collectionId) {
        formData.append("collections", JSON.stringify(collectionId));
      }
      if (tags.length > 0) {
        formData.append("tags", JSON.stringify(tags));
      }
      if (isDraft) {
        formData.append("isDraft", JSON.stringify(true));
      }
      if (selectedTiers.length > 0) {
        formData.append("tierAccess", JSON.stringify(selectedTiers));
      }

      attachmentFiles.forEach((file) => {
        formData.append("attachments", file);
      });
      if (existingAttachments.length > 0) {
        formData.append(
          "existingAttachments",
          JSON.stringify(existingAttachments.map((att) => att.id || att._id))
        );
      }

      // Create or update the post
      let response;
      if (isEditMode) {
        response = await api.put(ApiEndpoints.postVideoUpdate(currentPostId), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toaster.create({
          title: "Success",
          description: "Video post updated successfully",
          type: "success",
          duration: 3000,
        });
      } else {
        response = await api.post(ApiEndpoints.postsVideo, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toaster.create({
          title: "Success",
          description: "Video post created successfully",
          type: "success",
          duration: 3000,
        });
      }

      if (isDraft) {
        router.push("/profile/library/drafts");
      } else {
        router.push(`/post/${response.data.id || currentPostId}`);
      }
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} video post`,
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveExistingAttachment = (attachmentId: string) => {
    setExistingAttachments((prev) =>
      prev.filter((att) => (att.id || att._id) !== attachmentId)
    );
  };

  if (isLoading) {
    return (
      <Stack p={"16px"} pt={12} w={"100vw"} maxW={"1150px"} mx={"auto"} gap={8}>
        <Text fontSize={"2xl"} fontWeight={600}>
          {isEditMode ? "Edit video post" : "Create video post"}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack p={"16px"} pt={12} w={"100vw"} maxW={"1150px"} mx={"auto"} gap={8}>
      <Text fontSize={"2xl"} fontWeight={600}>
        {isEditMode ? "Edit video post" : "Create video post"}
      </Text>
      <Flex gap={6}>
        <Stack flexGrow={1}>
          <Box>
            <Tabs.Root
              value={videoMethod}
              onValueChange={(e) => {
                const value = e.value as "url" | "upload";
                setVideoMethod(value);
                // Clear the other method's data when switching tabs
                if (value === "url") {
                  // Switching to URL tab - clear uploaded file
                  setVideoFile(null);
                  // Restore YouTube URL from existingVideoUrl if in edit mode
                  if (
                    isEditMode &&
                    existingVideoUrl &&
                    /(youtube\.com|youtu\.be)/.test(existingVideoUrl)
                  ) {
                    setVideoUrl(existingVideoUrl);
                  }
                } else {
                  // Switching to upload tab - clear YouTube URL input
                  // Note: In edit mode, existingVideoUrl preserves the original video
                  setVideoUrl("");
                }
              }}
            >
              <Tabs.List
                mb={4}
                className="glass-card-static"
                borderRadius="12px"
                p={1}
                gap={1}
                css={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Tabs.Trigger
                  value="url"
                  borderRadius="10px"
                  px={5}
                  py={2}
                  fontSize="sm"
                  fontWeight={500}
                  css={{
                    color: "hsl(215.4, 16.3%, 46.9%)",
                    transition: "all 0.15s ease",
                    "&[data-state=active]": {
                      background: "var(--gradient-primary)",
                      color: "white",
                      fontWeight: 600,
                      boxShadow: "0 2px 8px hsl(211, 71%, 43% / 0.3)",
                    },
                    "&:hover:not([data-state=active])": {
                      color: "hsl(222.2, 47.4%, 11.2%)",
                      background: "rgba(255,255,255,0.6)",
                    },
                  }}
                >
                  Video URL
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="upload"
                  borderRadius="10px"
                  px={5}
                  py={2}
                  fontSize="sm"
                  fontWeight={500}
                  css={{
                    color: "hsl(215.4, 16.3%, 46.9%)",
                    transition: "all 0.15s ease",
                    "&[data-state=active]": {
                      background: "var(--gradient-primary)",
                      color: "white",
                      fontWeight: 600,
                      boxShadow: "0 2px 8px hsl(211, 71%, 43% / 0.3)",
                    },
                    "&:hover:not([data-state=active])": {
                      color: "hsl(222.2, 47.4%, 11.2%)",
                      background: "rgba(255,255,255,0.6)",
                    },
                  }}
                >
                  Upload Video
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="url">
                <YouTubePlayer
                  defaultUrl={videoUrl}
                  onUrlChange={(url) => setVideoUrl(url)}
                />
              </Tabs.Content>
              <Tabs.Content value="upload">
                <VideoUpload
                  onVideoFileSelect={(file) => {
                    setVideoFile(file);
                    // Clear existingVideoUrl when a new file is uploaded or when removed
                    if (!file && existingVideoUrl) {
                      setExistingVideoUrl(null);
                    }
                  }}
                  existingVideoUrl={existingVideoUrl}
                />
              </Tabs.Content>
            </Tabs.Root>
          </Box>
          <Input
            fontSize={"34px"}
            _placeholder={{ fontSize: "34px" }}
            placeholder="Add a title"
            variant={"flushed"}
            border={"none"}
            outline={"none"}
            ring={"none"}
            boxShadow={"none"}
            mt={6}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            variant={"flushed"}
            border={"none"}
            outline={"none"}
            ring={"none"}
            boxShadow={"none"}
            fontSize={"18px"}
            _placeholder={{ fontSize: "18px" }}
            py={"20px"}
            placeholder="Go on type something"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Separator my={6} />
          <Box>
            <Text mb={4} fontWeight={600}>
              Who can access this post?
            </Text>
            <Stack pl={4} mb={4}>
              <Checkbox
                checked={selectedTiers.length === 0}
                onCheckedChange={(e) => {
                  if (e.checked) {
                    setSelectedTiers([]);
                  }
                }}
              >
                Everyone (Public)
              </Checkbox>
              {memberships?.map((tier) => (
                <Checkbox
                  key={tier._id}
                  checked={selectedTiers.includes(tier._id)}
                  onCheckedChange={(e) => {
                    if (e.checked) {
                      setSelectedTiers([...selectedTiers, tier._id]);
                    } else {
                      setSelectedTiers(
                        selectedTiers.filter((id) => id !== tier._id)
                      );
                    }
                  }}
                >
                  {tier.name} (${tier.monthlyRate}/month)
                </Checkbox>
              ))}
            </Stack>
          </Box>
          <Attachments
            onFilesChange={setAttachmentFiles}
            existingAttachments={existingAttachments}
            onRemoveExistingAttachment={handleRemoveExistingAttachment}
          />
          {isUploading && uploadProgress !== null && (
            <Box mt={4} p={4} className="glass-card" borderRadius="12px">
              <Stack gap={2}>
                <Text fontSize="sm" fontWeight={600} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                  Uploading video to S3...
                </Text>
                <Progress.Root value={uploadProgress}>
                  <Progress.Track css={{ background: "hsl(210, 30%, 88%)" }}>
                    <Progress.Range
                      css={{ background: "var(--gradient-primary)", width: `${uploadProgress}%`, transition: "width 0.3s ease" }}
                    />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} textAlign="center">
                  {uploadProgress}% uploaded
                </Text>
              </Stack>
            </Box>
          )}
          <Flex gap={4} justifyContent={"end"}>
            {mode === "create" && (
              <Button
                mt={6}
                onClick={() => handleSubmit(true)}
                loading={isSubmitting || isUploading}
                disabled={
                  !title.trim() ||
                  (videoMethod === "url" && !videoUrl.trim()) ||
                  (videoMethod === "upload" &&
                    !videoFile &&
                    !existingVideoUrl) ||
                  isSubmitting ||
                  isUploading
                }
                variant={"outline"}
              className="glass-card"
              >
                Save as draft
              </Button>
            )}
            <Button
              mt={6}
              onClick={() => handleSubmit()}
              loading={isSubmitting || isUploading}
              disabled={
                !title.trim() ||
                (videoMethod === "url" && !videoUrl.trim()) ||
                (videoMethod === "upload" && !videoFile && !existingVideoUrl) ||
                isSubmitting ||
                isUploading
              }
            className="btn-gradient"
            >
              {isUploading
                ? `Uploading... ${uploadProgress || 0}%`
                : isEditMode
                ? "Update"
                : "Save"}
            </Button>
          </Flex>
        </Stack>
        <Stack gap={6}>
          <CreateCollection
            onCreateCollection={(id: string) => {
              setCollectionId(id);
            }}
            initialCollectionId={collectionId || undefined}
          />
          <Tags onTagsChange={setTags} initialTags={tags} />
        </Stack>
      </Flex>
    </Stack>
  );
};

export default CreateVideoPost;
