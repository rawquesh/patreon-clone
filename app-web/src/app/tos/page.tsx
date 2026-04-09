import { Box, Heading, Text, List, Container } from "@chakra-ui/react";
import React from "react";
import { branding } from "@/config/branding";

const TermsOfServicePage: React.FC = () => {
  return (
    <Container maxW="800px" py={12}>
      <Box>
        <Heading as="h1" size="xl" mb={6}>
          Patreon Clone Terms of Service
        </Heading>
        <Text mb={4} fontStyle="italic">
          Effective Date: March 1, 2025
        </Text>
        <Text mb={6}>
          {
            'Welcome to Patreon Clone! Patreon Clone is a platform that empowers Jewish content creators to build, engage, and monetize their communities. By using Patreon Clone, you agree to these Terms of Service ("Terms"), which govern your access to and use of our platform, website, and related services ("Services").'
          }
        </Text>

        <Heading as="h2" size="lg" mt={8} mb={4}>
          1. Account Creation & Responsibilities
        </Heading>

        <Heading as="h3" size="md" mt={6} mb={3}>
          1.1 Eligibility:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            You must be at least 13 years old to create an account. If you are
            under 18, you may only use Patreon Clone with parental or guardian
            permission.
          </List.Item>
          <List.Item>
            If you create an account as a content creator, you must be at least
            18 years old.
          </List.Item>
        </List.Root>

        <Heading as="h3" size="md" mt={6} mb={3}>
          1.2 Account Security:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            You are responsible for maintaining the confidentiality of your
            account credentials.
          </List.Item>
          <List.Item>
            Notify us immediately if you suspect unauthorized use of your
            account.
          </List.Item>
        </List.Root>

        <Heading as="h3" size="md" mt={6} mb={3}>
          1.3 Account Termination:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            You may delete your account at any time through your settings.
          </List.Item>
          <List.Item>
            Patreon Clone reserves the right to suspend or terminate accounts that
            violate our policies or for other reasons deemed necessary.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mt={8} mb={4}>
          2. User Types & Access Levels
        </Heading>
        <Text mb={4}>Patreon Clone has three primary user types:</Text>
        <List.Root mb={4} gap={2}>
          <List.Item>
            <Text fontWeight="bold" as="span">
              Members:
            </Text>{" "}
            Users who follow and support creators by subscribing to their
            content.
          </List.Item>
          <List.Item>
            <Text fontWeight="bold" as="span">
              Creators:
            </Text>{" "}
            Users who share content and monetize their communities through
            subscriptions.
          </List.Item>
          <List.Item>
            <Text fontWeight="bold" as="span">
              Community Managers:
            </Text>{" "}
            Additional users designated by creators to help manage their
            communities.
          </List.Item>
        </List.Root>
        <Text mb={6}>
          Each user type has different access permissions. Members can
          subscribe, comment, and engage with content. Creators can upload
          content, set subscription tiers, and manage their communities.
          Community Managers share administrative privileges with creators but
          cannot remove the creator from their own account.
        </Text>

        <Heading as="h2" size="lg" mt={8} mb={4}>
          3. Subscriptions & Payments
        </Heading>

        <Heading as="h3" size="md" mt={6} mb={3}>
          3.1 Payments:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            Members pay for subscriptions on a monthly or annual basis.
          </List.Item>
          <List.Item>
            Patreon Clone facilitates payments via third-party processors like Stripe.
            By using our Services, you agree to their terms.
          </List.Item>
          <List.Item>Subscription payments are billed in advance.</List.Item>
        </List.Root>

        <Heading as="h3" size="md" mt={6} mb={3}>
          3.2 Platform Fees:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            Patreon Clone takes a percentage of creator earnings to cover platform
            costs. Fee details are available on our pricing page.
          </List.Item>
        </List.Root>

        <Heading as="h3" size="md" mt={6} mb={3}>
          3.3 Refunds & Cancellations:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            Subscription fees are non-refundable, except where required by law.
          </List.Item>
          <List.Item>
            Members may cancel subscriptions at any time, but access remains
            until the end of the billing cycle.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mt={8} mb={4}>
          4. Content Guidelines
        </Heading>

        <Heading as="h3" size="md" mt={6} mb={3}>
          4.1 Creator Content Rights:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            Creators retain full ownership of their content but grant Patreon Clone a
            non-exclusive license to host, display, and distribute it within the
            platform.
          </List.Item>
        </List.Root>

        <Heading as="h3" size="md" mt={6} mb={3}>
          4.2 Community Standards:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            Content that is illegal, abusive, hateful, or violates intellectual
            property rights is prohibited.
          </List.Item>
          <List.Item>
            Patreon Clone reserves the right to remove content that violates these
            standards.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mt={8} mb={4}>
          5. Messaging & Engagement Features
        </Heading>

        <Heading as="h3" size="md" mt={6} mb={3}>
          5.1 Messaging:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            Creators can send group messages to their subscribers.
          </List.Item>
          <List.Item>
            Paying subscribers can direct message creators they subscribe to,
            and vice versa.
          </List.Item>
          <List.Item>
            Messaging includes timestamps, read/unread statuses, and emoji
            support.
          </List.Item>
        </List.Root>

        <Heading as="h3" size="md" mt={6} mb={3}>
          5.2 Likes & Comments:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            Free members can like and comment on public posts.
          </List.Item>
          <List.Item>
            Paid subscribers can engage with exclusive content through likes and
            comments.
          </List.Item>
          <List.Item>
            Creators and Community Managers have moderation controls.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mt={8} mb={4}>
          6. Platform Role & Liability
        </Heading>

        <Heading as="h3" size="md" mt={6} mb={3}>
          6.1 Patreon Clone&apos;s Role:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            Patreon Clone acts as an intermediary between creators and their
            audiences.
          </List.Item>
          <List.Item>
            We are not liable for disputes between users or third-party claims
            related to content.
          </List.Item>
        </List.Root>

        <Heading as="h3" size="md" mt={6} mb={3}>
          6.2 Limitation of Liability:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            {
              'Patreon Clone is provided on an "as is" basis. We are not responsible for service interruptions, loss of earnings, or data breaches.'
            }
          </List.Item>
          <List.Item>
            Our total liability is limited to the amount paid by a user in the
            past 12 months.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mt={8} mb={4}>
          7. Taxes & Compliance
        </Heading>
        <List.Root mb={6} gap={1}>
          <List.Item>
            Creators are responsible for reporting and paying applicable taxes
            on their earnings.
          </List.Item>
          <List.Item>
            Patreon Clone may collect tax-related information as required by law.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mt={8} mb={4}>
          8. Dispute Resolution
        </Heading>

        <Heading as="h3" size="md" mt={6} mb={3}>
          8.1 Arbitration:
        </Heading>
        <List.Root mb={4} gap={1}>
          <List.Item>
            Any disputes will be resolved through binding arbitration in
            California.
          </List.Item>
          <List.Item>Users waive the right to class action lawsuits.</List.Item>
        </List.Root>

        <Heading as="h3" size="md" mt={6} mb={3}>
          8.2 Governing Law:
        </Heading>
        <List.Root mb={6} gap={1}>
          <List.Item>
            These Terms are governed by the laws of California.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mt={8} mb={4}>
          9. Changes to Terms
        </Heading>
        <List.Root mb={6} gap={1}>
          <List.Item>
            Patreon Clone may update these Terms from time to time. Significant
            changes will be communicated through the platform.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="lg" mt={8} mb={4}>
          10. Contact Information
        </Heading>
        <Text mb={6}>
          For questions about these Terms, contact us at {branding.contact.supportEmail}.
        </Text>
      </Box>
    </Container>
  );
};

export default TermsOfServicePage;
