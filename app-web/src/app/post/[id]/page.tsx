import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Box, Center, Text } from "@chakra-ui/react";
import TextPostPageComponent from "@/page-components/post/text-post-page";
import ImagePostPageComponent from "@/page-components/post/image-post-page";
import VideoPostPageComponent from "@/page-components/post/video-post-page";
import AudioPostPageComponent from "@/page-components/post/audio-post-page";
import LinkPostPageComponent from "@/page-components/post/link-post-page";
import { PostData } from "@/typings/IPost";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { PostPageHeader } from "@/page-components/post/post-page-header";
import { branding } from "@/config/branding";

type tParams = Promise<{ id: string }>;

export async function generateMetadata(
  props: { params: tParams }
): Promise<Metadata> {
  const { id } = await props.params;

  try {
    const post = await getPost(id);
    return {
      title: `${post.title} | ${post.creator.username}`,
      description:
        post.description ||
        post.textContent?.substring(0, 160) ||
        `A post by ${post.creator.username}`,
      openGraph: {
        title: post.title,
        description:
          post.description ||
          post.textContent?.substring(0, 160) ||
          `A post by ${post.creator.username}`,
        type: "article",
        authors: [post.creator.username],
        publishedTime: post.createdAt,
        images: post.mediaUrls?.[0] ? [post.mediaUrls[0]] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description:
          post.description ||
          post.textContent?.substring(0, 160) ||
          `A post by ${post.creator.username}`,
        images: post.mediaUrls?.[0] ? [post.mediaUrls[0]] : [],
      },
    };
  } catch (error) {
    console.log(error);
    return {
      title: `Post | ${branding.name}`,
      description: "View post content",
    };
  }
}

async function getPost(postId: string): Promise<PostData> {
  try {
    const baseUrl = `https://${branding.urls.apiServer}`;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log({ token });

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    let userID: string | undefined;
    if (token) {
      const decodedToken = jwtDecode(token);
      userID = decodedToken.sub as string;
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    console.log({ url: `${baseUrl}/posts/${postId}` });
    const response = await fetch(
      `${baseUrl}/posts/${postId}?userId=${userID}`,
      {
        headers,
        cache: "no-cache",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const post = await response.json();
    console.log("post", JSON.stringify(post, null, 2));
    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
}

export default async function PostPage(props: { params: tParams }) {
  const { id } = await props.params;
  try {
    const post = await getPost(id);
    console.log("In the component");
    console.log({ post });
    const PostContent = () => {
      switch (post.type.toLowerCase()) {
        case "text":
          return <TextPostPageComponent postId={id} postData={post} />;
        case "image":
          return <ImagePostPageComponent postId={id} postData={post} />;
        case "video":
          return <VideoPostPageComponent postId={id} postData={post} />;
        case "audio":
          return <AudioPostPageComponent postId={id} postData={post} />;
        case "link":
          return <LinkPostPageComponent postId={id} postData={post} />;
        default:
          return (
            <Center minH="100vh">
              <Text>Unsupported post type: {post.type}</Text>
            </Center>
          );
      }
    };

    return (
      <Box py={12} className="animate-fade-in-up">
        <PostPageHeader
          createdAt={post.createdAt}
          postId={post._id}
          title={post.title}
          displayName={post.creator.displayName}
          username={post.creator.username}
          profilePicture={post.creator.profilePicture}
        />
        <PostContent />
      </Box>
    );
  } catch (error) {
    console.log("NOT FOUND");
    console.log(error);
    return notFound();
  }
}
