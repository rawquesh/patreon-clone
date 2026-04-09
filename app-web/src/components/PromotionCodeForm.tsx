"use client";

import React, { useState } from "react";
import { Box, Flex, Input, Stack, Text, useDisclosure } from "@chakra-ui/react";
import {
  useValidatePromotion,
  useRedeemPromotion,
} from "@/lib/backend-services/subscription-service";
import {
  IPromotionValidationResponse,
  IPromotionRedemptionResponse,
} from "@/typings/ISubscription";
import { Button } from "./ui/button";

interface PromotionCodeFormProps {
  membershipId: string;
  originalPrice: number;
  onSuccess?: (response: IPromotionRedemptionResponse) => void;
}

const PromotionCodeForm: React.FC<PromotionCodeFormProps> = ({
  membershipId,
  originalPrice,
  onSuccess,
}) => {
  const [code, setCode] = useState("");
  const [validationResult, setValidationResult] =
    useState<IPromotionValidationResponse | null>(null);
  const {
    open: isValidated,
    onOpen: setValidated,
    onClose: resetValidation,
  } = useDisclosure();

  const validateMutation = useValidatePromotion();
  const redeemMutation = useRedeemPromotion();

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) return;

    validateMutation.mutate(
      { code, membershipId },
      {
        onSuccess: (data) => {
          setValidationResult(data);
          if (data.isValid) {
            setValidated();
          }
        },
      }
    );
  };

  const handleRedeem = () => {
    redeemMutation.mutate(
      { code, membershipId },
      {
        onSuccess: (data) => {
          if (onSuccess) {
            onSuccess(data);
          }
        },
      }
    );
  };

  const handleReset = () => {
    setCode("");
    resetValidation();
    setValidationResult(null);
  };

  const savingsPercentage =
    validationResult?.discountedPrice && validationResult.originalPrice
      ? Math.round(
          ((validationResult.originalPrice - validationResult.discountedPrice) /
            validationResult.originalPrice) *
            100
        )
      : 0;

  return (
    <Box p={4} borderRadius="12px" className="glass-card">
      {!isValidated ? (
        <form onSubmit={handleValidate}>
          <Stack gap={4}>
            <Text fontWeight="medium" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>Do you have a promotional code?</Text>

            <>
              {/* <FormLabel htmlFor="promoCode">Enter your code</FormLabel> */}
              <Flex>
                <Input
                  id="promoCode"
                  placeholder="Enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  mr={2}
                  disabled={validateMutation.isPending}
                />
                <Button type="submit" loading={validateMutation.isPending} className="btn-gradient">
                  Apply
                </Button>
              </Flex>
            </>

            {validationResult && !validationResult.isValid && (
              <Text css={{ color: "hsl(0, 84.2%, 60.2%)" }} fontSize="sm">
                {validationResult.message || "Invalid promotion code"}
              </Text>
            )}
          </Stack>
        </form>
      ) : (
        <Stack gap={4}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontWeight="medium" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>Promotion applied:</Text>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              Remove
            </Button>
          </Flex>

          <Box
            css={{
              background: "linear-gradient(135deg, hsl(142, 76%, 36%) / 0.1, hsl(142, 76%, 30%) / 0.08)",
              p: 3,
              borderRadius: "8px",
              borderWidth: "1px",
              borderColor: "hsl(142, 76%, 36%)",
            }}
          >
            <Stack gap={1}>
              <Text fontWeight="bold" css={{ color: "hsl(142, 76%, 36%)" }}>
                {validationResult?.promotion?.title || "Discount"}
              </Text>

              {validationResult?.promotion?.description && (
                <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                  {validationResult.promotion.description}
                </Text>
              )}

              <Flex justifyContent="space-between" mt={2}>
                <Text fontSize="sm" fontWeight="medium">
                  Original price:
                </Text>
                <Text fontSize="sm" textDecoration="line-through" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                  ${originalPrice.toFixed(2)}
                </Text>
              </Flex>

              <Flex justifyContent="space-between">
                <Text fontSize="sm" fontWeight="medium">
                  Discounted price:
                </Text>
                <Text fontSize="sm" fontWeight="bold" css={{ color: "hsl(142, 76%, 36%)" }}>
                  ${validationResult?.discountedPrice?.toFixed(2) || "0.00"}
                </Text>
              </Flex>

              {savingsPercentage > 0 && (
                <Text fontSize="sm" fontWeight="bold" css={{ color: "hsl(142, 76%, 36%)" }} mt={1}>
                  You save {savingsPercentage}%
                </Text>
              )}
            </Stack>
          </Box>

          <Button
            css={{
              background: "linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 76%, 30%))",
              color: "white",
              "&:hover": { opacity: 0.9 },
            }}
            onClick={handleRedeem}
            loading={redeemMutation.isPending}
          >
            Apply Discount
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default PromotionCodeForm;
