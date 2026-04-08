import AuthCallback from "@/page-components/auth/callback";
import React, { Suspense } from "react";

const CallbackPage: React.FC = () => {
	return (
		<Suspense>
			<AuthCallback />
		</Suspense>
	);
};

export default CallbackPage;
