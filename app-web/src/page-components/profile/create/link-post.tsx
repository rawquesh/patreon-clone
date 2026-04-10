"use client";
import {
  Flex,
  Input,
  Separator,
  Stack,
  Text,
  Textarea,
  Box,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import CreateCollection from "./create-collection";
import Tags from "./tags";
import Attachments from "./attachments";
import LinkInput from "./link-input";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import api from "@/lib/api";
import { ApiEndpoints } from "@/lib/backend-services/api_endpoints";
import { useRouter, useParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";

interface Membership {
  _id: string;
  name: string;
  monthlyRate: number;
}

interface LinkPostProps {
  postId?: string;
  mode?: "create" | "edit";
}

const CreateLinkPost: React.FC<LinkPostProps> = ({
  postId,
  mode = "create",
}) => {
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
          setLinkUrl(data.linkUrl || "");
          setDescription(data.description || "");
          setTags(data.tags || []);
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
    if (!linkUrl.trim()) {
      toaster.create({
        title: "Error",
        description: "Link URL is required",
        type: "error",
        duration: 3000,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("linkUrl", linkUrl.trim());

      if (description.trim()) {
        formData.append("description", description.trim());
      }

      if (collectionId) {
        formData.append("collections", JSON.stringify([collectionId]));
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

      let response;
      if (isEditMode) {
        response = await api.put(ApiEndpoints.postLinkUpdate(currentPostId), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toaster.create({
          title: "Success",
          description: "Link post updated successfully",
          type: "success",
          duration: 3000,
        });
      } else {
        response = await api.post(ApiEndpoints.postsLink, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toaster.create({
          title: "Success",
          description: "Link post created successfully",
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
      console.error("Upload error:", error);
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create link post",
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
      <Stack p={"16px"} pt={12} w={"100vw"} maxW={"984px"} mx={"auto"} gap={8}>
        <Text fontSize={"2xl"} fontWeight={600}>
          {isEditMode ? "Edit link post" : "Create link post"}
        </Text>
      </Stack>
    );
  }

  return (
    <Stack p={"16px"} pt={12} w={"100vw"} maxW={"984px"} mx={"auto"} gap={8}>
      <Text fontSize={"2xl"} fontWeight={600}>
        {isEditMode ? "Edit link post" : "Create link post"}
      </Text>
      <Flex gap={6}>
        <Stack flexGrow={1}>
          <LinkInput onUrlChange={setLinkUrl} initialUrl={linkUrl || ""} />
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
          <Flex gap={4} justifyContent={"end"}>
            {mode === "create" && (
              <Button
                mt={6}
                onClick={() => handleSubmit(true)}
                loading={isSubmitting}
                disabled={!title.trim() || !linkUrl.trim() || isSubmitting}
                variant={"outline"}
                className="glass-card"
              >
                Save as draft
              </Button>
            )}
            <Button
              mt={6}
              onClick={() => handleSubmit()}
              loading={isSubmitting}
              disabled={!title.trim() || !linkUrl.trim() || isSubmitting}
              className="btn-gradient"
            >
              {isEditMode ? "Update" : "Save"}
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

export default CreateLinkPost;
