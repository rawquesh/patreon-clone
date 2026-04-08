"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.provider";
import { Center, Flex, Text, Box, Button } from "@chakra-ui/react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface TierAccess {
	id: string;
	name: string;
	monthlyRate: number;
}

interface ClientAuthCheckProps {
	postId: string;
	tierAccess: TierAccess[];
	creatorUsername: string;
}

export default function ClientAuthCheck({
	postId,
	tierAccess,
	creatorUsername,
}: ClientAuthCheckProps) {
	const { user, isLoadingUser } = useAuth();
	const [isAccessible, setIsAccessible] = useState(true);
	const [isChecking, setIsChecking] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const checkAccess = async () => {
			if (isLoadingUser) return;

			if (!user) {
				if (tierAccess.length > 0) {
					setIsAccessible(false);
				}
				setIsChecking(false);
				return;
			}

			try {
				const { data } = await api.get(`/posts/${postId}/check-access`);
				setIsAccessible(data.isAccessible);
			} catch (error) {
				console.error("Error checking post access:", error);
				setIsAccessible(false);
			} finally {
				setIsChecking(false);
			}
		};

		checkAccess();
	}, [postId, user, isLoadingUser, tierAccess]);

	if (isChecking || isAccessible) {
		return null;
	}

	return (
		<Box
			position="fixed"
			top="0"
			left="0"
			right="0"
			bottom="0"
			bg="white"
			zIndex={999}
		>
			<Center minH="100vh">
				<Flex
					direction="column"
					align="center"
					maxW="md"
					p={6}
					textAlign="center"
				>
					<Text fontSize="xl" fontWeight="bold" mb={4}>
						This content is exclusive to members
					</Text>
					<Text mb={6}>
						This post is only available to members who subscribe to{" "}
						{tierAccess
							.map((tier) => `${tier.name} ($${tier.monthlyRate}/month)`)
							.join(" or ")}
					</Text>
					<Box>
						<Text fontWeight="semibold" mb={4}>
							Join {creatorUsername} to access this post and more exclusive
							content
						</Text>
						<Button
							colorScheme="blue"
							onClick={() => router.push(`/creator/${creatorUsername}`)}
						>
							View Membership Options
						</Button>
					</Box>
				</Flex>
			</Center>
		</Box>
	);
}
