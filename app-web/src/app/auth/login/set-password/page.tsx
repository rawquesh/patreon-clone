import CompleteAccountPage from "@/page-components/onboarding/complete-account-page";
import React, { Suspense } from "react";

const SetPassword: React.FC = () => {
	return (
		<Suspense>
			<CompleteAccountPage />
		</Suspense>
	);
};

export default SetPassword;
