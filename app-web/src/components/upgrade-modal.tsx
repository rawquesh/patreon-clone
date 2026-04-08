import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Heading } from "@chakra-ui/react";
import ButtonWithIcon from "./ui/button-with-icon";
import { TierAccess } from "@/typings/ITierAccess";
import Carousel from "./ui/carousel";
import PricingCard from "@/page-components/creator/pricing-card";

export const UpgradeModal: React.FC<{
  tierAccess: TierAccess[];
}> = ({ tierAccess }) => {
  return (
    <DialogRoot
      motionPreset={"slide-in-bottom"}
      size={"xl"}
      placement={"center"}
    >
      <DialogTrigger as={"div"}>
        <ButtonWithIcon icon="tabler:lock-filled" mt={4} mb={2} w={"fit"}>
          Upgrade to unlock
        </ButtonWithIcon>
      </DialogTrigger>
      <DialogContent p={4}>
        <DialogHeader p={0}>
          <Heading fontSize={"2xl"} fontWeight={600} flex={1}>
            Upgrade to view the post
          </Heading>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogDescription mt={2}>
          upgrading to one of these membership tiers will give you access to
          this content.
        </DialogDescription>
        <DialogBody py={12}>
          <Carousel
            cards={tierAccess.map((membership) => (
              <PricingCard
                key={membership._id}
                image={membership.coverImage}
                title={membership.name}
                pricePerMonth={membership.monthlyRate}
                pricePerYear={0}
                limited={false}
                seatsLeft={0}
                description={membership.description}
                featured={membership.isFeatured}
                membershipId={membership._id}
                creatorId={membership.creator}
              />
            ))}
          />
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};
