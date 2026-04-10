"use client";
import {
  Flex,
  Input,
  Separator,
  Stack,
  Text,
  Skeleton,
  Box,
} from "@chakra-ui/react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import CreateCollection from "./create-collection";
import Attachments from "./attachments";
import Tags from "./tags";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import api from "@/lib/api";
import { ApiEndpoints } from "@/lib/backend-services/api_endpoints";
import { useRouter, useParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { Editor } from "primereact/editor";
import { ApiEndpoints } from "@/lib/backend-services/api_endpoints";

// import { RichTextEditor } from "./editor";
// import { RichTextBlock } from "./slate-editor";

async function compressDataUrl(
  dataUrl: string,
  options: { maxDimension?: number; quality?: number; mimeType?: string } = {}
): Promise<string> {
  const {
    maxDimension = 1280,
    quality = 0.75,
    mimeType = "image/jpeg",
  } = options;
  if (!dataUrl.startsWith("data:image")) return dataUrl;

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });

  const width = image.width;
  const height = image.height;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  // Return a data URL with compression
  return canvas.toDataURL(mimeType, quality);
}

async function optimizeEditorImages(html: string): Promise<string> {
  // DOM-based approach to avoid regex over large base64 strings
  const container = document.createElement("div");
  container.innerHTML = html;
  const images = Array.from(
    container.querySelectorAll<HTMLImageElement>('img[src^="data:image"]')
  );
  if (images.length === 0) return html;

  for (const img of images) {
    const original = img.getAttribute("src") || "";
    try {
      const compressed = await compressDataUrl(original);
      if (compressed && compressed.length < original.length) {
        img.setAttribute("src", compressed);
      }
    } catch {
      // ignore single image failure
    }
  }
  return container.innerHTML;
}

interface Membership {
  _id: string;
  name: string;
  monthlyRate: number;
}

interface TextPostFormProps {
  postId?: string;
  mode?: "create" | "edit";
}

const TextPostForm: React.FC<TextPostFormProps> = ({
  postId,
  mode = "create",
}) => {
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [isOptimizingEditorImages, setIsOptimizingEditorImages] =
    useState(false);
  const lastOptimizedRef = React.useRef<string | null>(null);
  const ignoreNextOnChangeRef = React.useRef<boolean>(false);
  const router = useRouter();
  const params = useParams();

  const currentPostId = useMemo(
    () => postId || (params?.postId as string),
    [postId, params]
  );
  const isEditMode = useMemo(
    () => mode === "edit" || !!currentPostId,
    [mode, currentPostId]
  );

  const { data: memberships, isLoading: membershipsLoading } = useQuery({
    queryKey: ["memberships-post"],
    queryFn: async () => {
      const { data } = await api.get<{ memberships: Membership[] }>(
        "/memberships/creator"
      );
      return data.memberships || [];
    },
  });

  useEffect(() => {
    let isMounted = true;

    if (isEditMode && currentPostId) {
      const fetchPostData = async () => {
        setIsLoading(true);
        try {
          const { data } = await api.get(ApiEndpoints.post(currentPostId));

          if (isMounted) {
            setTitle(data.title || "");
            setTextContent(data.textContent || "");
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
          }
        } catch (error: any) {
          console.log(error);
          if (isMounted) {
            toaster.create({
              title: "Error",
              description: "Failed to load post data",
              type: "error",
              duration: 3000,
            });
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      fetchPostData();
    }

    return () => {
      isMounted = false;
    };
  }, [currentPostId, isEditMode]);

  const handleSubmit = useCallback(
    async (isDraft?: boolean) => {
      if (!title.trim()) {
        toaster.create({
          title: "Error",
          description: "Title is required",
          type: "error",
          duration: 3000,
        });
        return;
      }
      if (!textContent.trim()) {
        toaster.create({
          title: "Error",
          description: "Text content is required",
          type: "error",
          duration: 3000,
        });
        return;
      }
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("textContent", textContent.trim());

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
          response = await api.put(ApiEndpoints.postTextUpdate(currentPostId), formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          toaster.create({
            title: "Success",
            description: "Post updated successfully",
            type: "success",
            duration: 3000,
          });
        } else {
          response = await api.post(ApiEndpoints.postsText, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          toaster.create({
            title: "Success",
            description: "Post created successfully",
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
            `Failed to ${isEditMode ? "update" : "create"} post`,
          type: "error",
          duration: 3000,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      title,
      textContent,
      collectionId,
      tags,
      selectedTiers,
      attachmentFiles,
      existingAttachments,
      isEditMode,
      currentPostId,
      router,
    ]
  );

  const handleAttachmentsChange = useCallback((files: File[]) => {
    setAttachmentFiles(files);
  }, []);

  const handleRemoveExistingAttachment = useCallback((attachmentId: string) => {
    setExistingAttachments((prev) =>
      prev.filter((att) => (att.id || att._id) !== attachmentId)
    );
  }, []);

  const handleCreateCollection = useCallback((id: string) => {
    setCollectionId(id);
  }, []);

  const handleTagsChange = useCallback((newTags: string[]) => {
    setTags(newTags);
  }, []);

  const handleTierChange = useCallback((tierId: string, isChecked: boolean) => {
    setSelectedTiers((prev) => {
      if (isChecked) {
        return [...prev, tierId];
      } else {
        return prev.filter((id) => id !== tierId);
      }
    });
  }, []);

  const handlePublicAccessChange = useCallback((isChecked: boolean) => {
    if (isChecked) {
      setSelectedTiers([]);
    }
  }, []);

  // const handleEditorChange = useCallback((html: string) => {
  //   setTextContent(html);
  // }, []);

  if (isLoading) {
    return (
      <Stack p={"16px"} pt={12} w={"100vw"} maxW={"1150px"} mx={"auto"} gap={8}>
        <Skeleton height="40px" width="300px" />
        <Flex gap={6} direction={{ base: "column", lg: "row" }}>
          <Stack flexGrow={1}>
            <Skeleton height="60px" />
            <Skeleton height="200px" mt={4} />
          </Stack>
          <Stack gap={6} width={{ base: "100%", lg: "224px" }}>
            <Skeleton height="150px" />
            <Skeleton height="150px" />
          </Stack>
        </Flex>
      </Stack>
    );
  }

  return (
    <Stack p={"16px"} pt={12} w={"100vw"} maxW={"1150px"} mx={"auto"} gap={8}>
      <Text fontSize={"2xl"} fontWeight={600}>
        {isEditMode ? "Edit text post" : "Create text post"}
      </Text>
      <Flex gap={6} direction={{ base: "column", lg: "row" }}>
        <Stack flexGrow={1}>
          <Input
            fontSize={"34px"}
            _placeholder={{ fontSize: "34px" }}
            placeholder="Add a title"
            variant={"flushed"}
            border={"none"}
            outline={"none"}
            ring={"none"}
            boxShadow={"none"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Editor
            value={textContent}
            className="editor-content"
            onTextChange={async (e) => {
              const incoming = e.htmlValue || "";

              if (ignoreNextOnChangeRef.current) {
                ignoreNextOnChangeRef.current = false;
                setTextContent(incoming);
                return;
              }

              setTextContent(incoming);

              if (
                incoming &&
                incoming.includes("data:image") &&
                !isOptimizingEditorImages &&
                incoming !== lastOptimizedRef.current
              ) {
                setIsOptimizingEditorImages(true);
                try {
                  const optimized = await optimizeEditorImages(incoming);
                  lastOptimizedRef.current = optimized;
                  if (optimized !== incoming) {
                    // Prevent handling the next editor change triggered by this set
                    ignoreNextOnChangeRef.current = true;
                    setTextContent(optimized);
                  }
                } finally {
                  setIsOptimizingEditorImages(false);
                }
              }
            }}
            style={{
              height: "320px",
              background: "white",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
            }}
            placeholder="Tell your members what you're working on"
          />

          {/* <Textarea
            variant={"flushed"}
            border={"none"}
            outline={"none"}
            ring={"none"}
            boxShadow={"none"}
            fontSize={"18px"}
            _placeholder={{ fontSize: "18px" }}
            py={"20px"}
            placeholder="Tell your members what you're working on"
            rows={8}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          /> */}
          <Separator my={6} />
          <Box>
            <Text mb={4} fontWeight={600}>
              Who can access this post?
            </Text>
            <Stack pl={4} mb={4}>
              <Checkbox
                checked={selectedTiers.length === 0}
                onCheckedChange={(e) => handlePublicAccessChange(!!e.checked)}
              >
                Everyone (Public)
              </Checkbox>
              {!membershipsLoading &&
                (memberships || []).map((tier) => (
                  <Checkbox
                    key={tier._id}
                    checked={selectedTiers.includes(tier._id)}
                    onCheckedChange={(e) => {
                      handleTierChange(tier._id, !!e.checked);
                    }}
                  >
                    {tier.name} (${tier.monthlyRate}/month)
                  </Checkbox>
                ))}
            </Stack>
          </Box>
          <Attachments
            onFilesChange={handleAttachmentsChange}
            existingAttachments={existingAttachments}
            onRemoveExistingAttachment={handleRemoveExistingAttachment}
          />
          <Flex gap={4} justifyContent={"end"}>
            {mode === "create" && (
              <Button
                mt={6}
                onClick={() => handleSubmit(true)}
                loading={isSubmitting}
                disabled={!title.trim() || !textContent.trim() || isSubmitting}
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
              disabled={!title?.trim() || !textContent?.trim() || isSubmitting}
              className="btn-gradient"
            >
              {isEditMode ? "Update" : "Save"}
            </Button>
          </Flex>
        </Stack>
        <Stack gap={6}>
          <CreateCollection
            onCreateCollection={handleCreateCollection}
            initialCollectionId={collectionId || undefined}
          />
          <Tags onTagsChange={handleTagsChange} initialTags={tags} />
        </Stack>
      </Flex>
    </Stack>
  );
};

export default TextPostForm;
