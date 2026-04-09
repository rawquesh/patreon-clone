import { Box } from "@chakra-ui/react";
import PayoutPage from "@/page-components/profile/payout-page";
import React from "react";

const Payout: React.FC = () => {
	return (
		<Box className="animate-fade-in-up">
			<PayoutPage />
		</Box>
	);
};

export default Payout;
