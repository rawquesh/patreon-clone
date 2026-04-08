import CreateLinkPost from "@/page-components/profile/create/link-post";
import React from "react";

type tParams = Promise<{ slug: string }>;

const CreateTextPost = async (props: { params: tParams }) => {
	const { slug } = await props.params;
	return <CreateLinkPost mode="edit" postId={slug} />;
};

export default CreateTextPost;
