"use client";
import { Avatar } from "@/components/ui/avatar";
import { getTimeAgo } from "@/utils/getTimeAgo";
import {
	Box,
	Flex,
	IconButton,
	Image,
	Input,
	Separator,
	Stack,
	Strong,
	Text,
} from "@chakra-ui/react";
import React from "react";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react/dist/iconify.js";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";

interface Props {
	username: string;
	userAvatar: string;
	postTitle: string;
	activity: "liked" | "commented";
	postImage: string;
	timeStamp: string;
	comment?: string;
}

const Notification: React.FC<Props> = ({
	activity,
	postImage,
	postTitle,
	timeStamp,
	userAvatar,
	username,
	comment,
}) => {
	const [liked, setLiked] = React.useState(false);
	const [reply, setReply] = React.useState("");
	const [input, setInput] = React.useState("");
	return (
		<DialogRoot>
			<DialogTrigger textAlign={"start"} cursor={"pointer"}>
				<Flex
					my={2}
					gap={4}
					bg={"white"}
					borderRadius={"12px"}
					px={"24px"}
					py={"16px"}
					justifyContent={"start"}
					_hover={{
						bg: "star.100",
					}}
				>
					<Avatar src={userAvatar} />
					<Stack>
						<Text fontSize={"sm"}>
							<Strong>{username}</Strong> {activity} your post: {postTitle}
						</Text>
						<Text textAlign={"start"} fontSize={"xs"}>
							{getTimeAgo(timeStamp)}
						</Text>
					</Stack>

					<Box ml={"auto"}>
						<Image
							h={"50px"}
							alt="thumbnail"
							borderRadius={"8px"}
							src={postImage}
						/>
					</Box>
				</Flex>
			</DialogTrigger>
			{activity === "commented" && (
				<DialogContent>
					<DialogHeader>
						<Stack>
							<Text fontSize={"xl"} fontWeight={600}>
								New comment
							</Text>
							<Text fontSize={"sm"}>{postTitle}</Text>
						</Stack>
						<DialogCloseTrigger />
					</DialogHeader>
					<Separator />
					<DialogBody minH={"300px"}>
						<Flex alignItems={"start"} mt={6} gap={4}>
							<Avatar src={userAvatar} />
							<Stack flexGrow={1} gap={0}>
								<Text fontSize={"sm"}>
									<Strong>{username}</Strong>
								</Text>
								<Text fontSize={"xs"}>{comment}</Text>
								<IconButton
									onClick={() => setLiked(!liked)}
									variant={"plain"}
									p={0}
									display={"block"}
									color={liked ? "red.500" : "gray.500"}
								>
									<Icon icon={"mynaui:heart-solid"} />
								</IconButton>
							</Stack>
							<Text ml={"auto"} fontSize={"xs"}>
								{getTimeAgo(timeStamp)}
							</Text>
						</Flex>
						{reply ? (
							<InputGroup pl={"48px"} w={"100%"}>
								<Input variant={"subtle"} disabled value={reply} />
							</InputGroup>
						) : (
							<InputGroup
								pl={"48px"}
								w={"100%"}
								endElement={
									<Button
										onClick={() => {
											setReply(input);
											setInput("");
										}}
										variant={"plain"}
									>
										Reply
									</Button>
								}
							>
								<Input
									placeholder="Reply to the comment"
									w={"100%"}
									variant={"subtle"}
									value={input}
									onChange={(e) => setInput(e.target.value)}
								/>
							</InputGroup>
						)}
					</DialogBody>
					<Separator />
					<DialogFooter justifyContent={"center"}>
						<Button>Go to the post</Button>
					</DialogFooter>
				</DialogContent>
			)}
		</DialogRoot>
	);
};

export default Notification;
