import { Button } from "@/components/ui/button";
import React from "react";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogRoot,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

const CreateMembershipModal: React.FC = () => {
	return (
		<DialogRoot>
			<DialogTrigger w={"fit"}>
				<Button as="div" mt={6} w={"fit"}>
					Get Started
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>New Tier</DialogTitle>
					<DialogCloseTrigger />
				</DialogHeader>
				<DialogBody>adas</DialogBody>
			</DialogContent>
		</DialogRoot>
	);
};

export default CreateMembershipModal;
