import React, { useState, useEffect } from "react";
import { Box, Input, PopoverTrigger, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { PopoverContent, PopoverRoot } from "@/components/ui/popover";
import { InputGroup } from "./input-group";
import { Icon } from "@iconify/react/dist/iconify.js";

interface TimePickerProps {
	selected?: Date;
	onChange?: (date: Date) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ selected, onChange }) => {
	const [selectedTime, setSelectedTime] = useState<string>(
		selected ? dayjs(selected).format("hh:mm A") : dayjs().format("hh:mm A")
	);

	useEffect(() => {
		if (selected) {
			setSelectedTime(dayjs(selected).format("hh:mm A"));
		}
	}, [selected]);

	const generateTimeOptions = () => {
		const times: string[] = [];
		for (let hour = 0; hour < 24; hour++) {
			for (let minute = 0; minute < 60; minute += 15) {
				times.push(dayjs().hour(hour).minute(minute).format("hh:mm A"));
			}
		}
		return times;
	};

	const handleTimeSelect = (time: string) => {
		setSelectedTime(time);

		if (onChange) {
			// Create a new date preserving the current date but updating the time
			const [timeStr, period] = time.split(" ");
			const [hours, minutes] = timeStr.split(":").map(Number);

			// Adjust for AM/PM
			let adjustedHours = hours;
			if (period === "PM" && hours !== 12) {
				adjustedHours += 12;
			} else if (period === "AM" && hours === 12) {
				adjustedHours = 0;
			}

			const newDate = selected ? new Date(selected) : new Date();
			newDate.setHours(adjustedHours, minutes, 0, 0);

			onChange(newDate);
		}
	};

	return (
		<PopoverRoot>
			<PopoverTrigger w={"100%"}>
				<InputGroup
					w={"100%"}
					endElement={<Icon icon={"mingcute:time-fill"} />}
				>
					<Input
						w={"100%"}
						onChange={(e) => {
							setSelectedTime(e.target.value);
						}}
						value={selectedTime}
						readOnly
					/>
				</InputGroup>
			</PopoverTrigger>
			<PopoverContent w="150px" p={2}>
				<VStack gap={1} align="stretch" maxH="200px" overflowY="auto">
					{generateTimeOptions().map((time) => (
						<Box
							key={time}
							p={2}
							textAlign="center"
							borderRadius="md"
							bg={time === selectedTime ? "purple.100" : undefined}
							cursor="pointer"
							_hover={{ bg: "purple.50" }}
							onClick={() => handleTimeSelect(time)}
						>
							{time}
						</Box>
					))}
				</VStack>
			</PopoverContent>
		</PopoverRoot>
	);
};

export default TimePicker;
