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
		<Stack gap={6}>
			<Text
				fontSize={"2xl"}
				fontWeight={"bold"}
				as={"h1"}
				css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
			>
				Help your fans find you faster
			</Text>
			<Text fontSize={"sm"} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
				Connect your socials so your page appears in search, and help your fans
				to find you faster on the platform.
			</Text>
			<Stack mt={8} gap={2}>
				{connectListItems.map((item) => (
					<ConnectListItem key={item.icon} {...item} />
				))}
				<Button
					mt={9}
					h={"42px"}
					className="btn-gradient"
					w={"100%"}
					css={{ fontWeight: 600 }}
				>
					Continue
				</Button>
				<Button
					h={"42px"}
					variant={"ghost"}
					w={"100%"}
					className="glass-card"
					css={{
						color: "hsl(215.4, 16.3%, 46.9%)",
						borderColor: "var(--glass-border)",
					}}
				>
					Skip for now
				</Button>
			</Stack>
		</Stack>
	);
}
