/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React, { useEffect, useState } from "react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import {
  Flex,
  IconButton,
  Input,
  Separator,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";

import { Radio, RadioGroup } from "@/components/ui/radio";
import { Switch } from "@/components/ui/switch";
import DatePicker from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/time-picker";
import {
  createDiscount,
  generateDiscountCode,
  updateDiscount,
} from "@/lib/backend-services/promotions-service";
import {
  CreateDiscountDto,
  DiscountApplicability,
  DiscountType,
  IDiscount,
} from "@/typings/IDiscount";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toaster } from "@/components/ui/toaster";

interface Props {
  mode: "create" | "edit";
  discount?: IDiscount;
  onOpenCallback?: () => void;
  onSaveCallback?: () => void;
}

const DiscountModal: React.FC<Props> = ({
  mode,
  discount,
  onOpenCallback,
  onSaveCallback,
}) => {
  const { open, onOpen: onOpenRoot, onClose } = useDisclosure();

  const [name, setName] = useState(discount?.title || "");
  const [discountCode, setDiscountCode] = useState(discount?.code || "");
  const [description, setDescription] = useState(discount?.description || "");
  const [discountPercent, setDiscountPercent] = useState(
    discount?.discountNumber || 10
  );
  const [discountAppliesTo, setDiscountAppliesTo] =
    useState<DiscountApplicability>(
      discount?.applicableTo || DiscountApplicability.ALL
    );
  const [selectedTiers, setSelectedTiers] = useState<string[]>(
    discount?.applicableTiers?.map((tier) => tier.id) || []
  );
  const [isPublic, setIsPublic] = useState(discount?.isPublic || false);
  const [startDate, setStartDate] = useState<Date>(
    discount?.startDate ? new Date(discount.startDate) : new Date()
  );
  const [startTime, setStartTime] = useState<Date>(
    discount?.startDate ? new Date(discount.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState<Date>(
    discount?.endDate
      ? new Date(discount.endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  );
  const [endTime, setEndTime] = useState<Date>(
    discount?.endDate
      ? new Date(discount.endDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [isLoading, setIsLoading] = useState(false);

  const { data: memberships } = useQuery({
    queryKey: ["memberships", "creator"],
    queryFn: async () => {
      const { data } = await api.get<{ memberships: any[] }>(
        "/memberships/creator"
      );
      return data;
    },
  });

  const generateCode = async () => {
    try {
      const code = await generateDiscountCode();
      setDiscountCode(code);
    } catch (error) {
      console.error("Error generating code:", error);
      const localCode = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();
      setDiscountCode(localCode);
    }
  };

  useEffect(() => {
    if (mode === "create" && !discountCode) {
      generateCode();
    }
  }, [mode, discountCode]);

  const onOpen = () => {
    onOpenRoot();
    if (onOpenCallback) {
      onOpenCallback();
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const resetForm = () => {
    if (mode === "create") {
      setName("");
      generateCode();
      setDescription("");
      setDiscountPercent(10);
      setDiscountAppliesTo(DiscountApplicability.ALL);
      setSelectedTiers([]);
      setIsPublic(false);
      setStartDate(new Date());
      setStartTime(new Date());
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      setEndDate(thirtyDaysFromNow);
      setEndTime(thirtyDaysFromNow);
    } else if (discount) {
      setName(discount.title);
      setDiscountCode(discount.code);
      setDescription(discount.description || "");
      setDiscountPercent(discount.discountNumber);
      setDiscountAppliesTo(discount.applicableTo);
      setSelectedTiers(discount.applicableTiers?.map((tier) => tier.id) || []);
      setIsPublic(discount.isPublic);
      setStartDate(new Date(discount.startDate));
      setStartTime(new Date(discount.startDate));
      setEndDate(new Date(discount.endDate));
      setEndTime(new Date(discount.endDate));
    }
  };

  const handleSave = async () => {
    if (!name) {
      toaster.create({
        title: "Name is required",
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (!discountCode) {
      toaster.create({
        title: "Discount code is required",
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (
      discountAppliesTo === DiscountApplicability.SELECTED &&
      selectedTiers.length === 0
    ) {
      toaster.create({
        title: "Please select at least one tier",
        type: "error",
        duration: 3000,
      });
      return;
    }

    const combinedStartDate = new Date(startDate);
    combinedStartDate.setHours(
      startTime.getHours(),
      startTime.getMinutes(),
      0,
      0
    );

    const combinedEndDate = new Date(endDate);
    combinedEndDate.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    if (combinedEndDate <= combinedStartDate) {
      toaster.create({
        title: "End date must be after start date",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "create") {
        const newDiscount: CreateDiscountDto = {
          title: name,
          code: discountCode,
          description,
          percentageType: DiscountType.PERCENTAGE,
          discountNumber: discountPercent,
          applicableTo: discountAppliesTo,
          applicableTiers:
            discountAppliesTo === DiscountApplicability.SELECTED
              ? selectedTiers
              : undefined,
          startDate: combinedStartDate.toISOString(),
          endDate: combinedEndDate.toISOString(),
          isPublic,
        };

        await createDiscount(newDiscount);
        toaster.create({
          title: "Discount created successfully",
          type: "success",
          duration: 3000,
        });
      } else if (discount) {
        const updatedDiscount = {
          title: name,
          description,
          percentageType: DiscountType.PERCENTAGE,
          discountNumber: discountPercent,
          applicableTo: discountAppliesTo,
          applicableTiers:
            discountAppliesTo === DiscountApplicability.SELECTED
              ? selectedTiers
              : undefined,
          startDate: combinedStartDate.toISOString(),
          endDate: combinedEndDate.toISOString(),
          isPublic,
        };

        await updateDiscount(discount.id, updatedDiscount);
        toaster.create({
          title: "Discount updated successfully",
          type: "success",
          duration: 3000,
        });
      }

      if (onSaveCallback) {
        onSaveCallback();
      }

      handleClose();
    } catch (error: any) {
      console.error("Error saving discount:", error);
      toaster.create({
        title: "Error saving discount",
        description:
          error.response?.data?.message || "An unexpected error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot
      motionPreset={"slide-in-bottom"}
      placement={"center"}
      open={open}
      size={"xl"}
    >
      {mode === "create" ? (
        <ButtonWithIcon onClick={onOpen} icon="mingcute:add-fill">
          Add
        </ButtonWithIcon>
      ) : (
        <Flex
          onClick={onOpen}
          as={"button"}
          _hover={{
            bg: "green.100",
          }}
          gap={4}
          px={4}
          py={2}
          cursor={"pointer"}
          color={"green.700"}
          borderTopRadius={"8px"}
        >
          <Icon width={"16px"} icon={"carbon:edit"} />
          <Text transform={"translateY(-2px)"}>Edit</Text>
        </Flex>
      )}
      <DialogContent>
        <DialogHeader
          alignItems={"center"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Text fontSize={"xl"} fontWeight={600} flex={1}>
            {mode === "create" ? "Create new discount" : "Edit discount"}
          </Text>
          <IconButton rounded="999px" variant={"ghost"} onClick={handleClose}>
            <Icon icon={"ic:round-close"} />
          </IconButton>
        </DialogHeader>
        <Separator my={3} />
        <DialogBody>
          <Stack gap={8}>
            <Flex gap={4}>
              <Field label="Name">
                <Input
                  placeholder="Name of the discount"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Code">
                <InputGroup
                  w={"100%"}
                  endElement={
                    <IconButton onClick={generateCode} variant={"ghost"}>
                      <Icon icon={"mynaui:redo"} />
                    </IconButton>
                  }
                >
                  <Input
                    value={discountCode}
                    onChange={(e) =>
                      setDiscountCode(e.target.value.toUpperCase())
                    }
                    placeholder="Discount code"
                    maxLength={8}
                  />
                </InputGroup>
              </Field>
            </Flex>
            <Field label="Description">
              <Input
                placeholder="Short description of this discount"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Flex alignItems={"end"} gap={4}>
              <Field w={"50%"} label="Percent amount">
                <InputGroup w={"100%"} endElement={<Text>%</Text>}>
                  <Input
                    placeholder="0"
                    value={discountPercent}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value)) return;
                      setDiscountPercent(Math.min(100, Math.max(0, value)));
                    }}
                  />
                </InputGroup>
              </Field>
              <Text flexGrow={1}>Percent off first month</Text>
            </Flex>
            <Field label="Applies to">
              <RadioGroup
                value={discountAppliesTo}
                onChange={(e) => {
                  //@ts-ignore
                  setDiscountAppliesTo(e.target.value as DiscountApplicability);
                }}
              >
                <Stack gap={3}>
                  <Radio value={DiscountApplicability.ALL}>All tiers</Radio>
                  <Radio value={DiscountApplicability.SELECTED}>
                    Selected tiers only
                  </Radio>
                </Stack>
              </RadioGroup>
            </Field>
            {discountAppliesTo === DiscountApplicability.SELECTED &&
              memberships?.memberships && (
                <Field label="Select tiers">
                  <Stack gap={2}>
                    {memberships.memberships.map((tier) => (
                      <Flex key={tier._id} alignItems="center" gap={2}>
                        <input
                          type="checkbox"
                          id={`tier-${tier._id}`}
                          checked={selectedTiers.includes(tier._id)}
                          onChange={(e) => {
                            console.log(tier._id);
                            if (e.target.checked) {
                              setSelectedTiers((prev) => [...prev, tier._id]);
                            } else {
                              setSelectedTiers((prev) =>
                                prev.filter((id) => id !== tier._id)
                              );
                            }
                          }}
                        />
                        <label htmlFor={`tier-${tier._id}`}>
                          {tier.name} (${tier.monthlyRate}/month)
                        </label>
                      </Flex>
                    ))}
                  </Stack>
                </Field>
              )}
            <Flex justifyContent={"space-between"}>
              <Stack>
                <Text fontWeight={"600"}>Display this discount publicly</Text>
                <Text color={"star.600"} fontSize={"sm"}>
                  Anyone (except paid members) can see this discount
                </Text>
              </Stack>
              <Switch
                size={"lg"}
                checked={isPublic}
                //@ts-ignore
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            </Flex>
            <Stack>
              <Text fontWeight={"600"}>Start date</Text>
              <Flex gap={4}>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => date && setStartDate(date)}
                />
                <TimePicker
                  selected={startTime}
                  onChange={(time) => time && setStartTime(time)}
                />
              </Flex>
            </Stack>
            <Stack>
              <Text fontWeight={"600"}>End date</Text>
              <Flex gap={4}>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => date && setEndDate(date)}
                  minDate={startDate}
                />
                <TimePicker
                  selected={endTime}
                  onChange={(time) => time && setEndTime(time)}
                />
              </Flex>
            </Stack>
          </Stack>
        </DialogBody>
        <Separator my={3} />

        <DialogFooter>
          <Button variant={"outline"} onClick={handleClose}>
            Cancel
          </Button>
          <Button loading={isLoading} onClick={handleSave}>
            {mode === "create" ? "Create discount" : "Save discount"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default DiscountModal;
