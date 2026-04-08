import CreateAudioPost from "@/page-components/profile/create/audio-post";
import React from "react";

type tParams = Promise<{ slug: string }>;

const CreateTextPost = async (props: { params: tParams }) => {
	const { slug } = await props.params;
	return <CreateAudioPost mode="edit" postId={slug} />;
};

export default CreateTextPost;
