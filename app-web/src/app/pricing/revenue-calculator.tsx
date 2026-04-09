/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Flex,
  Heading,
  InputGroup,
  NumberInput, // Keep top-level import for Root, Input etc.
  Slider,
  Field,
  Text,
  VStack,
} from "@chakra-ui/react";
import { branding } from "@/config/branding";

const RevenueCalculator: React.FC = () => {
  const [subscribers, setSubscribers] = useState<number>(500);
  const [price, setPrice] = useState<number>(10);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [processingFee, setProcessingFee] = useState<number>(0);
  const [creatorEarnings, setCreatorEarnings] = useState<number>(0);

  useEffect(() => {
    const calculateRevenue = () => {
      const revenue = subscribers * price;
      setMonthlyRevenue(revenue);
      const platformFeeValue = revenue * (branding.platform.feePercentage / 100);
      setPlatformFee(platformFeeValue);
      const transactionCount = revenue > 0 ? subscribers : 0;
      const processing = revenue * 0.029 + transactionCount * 0.3;
      setProcessingFee(processing);
      const earnings = revenue - platformFeeValue - processing;
      setCreatorEarnings(Math.max(0, earnings));
    };

    calculateRevenue();
  }, [subscribers, price]);

  const handleSubscriberSliderChange = (details: { value: number[] }) => {
    setSubscribers(details.value[0]);
  };

  const handlePriceSliderChange = (details: { value: number[] }) => {
    setPrice(details.value[0]);
  };

  // NumberInput.Root onChange provides string and number
  const handleSubscriberInputChange = (
    _valueAsString: string,
    valueAsNumber: number
  ) => {
    const clampedValue = Math.max(0, Math.min(10000, valueAsNumber));
    // Use 0 if value is NaN (e.g., input cleared)
    setSubscribers(isNaN(clampedValue) ? 0 : clampedValue);
  };

  const handlePriceInputChange = (
    _valueAsString: string,
    valueAsNumber: number
  ) => {
    const clampedValue = Math.max(0, Math.min(100, valueAsNumber));
    // Use 0 if value is NaN
    setPrice(isNaN(clampedValue) ? 0 : clampedValue);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card.Root
      shadow="lg"
      borderRadius="xl"
      overflow="hidden"
      variant="outline"
    >
      <Card.Header bg={branding.colors.duneLight} borderBottomWidth="1px" borderColor="gray.200">
        <Heading size="lg" fontWeight="bold" color={branding.colors.textHeader}>
          Revenue Calculator
        </Heading>
      </Card.Header>
      <Card.Body pt={6}>
        <VStack gap={8} align="stretch">
          {/* Subscribers Section */}
          <Box>
            <Field.Root id="subscribers-field">
              <Flex justify="space-between" align="center" mb={2}>
                <Field.Label
                  fontWeight="medium"
                  color={branding.colors.star}
                  htmlFor="subscribers-input"
                >
                  Subscribers
                </Field.Label>
                {/* Use NumberInput.Root structure */}
                <NumberInput.Root
                  id="subscribers-input" // Use ID on Root for association
                  size="sm"
                  width="80px"
                  value={String(subscribers)} // Pass value as string to Root
                  // @ts-ignore
                  onChange={handleSubscriberInputChange} // onChange remains on Root
                  min={0}
                  max={10000}
                  step={10}
                  allowMouseWheel
                  // KeepFocusOnChange=false might be useful if focus jumps undesirably
                >
                  {/* Apply input-specific styles to NumberInput.Input */}
                  <NumberInput.Input textAlign="right" />
                  {/* Optional: Add Controls if desired */}
                  {/* <NumberInput.Control>
                    <NumberInput.IncrementTrigger />
                    <NumberInput.DecrementTrigger />
                  </NumberInput.Control> */}
                </NumberInput.Root>
              </Flex>
            </Field.Root>
            {/* @ts-ignore */}
            <Slider.Root
              aria-label="subscribers-slider"
              value={[subscribers]}
              min={0}
              max={10000}
              step={10}
              onValueChange={handleSubscriberSliderChange}
              mb={2}
              colorScheme="orange"
            >
              <Slider.Control>
                <Slider.Track bg="orange.100">
                  <Slider.Range bg={branding.colors.accent} />
                </Slider.Track>
                <Slider.Thumb index={0} boxSize={4} />
              </Slider.Control>
            </Slider.Root>
            <Flex justify="space-between" fontSize="sm" color={branding.colors.star}>
              <Text>0</Text>
              <Text>2,500</Text>
              <Text>5,000</Text>
              <Text>7,500</Text>
              <Text>10,000</Text>
            </Flex>
          </Box>

          {/* Price Section */}
          <Box>
            <Field.Root id="price-field">
              <Flex justify="space-between" align="center" mb={2}>
                <Field.Label
                  fontWeight="medium"
                  color={branding.colors.star}
                  htmlFor="price-input"
                >
                  Subscription Price, USD per month
                </Field.Label>
                <InputGroup width="85px">
                  {/* <InputLeftElement
                    pointerEvents="none"
                    color="gray.500"
                    fontSize="sm"
                    children="$"
                    height="100%" // Make sure element fills height
                    display="flex"
                    alignItems="center"
                    // Adjust left position if needed based on NumberInput changes
                    // left="4px"
                  /> */}
                  {/* Use NumberInput.Root structure within InputGroup */}
                  <NumberInput.Root
                    id="price-input" // ID on Root
                    value={String(price)} // Pass value as string
                    // @ts-ignore
                    onChange={handlePriceInputChange} // onChange on Root
                    min={0}
                    max={100}
                    step={1} // Can add precision={2} here if needed
                    allowMouseWheel
                    // No width needed here, InputGroup controls it
                  >
                    {/* Apply input-specific styles here */}
                    {/* The InputLeftElement will apply padding-left automatically */}
                    <NumberInput.Input textAlign="right" />
                    {/* Optional controls */}
                    {/* <NumberInput.Control>
                      <NumberInput.IncrementTrigger />
                      <NumberInput.DecrementTrigger />
                    </NumberInput.Control> */}
                  </NumberInput.Root>
                </InputGroup>
              </Flex>
            </Field.Root>
            {/* @ts-ignore */}
            <Slider.Root
              aria-label="price-slider"
              value={[price]}
              min={0}
              max={100}
              step={1}
              onValueChange={handlePriceSliderChange}
              mb={2}
              colorScheme="orange"
            >
              <Slider.Control>
                <Slider.Track bg="orange.100">
                  <Slider.Range bg={branding.colors.accent} />
                </Slider.Track>
                <Slider.Thumb index={0} boxSize={4} />
              </Slider.Control>
            </Slider.Root>
            <Flex justify="space-between" fontSize="sm" color={branding.colors.star}>
              <Text>$0</Text>
              <Text>$25</Text>
              <Text>$50</Text>
              <Text>$75</Text>
              <Text>$100</Text>
            </Flex>
          </Box>

          {/* Results Section (remains the same) */}
          <Box bg={branding.colors.bgLight} p={6} borderRadius="lg" mt={6}>
            <VStack gap={4} align="stretch">
              <Flex
                justify="space-between"
                align="center"
                pb={3}
                borderBottomWidth="1px"
                borderColor="gray.300"
              >
                <Heading size="md" fontWeight="semibold" color={branding.colors.textHeader}>
                  Monthly Earnings
                </Heading>
                <Text fontSize="2xl" fontWeight="bold" color={branding.colors.accent}>
                  {formatCurrency(creatorEarnings)}
                </Text>
              </Flex>

              <VStack gap={2} align="stretch" fontSize="sm">
                <Flex justify="space-between">
                  <Text color={branding.colors.star}>Monthly Revenue</Text>
                  <Text fontWeight="medium">
                    {formatCurrency(monthlyRevenue)}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color={branding.colors.star}>{branding.name} Fee ({branding.platform.feePercentage}%)</Text>
                  <Text fontWeight="medium" color="red.600">
                    -{formatCurrency(platformFee)}
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color={branding.colors.star}>Processing Fee (2.9% + $0.30/sub)</Text>
                  <Text fontWeight="medium" color="red.600">
                    -{formatCurrency(processingFee)}
                  </Text>
                </Flex>
              </VStack>
            </VStack>
            <Text mt={4} fontSize="xs" color={branding.colors.star} fontStyle="italic">
              This is an estimate and actual earnings may vary.
            </Text>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

export default RevenueCalculator;
