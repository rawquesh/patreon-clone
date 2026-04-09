import { Box, Heading, Text, List, Container } from "@chakra-ui/react";
import React from "react";
import { branding } from "@/config/branding";

const PrivacyPolicyPage: React.FC = () => {
	return (
		<Container maxW="800px" py={12}>
			<Box>
				<Heading as="h1" size="xl" mb={6}>
					Patreon Clone Privacy Policy
				</Heading>
				<Text mb={4} fontStyle="italic">
					Effective Date: March 1, 2025
				</Text>
				<Text mb={6}>
					{
						'Patreon Clone ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy describes how we collect, use, and share your personal information when you use our website, applications, and services (collectively, the "Services"). By using Patreon Clone, you agree to the terms of this Privacy Policy. If you do not agree with this policy, please discontinue use of our Services.'
					}
				</Text>
				<Text mb={6}>
					We may update this Privacy Policy from time to time. If we make
					significant changes, we will notify you by updating the date at the
					top of this page and, if necessary, through additional notifications.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					1. Information We Collect
				</Heading>
				<Text mb={4}>
					We collect different types of information depending on how you
					interact with Patreon Clone.
				</Text>

				<Heading as="h3" size="md" mt={6} mb={3}>
					A. Information You Provide Directly
				</Heading>
				<Text mb={3}>You may provide personal information to us when you:</Text>
				<List.Root mb={4} gap={1}>
					<List.Item>Create an account</List.Item>
					<List.Item>Join or interact with communities</List.Item>
					<List.Item>Subscribe to or support a creator</List.Item>
					<List.Item>Post, comment, or send messages</List.Item>
					<List.Item>Contact customer support</List.Item>
					<List.Item>Participate in surveys or promotions</List.Item>
				</List.Root>

				<Text mb={3}>This information may include:</Text>
				<List.Root gap={2} mb={4}>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Account Information:
						</Text>{" "}
						Your name, email address, username, password, and profile details.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Payment Information:
						</Text>{" "}
						If you subscribe or make purchases, our third-party payment
						processors (e.g., Stripe, PayPal) handle your payment data. Patreon Clone
						does not store your full payment details.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Profile Information:
						</Text>{" "}
						Any information you voluntarily add to your profile, such as a bio,
						profile picture, location, or social media links.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Content and Communications:
						</Text>{" "}
						Any posts, comments, or messages you create on the platform.
					</List.Item>
				</List.Root>

				<Heading as="h3" size="md" mt={6} mb={3}>
					B. Information We Collect Automatically
				</Heading>
				<Text mb={3}>
					When you use Patreon Clone, we automatically collect certain information,
					including:
				</Text>
				<List.Root gap={2} mb={4}>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Device and Usage Information:
						</Text>{" "}
						Your IP address, browser type, device type, operating system, and
						usage details such as page views, clicks, and time spent on the
						platform.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Cookies and Tracking Technologies:
						</Text>{" "}
						We use cookies and similar technologies to remember your
						preferences, improve user experience, and analyze website traffic.
						You can manage cookie preferences through your browser settings.
					</List.Item>
				</List.Root>

				<Heading as="h3" size="md" mt={6} mb={3}>
					C. Information from Third Parties
				</Heading>
				<Text mb={3}>
					If you connect Patreon Clone with third-party services (e.g., social media
					accounts), we may receive information from those platforms, including:
				</Text>
				<List.Root gap={1} mb={4}>
					<List.Item>Your public profile details</List.Item>
					<List.Item>Your username and account ID</List.Item>
					<List.Item>Engagement data (e.g., likes, follows)</List.Item>
				</List.Root>
				<Text mb={6}>
					We encourage you to review the privacy policies of any third-party
					services you link to Patreon Clone.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					2. How We Use Your Information
				</Heading>
				<Text mb={3}>We use your information for the following purposes:</Text>
				<List.Root gap={2} mb={4}>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Account Management:
						</Text>{" "}
						Creating and managing your Patreon Clone account.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Community Engagement:
						</Text>{" "}
						Enabling you to participate in discussions, support creators, and
						engage with content.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Security & Fraud Prevention:
						</Text>{" "}
						Protecting against fraudulent activities and ensuring platform
						security.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Personalization:
						</Text>{" "}
						Customizing your experience, including content recommendations.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Communication:
						</Text>{" "}
						Sending you notifications, updates, and customer support messages.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Legal Compliance:
						</Text>{" "}
						Complying with applicable laws, responding to legal requests, and
						enforcing our terms.
					</List.Item>
				</List.Root>
				<Text mb={6} fontWeight="bold">
					We do not sell your personal information to third parties.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					3. Information Sharing & Disclosure
				</Heading>
				<Text mb={4}>
					We share your information only in the following circumstances:
				</Text>

				<Heading as="h3" size="md" mt={6} mb={3}>
					A. With Other Users
				</Heading>
				<Text mb={4}>
					Certain profile details, such as your username and profile picture,
					are visible to others on Patreon Clone. Your posts and comments are public
					within the communities you engage with.
				</Text>

				<Heading as="h3" size="md" mt={6} mb={3}>
					B. With Third-Party Service Providers
				</Heading>
				<Text mb={3}>We work with service providers to assist with:</Text>
				<List.Root gap={1} mb={4}>
					<List.Item>Payment processing (e.g., Stripe, PayPal)</List.Item>
					<List.Item>Cloud hosting and data storage</List.Item>
					<List.Item>Customer support services</List.Item>
					<List.Item>Analytics and marketing</List.Item>
				</List.Root>
				<Text mb={4}>
					These providers have access to personal data only as needed to perform
					their services and are contractually bound to protect it.
				</Text>

				<Heading as="h3" size="md" mt={6} mb={3}>
					C. For Legal Reasons
				</Heading>
				<Text mb={3}>
					We may disclose personal information if required by law or to:
				</Text>
				<List.Root gap={1} mb={4}>
					<List.Item>
						Comply with legal obligations (e.g., court orders, law enforcement
						requests)
					</List.Item>
					<List.Item>Enforce our terms of service</List.Item>
					<List.Item>
						Protect our rights, users, or the public from harm or illegal
						activities
					</List.Item>
				</List.Root>

				<Heading as="h3" size="md" mt={6} mb={3}>
					D. In Business Transfers
				</Heading>
				<Text mb={6}>
					If Patreon Clone undergoes a merger, acquisition, or sale of assets, your
					information may be transferred as part of that transaction. We will
					notify you if your information becomes subject to a different privacy
					policy.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					4. Your Privacy Choices
				</Heading>
				<Text mb={3}>You have control over your personal information:</Text>
				<List.Root gap={2} mb={6}>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Access & Update:
						</Text>{" "}
						You can view and edit your profile information at any time.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Delete Your Account:
						</Text>{" "}
						You may request to delete your account and associated data. Some
						data may be retained for legal compliance.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Opt-Out of Marketing:
						</Text>{" "}
						{
							'You can unsubscribe from promotional emails using the "unsubscribe" link in the email.'
						}
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Manage Cookies:
						</Text>{" "}
						You can disable cookies through your browser settings.
					</List.Item>
				</List.Root>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					5. Data Retention
				</Heading>
				<Text mb={6}>
					We retain your data for as long as necessary to provide our Services
					or as required by law. Deleted accounts and related data may be
					retained for a limited period for security, legal, or backup purposes.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					6. Security Measures
				</Heading>
				<Text mb={6}>
					We take appropriate technical and organizational measures to protect
					your personal information. However, no online service is completely
					secure, and we cannot guarantee absolute security.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					7. International Users
				</Heading>
				<Text mb={6}>
					If you access Patreon Clone from outside the United States, your information
					may be transferred and stored in the U.S. By using our Services, you
					consent to this transfer.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					8. Children&apos;s Privacy
				</Heading>
				<Text mb={6}>
					Patreon Clone is not intended for users under the age of 13. If we become
					aware that we have collected personal information from a child under
					13, we will take steps to delete that information.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					9. Your Rights (for Users in Certain Jurisdictions)
				</Heading>
				<Text mb={3}>
					Depending on your location, you may have additional rights regarding
					your data:
				</Text>
				<List.Root gap={2} mb={4}>
					<List.Item>
						<Text fontWeight="bold" as="span">
							California Residents (CCPA Rights):
						</Text>{" "}
						You may request to know what personal information we collect,
						request deletion of your data, and opt-out of certain data sharing.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							EU/UK Residents (GDPR Rights):
						</Text>{" "}
						You have the right to access, correct, delete, and restrict
						processing of your data. You may also withdraw consent for certain
						uses.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span">
							Other Jurisdictions:
						</Text>{" "}
						If applicable laws grant you additional rights, you may contact us
						to exercise them.
					</List.Item>
				</List.Root>
				<Text mb={6}>
					To make a request, email <b>{branding.contact.privacyEmail}</b>.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					10. Third-Party Links & Services
				</Heading>
				<Text mb={6}>
					Patreon Clone may contain links to third-party websites. We are not
					responsible for their privacy practices and encourage you to review
					their policies.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					11. Changes to This Privacy Policy
				</Heading>
				<Text mb={6}>
					We may update this Privacy Policy periodically. If significant changes
					are made, we will notify users via email or a platform notice.
					Continued use of Patreon Clone after updates constitutes acceptance of the
					new terms.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4}>
					12. Contact Us
				</Heading>
				<Text mb={2}>
					If you have questions about this Privacy Policy or your data rights,
					contact us at:
				</Text>
				<Text mb={1}>
					📧 <b>Email:</b> {branding.contact.privacyEmail}
				</Text>
				<Text mb={6}>
					📍 <b>Mailing Address:</b> 123 Community Way, San Francisco, CA 94105
				</Text>
			</Box>
		</Container>
	);
};

export default PrivacyPolicyPage;
