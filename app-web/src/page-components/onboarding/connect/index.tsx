import { Stack, Text } from "@chakra-ui/react";
import ConnectListItem from "./ConnectListItem";
import { Button } from "@/components/ui/button";

const connectListItems = [
	{ icon: "mingcute:youtube-fill", title: "Youtube" },
	{ icon: "mdi:instagram", title: "Instagram" },
	{ icon: "prime:twitter", title: "Twitter" },
	{ icon: "ic:baseline-facebook", title: "Facebook" },
	{ icon: "ri:twitch-fill", title: "Twitch" },
	{ icon: "ic:baseline-tiktok", title: "Tiktok" },
];

export default function Connect() {
	return (
		<Stack>
			<Text fontSize={"2xl"} fontWeight={"bold"} as={"h1"}>
				Help your fans find you faster
			</Text>
			<Text fontSize={"sm"}>
				Connect your socials so your page appears in search, and help your fans
				to find you faster on Patreon.
			</Text>
			<Stack mt={8}>
				{connectListItems.map((item) => (
					<ConnectListItem key={item.icon} {...item} />
				))}
				<Button mt={9} h={"42px"} borderColor={"black"} w={"100%"}>
					Continue
				</Button>
				<Button h={"42px"} variant={"ghost"} w={"100%"}>
					Skip for now
				</Button>
			</Stack>
		</Stack>
	);
}
