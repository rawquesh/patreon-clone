// import { Switch } from "@/components/ui/switch";
"use client";
import { Heading, Spinner, Stack, Text } from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import Carousel from "@/components/ui/carousel";
import CreatorPostsFilter from "./creator-posts-filter";
import TextPost from "./text-post";
import ImagePost from "./image-post";
import VideoPost from "./video-post";
import AudioPost from "./audio-post";
import {
  useCreator,
  useCreatorPosts,
} from "@/lib/backend-services/creator-service";
import { useCreatorMemberships } from "@/lib/backend-services/subscription-service";
import PricingCard from "./pricing-card";
import LinkPost from "./link-post";
import { Element } from "react-scroll";
import { useSubscription } from "@/context/subscription.provider";
import { useAuth } from "@/context/auth.provider";
// import "react-multi-carousel/lib/styles.css";
// import Carousel, {
// 	ButtonGroupProps,
// 	ResponsiveType,
// } from "react-multi-carousel";
//
const HomePage: React.FC<{
  creatorId: string;
  creatorUsername: string;
}> = ({ creatorId, creatorUsername }) => {
  const { user } = useAuth();
  const [shouldShowMemberships, setShouldShowMemberships] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    type: undefined,
    tier: undefined,
    datePublished: undefined,
    search: undefined,
  });

  const { data: creator } = useCreator();
  const { subscriptions } = useSubscription();
  const isSubscribed = subscriptions.some(
    (subscription) =>
      subscription.creator._id === creatorId && subscription.status === "active"
  );

  const { data: posts = [], isLoading: postsLoading } = useCreatorPosts(
    creatorId,
    filterOptions
  );
  const { data: memberships = [], isLoading: membershipsLoading } =
    useCreatorMemberships(creatorId);

  const handleFilterChange = useCallback((options: any) => {
    setFilterOptions(options);
  }, []);

  const membershipCards = memberships.map((membership) => {
    const monthlyRate = membership.monthlyRate || membership.monthlyPrice || 0;

    return {
      image: membership.coverImage || "/images/pricing-cards/default.jpg",
      title: membership.name,
      pricePerMonth: monthlyRate,
      pricePerYear: membership.yearlyPrice,
      limited: Boolean(membership.isLimited),
      seatsLeft: membership.seatsLeft || 0,
      description: membership.description,
      featured: Boolean(membership.isFeatured),
      membershipId: membership.id || membership._id,
      creatorId,
    };
  });

  const isFreeMember =
    isSubscribed &&
    subscriptions.filter(
      (subscription) =>
        subscription.creator._id === creatorId &&
        subscription.status === "active" &&
        subscription.monthlyRate > 0
    ).length < 1;

  useEffect(() => {
    if (!user) return;
    setShouldShowMemberships(
      (!isSubscribed || isFreeMember) && creatorId !== user?._id
    );
  }, [user, isSubscribed, isFreeMember, creatorId]);
  const paidMembershipCards = membershipCards.filter(
    (membership) => membership.pricePerMonth > 0
  );

  return (
    <Stack my={4} pb={"600px"} alignItems={"center"}>
      {shouldShowMemberships && (
        <Element id="memberships" name="memberships">
          <Heading
            fontSize={"2xl"}
            textAlign={"center"}
            mb={6}
            fontWeight={600}
          >
            Choose your membership
          </Heading>

          {membershipsLoading ? (
            <Spinner size="xl" color="green.500" />
          ) : paidMembershipCards.length > 0 ? (
            <Carousel
              cards={paidMembershipCards.map((membership) => (
                <PricingCard
                  key={membership.membershipId}
                  image={membership.image}
                  title={membership.title}
                  pricePerMonth={membership.pricePerMonth}
                  pricePerYear={membership.pricePerYear}
                  limited={membership.limited}
                  seatsLeft={membership.seatsLeft}
                  description={membership.description}
                  featured={membership.featured}
                  membershipId={membership.membershipId}
                  creatorId={creatorUsername}
                />
              ))}
            />
          ) : (
            <Text textAlign="center" color="gray.500">
              No paid membership options available yet.
            </Text>
          )}
        </Element>
      )}

      <CreatorPostsFilter onFilterChange={handleFilterChange} />

      <Stack gap={6} maxW="680px" w={"100%"}>
        {postsLoading ? (
          <Spinner size="lg" alignSelf="center" my={10} />
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const commonProps = {
              title: post.title,
              body: post.body,
              timeStamp: new Date(post.createdAt).toISOString().split("T")[0],
              likes: post.likes,
              comments: post.comments,
              locked: post.hasAccess && !isSubscribed,
              postId: post._id,
              previewText: post.previewText,
              description: post.description,
              hasAccess: post.hasAccess,
              tierAccess: post.tierAccess,
              isSubscribed,
              linkUrl: post.linkUrl,
              images: post.mediaUrls,
            };
            switch (post.type) {
              case "text":
                return (
                  <TextPost key={post._id} {...commonProps} />
                  // <>hello</>
                );
              case "image":
                return (
                  <ImagePost
                    key={post._id}
                    {...commonProps}
                    image={post.mediaUrl! || post.thumbnailUrl!}
                  />
                );
              case "video":
                return (
                  <VideoPost
                    key={post._id}
                    {...commonProps}
                    src={post.videoUrl!}
                    thumbnail={post.thumbnailUrl!}
                    length={0}
                    description={post.description}
                  />
                );
              case "audio":
                return (
                  <AudioPost
                    key={post._id}
                    {...commonProps}
                    src={post.mediaUrl!}
                  />
                );
              case "link":
                return <LinkPost {...commonProps} />;

              default:
                return null;
            }
          })
        ) : (
          <Text textAlign="center" fontSize="lg" mt={10}>
            No posts found. {creator?.displayName || "This creator"} hasn&apos;t
            shared any content yet.
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

export default HomePage;
