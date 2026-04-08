import React, { useState, useEffect } from "react";
import {
	Box,
	Flex,
	Grid,
	IconButton,
	Input,
	PopoverTrigger,
	Text,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { PopoverRoot, PopoverContent } from "@/components/ui/popover";
import { InputGroup } from "./input-group";
import { Icon } from "@iconify/react/dist/iconify.js";

interface DatePickerProps {
	selected?: Date;
	onChange?: (date: Date) => void;
	minDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
	selected,
	onChange,
	minDate,
}) => {
	const [selectedDate, setSelectedDate] = useState<string>(
		selected
			? dayjs(selected).format("YYYY-MM-DD")
			: dayjs().format("YYYY-MM-DD")
	);
	const [currentMonth, setCurrentMonth] = useState(
		selected ? dayjs(selected).startOf("month") : dayjs().startOf("month")
	);

	useEffect(() => {
		if (selected) {
			setSelectedDate(dayjs(selected).format("YYYY-MM-DD"));
			setCurrentMonth(dayjs(selected).startOf("month"));
		}
	}, [selected]);

	const handleDateSelect = (date: dayjs.Dayjs) => {
		const newDate = date.toDate();
		setSelectedDate(date.format("YYYY-MM-DD"));

		if (onChange) {
			onChange(newDate);
		}
	};

	const isDateDisabled = (date: dayjs.Dayjs | null): boolean => {
		if (!date || !minDate) return false;
		return date.isBefore(dayjs(minDate), "day");
	};

	const renderDaysInMonth = () => {
		const startOfMonth = currentMonth.startOf("month");
		const endOfMonth = currentMonth.endOf("month");
		const startDay = startOfMonth.day(); // Sunday = 0, Monday = 1, ...
		const daysInMonth = Array(endOfMonth.date())
			.fill(null)
			.map((_, i) => startOfMonth.add(i, "day"));

		const gridDays = Array(startDay).fill(null).concat(daysInMonth);

		return gridDays.map((day, index) => {
			const isDisabled = isDateDisabled(day);

			return (
				<Box
					key={index}
					textAlign="center"
					bg={
						day && day.format("YYYY-MM-DD") === selectedDate
							? "purple.300"
							: day?.isSame(dayjs(), "day")
							? "purple.100"
							: undefined
					}
					borderRadius="md"
					color={day ? (isDisabled ? "gray.300" : "black") : "gray.300"}
					cursor={day && !isDisabled ? "pointer" : "not-allowed"}
					p={2}
					onClick={() => day && !isDisabled && handleDateSelect(day)}
					opacity={isDisabled ? 0.5 : 1}
				>
					{day ? day.date() : ""}
				</Box>
			);
		});
	};

	return (
		<PopoverRoot>
			<PopoverTrigger w={"100%"}>
				<InputGroup
					w={"100%"}
					endElement={<Icon icon={"solar:calendar-bold"} />}
				>
					<Input
						value={dayjs(selectedDate).format("YYYY-MM-DD")}
						readOnly
						placeholder="Select date"
						w={"100%"}
					/>
				</InputGroup>
			</PopoverTrigger>
			<PopoverContent w="300px" p={4}>
				<Flex justify="space-between" align="center" mb={4}>
					<IconButton
						aria-label="Previous Month"
						onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
						size="sm"
					>
						<Icon icon={"icon-park-outline:left"} />
					</IconButton>
					<Text fontWeight="bold">{currentMonth.format("MMMM YYYY")}</Text>
					<IconButton
						aria-label="Next Month"
						onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
						size="sm"
					>
						<Icon icon={"icon-park-outline:right"} />
					</IconButton>
				</Flex>
				<Grid templateColumns="repeat(7, 1fr)" gap={2}>
					{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
						<Text key={day} textAlign="center" fontWeight="bold">
							{day}
						</Text>
					))}
					{renderDaysInMonth()}
				</Grid>
			</PopoverContent>
		</PopoverRoot>
	);
};

export default DatePicker;
