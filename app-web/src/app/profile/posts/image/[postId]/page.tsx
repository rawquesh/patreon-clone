import CreateImagePost from "@/page-components/profile/create/image-post";
import React from "react";

type tParams = Promise<{ slug: string }>;

const CreateTextPost = async (props: { params: tParams }) => {
	const { slug } = await props.params;
	return <CreateImagePost mode="edit" postId={slug} />;
};

export default CreateTextPost;
