"use client";
import useScrollBeyond from "@/hooks/useScrollBeyond";
import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth.provider";
import { Link } from "react-scroll";
import { useRouter } from "next/navigation";

const MotionFlex = motion.create(Flex);

const PurchaseMembershipBanner: React.FC<{ creatorId: string }> = ({}) => {
  const shouldBeVisible = useScrollBeyond(300);
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div>
      {shouldBeVisible && (
        <MotionFlex
          display={{ base: "none", lg: "flex" }}
          pos={"fixed"}
          bottom={0}
          w={{
            base: "100%",
            md: Boolean(user) ? "calc(100% - 300px)" : "100%",
          }}
          bg={"white"}
          boxShadow="0 -4px 6px rgba(0, 0, 0, 0.1)"
          p={"16px"}
          justifyContent={"center"}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          gap={3}
          alignItems={"center"}
          zIndex={10000}
        >
          <Text fontWeight={"600"}>
            Unlock exclusive posts and join a growing community{" "}
          </Text>
          {/* <Text color={"star.600"}>Starting at $7/month</Text> */}
          <Link
            onClick={() => {
              if (!user) {
                router.push(`/auth/login`);
              }
            }}
            smooth
            to="memberships"
          >
            <Button>Join now</Button>
          </Link>
        </MotionFlex>
      )}
    </div>
  );
};

export default PurchaseMembershipBanner;
