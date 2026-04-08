import React, { useState } from "react";
import { Box, Flex, Input, Stack, Text, useDisclosure } from "@chakra-ui/react";
import {
  useValidatePromotion,
  useRedeemPromotion,
} from "@/lib/backend-services/subscription-service";
import { IPromotionValidationResponse } from "@/typings/ISubscription";
import { Button } from "./ui/button";

interface PromotionCodeFormProps {
  membershipId: string;
  originalPrice: number;
  onSuccess?: (response: any) => void;
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
    <Box p={4} borderRadius="md" borderWidth="1px" borderColor="gray.200">
      {!isValidated ? (
        <form onSubmit={handleValidate}>
          <Stack gap={4}>
            <Text fontWeight="medium">Do you have a promotional code?</Text>

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
                <Button type="submit" loading={validateMutation.isPending}>
                  Apply
                </Button>
              </Flex>
            </>

            {validationResult && !validationResult.isValid && (
              <Text color="red.500" fontSize="sm">
                {validationResult.message || "Invalid promotion code"}
              </Text>
            )}
          </Stack>
        </form>
      ) : (
        <Stack gap={4}>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontWeight="medium">Promotion applied:</Text>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              Remove
            </Button>
          </Flex>

          <Box
            bg="green.50"
            p={3}
            borderRadius="md"
            borderWidth="1px"
            borderColor="green.200"
          >
            <Stack gap={1}>
              <Text fontWeight="bold" color="green.600">
                {validationResult?.promotion?.title || "Discount"}
              </Text>

              {validationResult?.promotion?.description && (
                <Text fontSize="sm" color="gray.600">
                  {validationResult.promotion.description}
                </Text>
              )}

              <Flex justifyContent="space-between" mt={2}>
                <Text fontSize="sm" fontWeight="medium">
                  Original price:
                </Text>
                <Text fontSize="sm" textDecoration="line-through">
                  ${originalPrice.toFixed(2)}
                </Text>
              </Flex>

              <Flex justifyContent="space-between">
                <Text fontSize="sm" fontWeight="medium">
                  Discounted price:
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="green.600">
                  ${validationResult?.discountedPrice?.toFixed(2) || "0.00"}
                </Text>
              </Flex>

              {savingsPercentage > 0 && (
                <Text fontSize="sm" fontWeight="bold" color="green.600" mt={1}>
                  You save {savingsPercentage}%
                </Text>
              )}
            </Stack>
          </Box>

          <Button
            colorScheme="green"
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
