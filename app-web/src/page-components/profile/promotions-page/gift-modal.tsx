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
	NumberInput,
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
	createGift,
	generateGiftCode,
	updateGift,
} from "@/lib/backend-services/promotions-service";
import {
	CreateGiftDto,
	DiscountApplicability,
	GiftType,
	IGift,
} from "@/typings/IDiscount";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { toaster } from "@/components/ui/toaster";

interface Props {
	mode: "create" | "edit";
	gift?: IGift;
	onOpenCallback?: () => void;
	onSaveCallback?: () => void;
}

const GiftModal: React.FC<Props> = ({
	mode,
	gift,
	onOpenCallback,
	onSaveCallback,
}) => {
	const { open, onOpen: onOpenRoot, onClose } = useDisclosure();

	const [name, setName] = useState(gift?.title || "");
	const [giftCode, setGiftCode] = useState(gift?.code || "");
	const [description, setDescription] = useState(gift?.description || "");
	const [giftType, setGiftType] = useState<GiftType>(
		gift?.giftType || GiftType.FREE_TRIAL
	);
	const [durationDays, setDurationDays] = useState(gift?.durationDays || 7);
	const [giftAppliesTo, setGiftAppliesTo] = useState<DiscountApplicability>(
		gift?.applicableTo || DiscountApplicability.ALL
	);
	const [selectedTiers, setSelectedTiers] = useState<string[]>(
		gift?.applicableTiers?.map((tier) => tier.id) || []
	);
	const [isPublic, setIsPublic] = useState(gift?.isPublic || false);
	const [startDate, setStartDate] = useState<Date>(
		gift?.startDate ? new Date(gift.startDate) : new Date()
	);
	const [startTime, setStartTime] = useState<Date>(
		gift?.startDate ? new Date(gift.startDate) : new Date()
	);
	const [endDate, setEndDate] = useState<Date>(
		gift?.endDate
			? new Date(gift.endDate)
			: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
	);
	const [endTime, setEndTime] = useState<Date>(
		gift?.endDate
			? new Date(gift.endDate)
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
			const code = await generateGiftCode();
			setGiftCode(code);
		} catch (error) {
			console.error("Error generating code:", error);
			const localCode = `GIFT${Math.random()
				.toString(36)
				.substring(2, 6)
				.toUpperCase()}`;
			setGiftCode(localCode);
		}
	};

	useEffect(() => {
		if (mode === "create" && !giftCode) {
			generateCode();
		}
	}, [mode, giftCode]);

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
			setGiftType(GiftType.FREE_TRIAL);
			setDurationDays(7);
			setGiftAppliesTo(DiscountApplicability.ALL);
			setSelectedTiers([]);
			setIsPublic(false);
			setStartDate(new Date());
			setStartTime(new Date());
			const thirtyDaysFromNow = new Date();
			thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
			setEndDate(thirtyDaysFromNow);
			setEndTime(thirtyDaysFromNow);
		} else if (gift) {
			setName(gift.title);
			setGiftCode(gift.code);
			setDescription(gift.description || "");
			setGiftType(gift.giftType);
			setDurationDays(gift.durationDays);
			setGiftAppliesTo(gift.applicableTo);
			setSelectedTiers(gift.applicableTiers?.map((tier) => tier.id) || []);
			setIsPublic(gift.isPublic);
			setStartDate(new Date(gift.startDate));
			setStartTime(new Date(gift.startDate));
			setEndDate(new Date(gift.endDate));
			setEndTime(new Date(gift.endDate));
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

		if (!giftCode) {
			toaster.create({
				title: "Gift code is required",
				type: "error",
				duration: 3000,
			});
			return;
		}

		if (
			giftAppliesTo === DiscountApplicability.SELECTED &&
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
				const newGift: CreateGiftDto = {
					title: name,
					code: giftCode,
					description,
					giftType,
					durationDays,
					applicableTo: giftAppliesTo,
					applicableTiers:
						giftAppliesTo === DiscountApplicability.SELECTED
							? selectedTiers
							: undefined,
					startDate: combinedStartDate.toISOString(),
					endDate: combinedEndDate.toISOString(),
					isPublic,
				};

				await createGift(newGift);
				toaster.create({
					title: "Gift created successfully",
					type: "success",
					duration: 3000,
				});
			} else if (gift) {
				const updatedGift = {
					title: name,
					description,
					giftType,
					durationDays,
					applicableTo: giftAppliesTo,
					applicableTiers:
						giftAppliesTo === DiscountApplicability.SELECTED
							? selectedTiers
							: undefined,
					startDate: combinedStartDate.toISOString(),
					endDate: combinedEndDate.toISOString(),
					isPublic,
				};

				await updateGift(gift.id, updatedGift);
				toaster.create({
					title: "Gift updated successfully",
					type: "success",
					duration: 3000,
				});
			}

			if (onSaveCallback) {
				onSaveCallback();
			}

			handleClose();
		} catch (error: any) {
			console.error("Error saving gift:", error);
			toaster.create({
				title: "Error saving gift",
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
						{mode === "create" ? "Create new gift" : "Edit gift"}
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
									placeholder="Name of the gift"
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
										value={giftCode}
										onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
										placeholder="Gift code"
										maxLength={8}
									/>
								</InputGroup>
							</Field>
						</Flex>
						<Field label="Description">
							<Input
								placeholder="Short description of this gift"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</Field>
						<Field label="Gift Type">
							<RadioGroup
								value={giftType}
								onChange={(e) => {
									//@ts-ignore
									setGiftType(e.target.value as GiftType);
								}}
							>
								<Stack gap={3}>
									<Radio value={GiftType.FREE_TRIAL}>
										Free Trial (limited time access)
									</Radio>
									<Radio value={GiftType.FREE_CONTENT} disabled>
										Free Content (coming soon)
									</Radio>
								</Stack>
							</RadioGroup>
						</Field>
						{giftType === GiftType.FREE_TRIAL && (
							<Field label="Duration (days)">
								<NumberInput.Root
									value={String(durationDays)}
									onChange={(e) => {
										//@ts-ignore
										const value = parseInt(e.value);
										if (!isNaN(value)) {
											setDurationDays(value);
										}
									}}
									min={1}
									max={90}
								>
									<NumberInput.Control>
										<NumberInput.IncrementTrigger />
										<NumberInput.DecrementTrigger />
									</NumberInput.Control>
									<NumberInput.Input placeholder="Number of days for free trial" />
								</NumberInput.Root>
							</Field>
						)}
						<Field label="Applies to">
							<RadioGroup
								value={giftAppliesTo}
								onChange={(e) => {
									//@ts-ignore
									setGiftAppliesTo(e.target.value as DiscountApplicability);
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
						{giftAppliesTo === DiscountApplicability.SELECTED &&
							memberships?.memberships && (
								<Field label="Select tiers">
									<Stack gap={2}>
										{memberships.memberships.map((tier) => (
											<Flex key={tier.id} alignItems="center" gap={2}>
												<input
													type="checkbox"
													id={`tier-${tier.id}`}
													checked={selectedTiers.includes(tier.id)}
													onChange={(e) => {
														if (e.target.checked) {
															setSelectedTiers((prev) => [...prev, tier.id]);
														} else {
															setSelectedTiers((prev) =>
																prev.filter((id) => id !== tier.id)
															);
														}
													}}
												/>
												<label htmlFor={`tier-${tier.id}`}>
													{tier.name} (${tier.monthlyRate}/month)
												</label>
											</Flex>
										))}
									</Stack>
								</Field>
							)}
						<Flex justifyContent={"space-between"}>
							<Stack>
								<Text fontWeight={"600"}>Display this gift publicly</Text>
								<Text color={"star.600"} fontSize={"sm"}>
									Anyone (except paid members) can see this gift
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
						{mode === "create" ? "Create gift" : "Save gift"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</DialogRoot>
	);
};

export default GiftModal;
