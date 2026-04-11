import { Box } from "@chakra-ui/react";
import { Suspense } from "react";
import ChooseUrl from "@/page-components/onboarding/choose-url";

export default function Page() {
	return (
		<Box className="animate-fade-in-up">
			<Suspense>
				<ChooseUrl />
			</Suspense>
		</Box>
	);
}
