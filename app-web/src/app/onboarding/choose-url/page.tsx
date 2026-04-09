import { Box } from "@chakra-ui/react";
import ChooseUrl from "@/page-components/onboarding/choose-url";

export default function Page() {
	return (
		<Box className="animate-fade-in-up">
			<ChooseUrl />
		</Box>
	);
}
