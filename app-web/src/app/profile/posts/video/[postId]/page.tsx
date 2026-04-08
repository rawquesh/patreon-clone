import CreateVideoPost from "@/page-components/profile/create/video-post";
import React from "react";

type tParams = Promise<{ slug: string }>;

const CreateTextPost = async (props: { params: tParams }) => {
	const { slug } = await props.params;
	return <CreateVideoPost mode="edit" postId={slug} />;
};

export default CreateTextPost;
