"use client";
import React from "react";
import {
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
} from "@/components/ui/dialog";
import {
	CheckboxGroup,
	Flex,
	IconButton,
	Separator,
	Stack,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import { Icon } from "@iconify/react/dist/iconify.js";
import { CheckboxCard } from "@/components/ui/checkbox-card";
import { Radio, RadioGroup } from "@/components/ui/radio";
import { Button } from "@/components/ui/button";

const postTypes: {
	icon: string;
	text: string;
}[] = [
	{
		icon: "stash:podcast",
		text: "Podcast episodes",
	},
	{
		icon: "ic:round-headphones",
		text: "Audio",
	},
	{
		icon: "material-symbols:image",
		text: "Image",
	},
	{
		icon: "line-md:link",
		text: "Link",
	},
	{
		icon: "fluent:poll-horizontal-24-filled",
		text: "Poll",
	},
	{
		icon: "entypo:text",
		text: "Text",
	},
	{
		icon: "mingcute:video-fill",
		text: "Video",
	},
];

const FilterModal: React.FC = () => {
	const { open, onOpen, onClose } = useDisclosure();

	return (
		<DialogRoot
			motionPreset={"slide-in-bottom"}
			placement={"center"}
			open={open}
		>
			<ButtonWithIcon variant={"ghost"} onClick={onOpen} icon="ion:filter">
				Filter
			</ButtonWithIcon>
			<DialogContent className="glass-dialog-content">
				<DialogHeader
					alignItems={"center"}
					display={"flex"}
					justifyContent={"space-between"}
				>
					<Text fontSize={"xl"} fontWeight={600} flex={1} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
						Filter Posts
					</Text>
					<IconButton rounded="999px" variant={"ghost"} onClick={onClose}>
						<Icon icon={"ic:round-close"} />
					</IconButton>
				</DialogHeader>
				<Separator mb={2} />
				<DialogBody>
					<Stack>
						<Text fontWeight={600} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>Post type</Text>
					</Stack>
					<CheckboxGroup
						css={{
							'& label[data-state="checked"]': {
								background: "var(--gradient-primary)",
								color: "white",
							},
						}}
					>
						<Flex mt={2} gap={3} justifyContent={"stretch"} flexWrap={"wrap"}>
							{postTypes.map((i) => (
								<CheckboxCard
									h={"40px"}
									css={{
										"& span": {
											display: "block",
											w: "max",
										},
									}}
									cursor={"pointer"}
									display={"flex"}
									justifyContent={"center"}
									borderRadius={"8px"}
									alignItems={"center"}
									key={i.icon}
									label={i.text}
									// description="dec"
									indicator={null}
									icon={<Icon icon={i.icon} width={"18px"} />}
								/>
							))}
						</Flex>
					</CheckboxGroup>
					<Text mt={5} fontWeight={600} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
						Who can see this post
					</Text>
					<RadioGroup mt={3}>
						<Stack
							css={{
								"& label": {
									cursor: "pointer",
									fontWeight: 400,
								},
							}}
							gap={2}
						>
							<Radio value="public">Public</Radio>
							<Radio value="all-members">All members</Radio>
							<Radio value="paid-members-only">Paid members only</Radio>
							<Radio value="free-members-only">Free members only</Radio>
						</Stack>
					</RadioGroup>
				</DialogBody>
				<Separator mb={2} />
				<DialogFooter justifyContent={"space-between"}>
					<Button variant={"outline"} className="glass-card">Clear all</Button>
					<Button className="btn-gradient">Apply</Button>
				</DialogFooter>
			</DialogContent>
		</DialogRoot>
	);
};

export default FilterModal;
