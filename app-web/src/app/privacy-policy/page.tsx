import { Box, Heading, Text, List } from "@chakra-ui/react";
import React from "react";
import { branding } from "@/config/branding";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingPageFooter } from "../marketing-page-footer";

const PrivacyPolicyPage: React.FC = () => {
	return (
		<Box css={{ background: "var(--app-bg)" }}>
			<MarketingHeader />
			<Box
				pt={{ base: "5rem", md: "8rem" }}
				maxW="800px"
				mx="auto"
				py={12}
				px={{ base: 4, md: 6 }}
				className="animate-fade-in-up"
			>
			<Box
				className="glass-card"
				p={8}
				borderRadius="20px"
				css={{ marginBottom: "24px" }}
			>
				<Heading
					as="h1"
					size="xl"
					mb={6}
					css={{
						background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
						WebkitBackgroundClip: "text",
						WebkitTextFillColor: "transparent",
						backgroundClip: "text",
					}}
				>
					{branding.name} Privacy Policy
				</Heading>
				<Text mb={4} fontStyle="italic" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					Effective Date: {branding.legal.effectiveDate}
				</Text>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					{branding.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy describes how we collect, use, and share your personal information when you use our website, applications, and services (collectively, the &ldquo;Services&rdquo;). By using {branding.name}, you agree to the terms of this Privacy Policy. If you do not agree with this policy, please discontinue use of our Services.
				</Text>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					We may update this Privacy Policy from time to time. If we make
					significant changes, we will notify you by updating the date at the
					top of this page and, if necessary, through additional notifications.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					1. Information We Collect
				</Heading>
				<Text mb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					We collect different types of information depending on how you
					interact with {branding.name}.
				</Text>

				<Heading as="h3" size="md" mt={6} mb={3} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					A. Information You Provide Directly
				</Heading>
				<Text mb={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					You may provide personal information to us when you:
				</Text>
				<List.Root mb={4} gap={1} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					<List.Item>Create an account</List.Item>
					<List.Item>Join or interact with communities</List.Item>
					<List.Item>Subscribe to or support a creator</List.Item>
					<List.Item>Post, comment, or send messages</List.Item>
					<List.Item>Contact customer support</List.Item>
					<List.Item>Participate in surveys or promotions</List.Item>
				</List.Root>

				<Text mb={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					This information may include:
				</Text>
				<List.Root gap={2} mb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Account Information:
						</Text>{" "}
						Your name, email address, username, password, and profile details.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Payment Information:
						</Text>{" "}
						If you subscribe or make purchases, our third-party payment
						processors (e.g., Stripe, PayPal) handle your payment data. {branding.name}
						does not store your full payment details.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Profile Information:
						</Text>{" "}
						Any information you voluntarily add to your profile, such as a bio,
						profile picture, location, or social media links.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Content and Communications:
						</Text>{" "}
						Any posts, comments, or messages you create on the platform.
					</List.Item>
				</List.Root>

				<Heading as="h3" size="md" mt={6} mb={3} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					B. Information We Collect Automatically
				</Heading>
				<Text mb={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					When you use {branding.name}, we automatically collect certain information,
					including:
				</Text>
				<List.Root gap={2} mb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Device and Usage Information:
						</Text>{" "}
						Your IP address, browser type, device type, operating system, and
						usage details such as page views, clicks, and time spent on the
						platform.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Cookies and Tracking Technologies:
						</Text>{" "}
						We use cookies and similar technologies to remember your
						preferences, improve user experience, and analyze website traffic.
						You can manage cookie preferences through your browser settings.
					</List.Item>
				</List.Root>

				<Heading as="h3" size="md" mt={6} mb={3} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					C. Information from Third Parties
				</Heading>
				<Text mb={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					If you connect {branding.name} with third-party services (e.g., social media
					accounts), we may receive information from those platforms, including:
				</Text>
				<List.Root gap={1} mb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					<List.Item>Your public profile details</List.Item>
					<List.Item>Your username and account ID</List.Item>
					<List.Item>Engagement data (e.g., likes, follows)</List.Item>
				</List.Root>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					We encourage you to review the privacy policies of any third-party
					services you link to {branding.name}.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					2. How We Use Your Information
				</Heading>
				<Text mb={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					We use your information for the following purposes:
				</Text>
				<List.Root gap={2} mb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Account Management:
						</Text>{" "}
						Creating and managing your {branding.name} account.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Community Engagement:
						</Text>{" "}
						Enabling you to participate in discussions, support creators, and
						engage with content.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Security & Fraud Prevention:
						</Text>{" "}
						Protecting against fraudulent activities and ensuring platform
						security.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Personalization:
						</Text>{" "}
						Customizing your experience, including content recommendations.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Communication:
						</Text>{" "}
						Sending you notifications, updates, and customer support messages.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Legal Compliance:
						</Text>{" "}
						Complying with applicable laws, responding to legal requests, and
						enforcing our terms.
					</List.Item>
				</List.Root>
				<Text mb={6} fontWeight="bold" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					We do not sell your personal information to third parties.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					3. Information Sharing & Disclosure
				</Heading>
				<Text mb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					We share your information only in the following circumstances:
				</Text>

				<Heading as="h3" size="md" mt={6} mb={3} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					A. With Other Users
				</Heading>
				<Text mb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					Certain profile details, such as your username and profile picture,
					are visible to others on {branding.name}. Your posts and comments are public
					within the communities you engage with.
				</Text>

				<Heading as="h3" size="md" mt={6} mb={3} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					B. With Third-Party Service Providers
				</Heading>
				<Text mb={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					We work with service providers to assist with:
				</Text>
				<List.Root gap={1} mb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					<List.Item>Payment processing (e.g., Stripe, PayPal)</List.Item>
					<List.Item>Cloud hosting and data storage</List.Item>
					<List.Item>Customer support services</List.Item>
					<List.Item>Analytics and marketing</List.Item>
				</List.Root>
				<Text mb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					These providers have access to personal data only as needed to perform
					their services and are contractually bound to protect it.
				</Text>

				<Heading as="h3" size="md" mt={6} mb={3} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					C. For Legal Reasons
				</Heading>
				<Text mb={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					We may disclose personal information if required by law or to:
				</Text>
				<List.Root gap={1} mb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
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

				<Heading as="h3" size="md" mt={6} mb={3} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					D. In Business Transfers
				</Heading>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					If {branding.name} undergoes a merger, acquisition, or sale of assets, your
					information may be transferred as part of that transaction. We will
					notify you if your information becomes subject to a different privacy
					policy.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					4. Your Privacy Choices
				</Heading>
				<Text mb={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					You have control over your personal information:
				</Text>
				<List.Root gap={2} mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Access & Update:
						</Text>{" "}
						You can view and edit your profile information at any time.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Delete Your Account:
						</Text>{" "}
						You may request to delete your account and associated data. Some
						data may be retained for legal compliance.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Opt-Out of Marketing:
						</Text>{" "}
						You can unsubscribe from promotional emails using the &ldquo;unsubscribe&rdquo; link in the email.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Manage Cookies:
						</Text>{" "}
						You can disable cookies through your browser settings.
					</List.Item>
				</List.Root>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					5. Data Retention
				</Heading>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					We retain your data for as long as necessary to provide our Services
					or as required by law. Deleted accounts and related data may be
					retained for a limited period for security, legal, or backup purposes.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					6. Security Measures
				</Heading>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					We take appropriate technical and organizational measures to protect
					your personal information. However, no online service is completely
					secure, and we cannot guarantee absolute security.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					7. International Users
				</Heading>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					If you access {branding.name} from outside the United States, your information
					may be transferred and stored in the U.S. By using our Services, you
					consent to this transfer.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					8. Children&apos;s Privacy
				</Heading>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					{branding.name} is not intended for users under the age of {branding.legal.minimumAge}. If we become
					aware that we have collected personal information from a child under
					{branding.legal.minimumAge}, we will take steps to delete that information.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					9. Your Rights (for Users in Certain Jurisdictions)
				</Heading>
				<Text mb={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					Depending on your location, you may have additional rights regarding
					your data:
				</Text>
				<List.Root gap={2} mb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							California Residents (CCPA Rights):
						</Text>{" "}
						You may request to know what personal information we collect,
						request deletion of your data, and opt-out of certain data sharing.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							EU/UK Residents (GDPR Rights):
						</Text>{" "}
						You have the right to access, correct, delete, and restrict
						processing of your data. You may also withdraw consent for certain
						uses.
					</List.Item>
					<List.Item>
						<Text fontWeight="bold" as="span" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Other Jurisdictions:
						</Text>{" "}
						If applicable laws grant you additional rights, you may contact us
						to exercise them.
					</List.Item>
				</List.Root>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					To make a request, email <b style={{ color: "hsl(211, 71%, 43%)" }}>{branding.contact.privacyEmail}</b>.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					10. Third-Party Links & Services
				</Heading>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					{branding.name} may contain links to third-party websites. We are not
					responsible for their privacy practices and encourage you to review
					their policies.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					11. Changes to This Privacy Policy
				</Heading>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					We may update this Privacy Policy periodically. If significant changes
					are made, we will notify users via email or a platform notice.
					Continued use of {branding.name} after updates constitutes acceptance of the
					new terms.
				</Text>

				<Heading as="h2" size="lg" mt={8} mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					12. Contact Us
				</Heading>
				<Text mb={2} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					If you have questions about this Privacy Policy or your data rights,
					contact us at:
				</Text>
				<Text mb={1} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					Email: <b style={{ color: "hsl(211, 71%, 43%)" }}>{branding.contact.privacyEmail}</b>
				</Text>
				<Text mb={6} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					Mailing Address: <b style={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{branding.contact.mailingAddress}</b>
				</Text>
			</Box>
		</Box>
			<MarketingPageFooter />
		</Box>
	);
};

export default PrivacyPolicyPage;
