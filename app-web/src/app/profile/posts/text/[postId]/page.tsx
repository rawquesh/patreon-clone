import CreateTextPostPage from "@/page-components/profile/create/text-post";
import React from "react";

type tParams = Promise<{ slug: string }>;

const CreateTextPost = async (props: { params: tParams }) => {
	const { slug } = await props.params;
	return <CreateTextPostPage mode="edit" postId={slug} />;
};

export default CreateTextPost;
