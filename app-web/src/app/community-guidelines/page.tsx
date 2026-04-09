import React from "react";
import { Box, Heading, Text, List, Stack, Container } from "@chakra-ui/react";
import { branding } from "@/config/branding";

const CommunityGuidelinesPage: React.FC = () => {
  return (
    <Container maxW="1024px" py={12} px={{ base: 4, md: 8 }}>
      <Stack gap={8}>
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Patreon Clone Community Guidelines
          </Heading>
          <Text fontStyle="italic">Version 1.0 — Effective [Date]</Text>
        </Box>

        <Text>
          Patreon Clone is dedicated to fostering a positive, respectful, and
          meaningful space for Jewish creators and their communities. These
          Community Guidelines establish the standards for interaction on
          Patreon Clone, ensuring a safe and engaging environment for everyone. By
          using Patreon Clone, you agree to abide by these guidelines in addition to
          our Terms of Service.
        </Text>

        <Text>
          If you come across any violations, please report them to{" "}
          <strong>{branding.contact.supportEmail}</strong>.
        </Text>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            1. Prohibited Content
          </Heading>
          <Text mb={4}>
            To maintain a respectful and enriching community, the following
            types of content are strictly prohibited:
          </Text>

          <Stack gap={4}>
            <Box>
              <Heading as="h3" size="md">
                Illegal Content
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Any content that violates applicable laws or regulations.
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading as="h3" size="md">
                Hate Speech & Harassment
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Content that promotes violence, hate, or discrimination based
                  on race, ethnicity, religion, gender, sexual orientation,
                  disability, or other protected characteristics.
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading as="h3" size="md">
                Explicit or Adult Content
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Pornography or sexual content, including sexually explicit
                  discussions, imagery, or fetish content.
                </List.Item>
                <List.Item>
                  Depictions of sexual violence or exploitation in any form.
                </List.Item>
                <List.Item>
                  <Text fontWeight="bold" display="inline">
                    Exceptions include:
                  </Text>
                  <List.Root>
                    <List.Item>
                      Educational or religious discussions within a respectful
                      context.
                    </List.Item>
                    <List.Item>
                      Breastfeeding or post-mastectomy images.
                    </List.Item>
                    <List.Item>
                      Depictions of art or history that align with
                      Patreon Clone&apos;s mission.
                    </List.Item>
                  </List.Root>
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading as="h3" size="md">
                Violent or Dangerous Content
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Graphic violence, threats, or incitement of harm toward
                  individuals or groups.
                </List.Item>
                <List.Item>
                  Encouraging or glorifying self-harm, suicide, or dangerous
                  behaviors.
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading as="h3" size="md">
                Misinformation & Fraud
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Spreading false information that could cause harm.
                </List.Item>
                <List.Item>
                  Scams, phishing, or deceptive business practices.
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading as="h3" size="md">
                Unauthorized Sharing of Private Information
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Posting personal, confidential, or sensitive information
                  without consent.
                </List.Item>
              </List.Root>
            </Box>
          </Stack>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            2. Prohibited Activities
          </Heading>
          <Text mb={4}>The following actions are not allowed on Patreon Clone:</Text>

          <Stack gap={4}>
            <Box>
              <Heading as="h3" size="md">
                Spam & Unsolicited Promotions
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Posting repetitive, irrelevant, or commercial messages outside
                  of designated spaces.
                </List.Item>
                <List.Item>
                  Excessive self-promotion in a way that disrupts meaningful
                  engagement.
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading as="h3" size="md">
                Impersonation & Deceptive Behavior
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Pretending to be another person or organization.
                </List.Item>
                <List.Item>
                  Misleading community members for financial or personal gain.
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading as="h3" size="md">
                Hacking, Scraping & Unauthorized Access
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Attempting to gain unauthorized access to accounts or data.
                </List.Item>
                <List.Item>
                  Using automated tools to collect or distribute content.
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading as="h3" size="md">
                Disrupting the Community
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Engaging in trolling, harassment, or disruptive behavior.
                </List.Item>
                <List.Item>
                  Posting content that intentionally provokes or antagonizes
                  others.
                </List.Item>
              </List.Root>
            </Box>
          </Stack>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            3. Creator & Community Moderation
          </Heading>

          <Box mb={4}>
            <Text fontWeight="bold">
              Creators have full control over their communities. They can:
            </Text>
            <List.Root pl={4}>
              <List.Item>
                Set their own engagement rules, as long as they align with
                Patreon Clone&apos;s guidelines.
              </List.Item>
              <List.Item>
                Remove comments, posts, or members who violate their rules.
              </List.Item>
              <List.Item>
                Report issues to Patreon Clone for further review.
              </List.Item>
            </List.Root>
          </Box>

          <Box>
            <Text fontWeight="bold">Community Managers:</Text>
            <Text>
              If a creator assigns moderators, they are expected to enforce
              these guidelines fairly and consistently.
            </Text>
          </Box>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            {'4. Enforcement & "Three Strikes" Policy'}
          </Heading>
          <Text mb={4}>
            Patreon Clone reserves the right to take action against violations,
            including:
          </Text>

          <Stack gap={4}>
            <Box>
              <Heading as="h3" size="md">
                Content Removal
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Deleting content that violates guidelines.
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading as="h3" size="md">
                Strikes & Warnings
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Users may receive up to three strikes for violations.
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading as="h3" size="md">
                Account Suspension or Termination
              </Heading>
              <List.Root pl={4}>
                <List.Item>
                  Three strikes within 180 days may lead to account termination.
                </List.Item>
                <List.Item>
                  Immediate bans may occur for severe violations (e.g., illegal
                  activity, harassment, or extreme threats).
                </List.Item>
                <List.Item>
                  Users with terminated accounts cannot create new accounts to
                  evade enforcement.
                </List.Item>
              </List.Root>
            </Box>

            <Box>
              <Heading as="h3" size="md">
                Appealing a Strike
              </Heading>
              <Text>
                If you believe a strike was issued in error, you may appeal
                within <strong>15 days</strong> by responding to the
                notification email. Patreon Clone will review and respond within{" "}
                <strong>30 days</strong>.
              </Text>
            </Box>
          </Stack>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={4}>
            5. Reporting Violations
          </Heading>
          <Text>
            If you witness a violation of these guidelines, please report it to{" "}
            <strong>{branding.contact.supportEmail}</strong>. Our team will review reports and
            take appropriate action.
          </Text>
        </Box>
      </Stack>
    </Container>
  );
};

export default CommunityGuidelinesPage;
