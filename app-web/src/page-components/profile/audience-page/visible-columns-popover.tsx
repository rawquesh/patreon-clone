/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Checkbox } from "@/components/ui/checkbox";
import {
	PopoverContent,
	PopoverRoot,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Flex, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

const VisibleColumnsPopover: React.FC<{
	visibleCols: {
		label: string;
		value: string;
		default: boolean;
	}[];
	setVisibleCols: React.Dispatch<
		React.SetStateAction<
			{
				label: string;
				value: string;
				default: boolean;
			}[]
		>
	>;
}> = ({ setVisibleCols, visibleCols }) => {
	return (
		<PopoverRoot>
			<PopoverTrigger ml={"auto"}>
				<Flex
					_hover={{
						bg: "gray.100",
					}}
					w={"40px"}
					h={"40px"}
					borderRadius={"999px"}
					justifyContent={"center"}
					alignItems={"center"}
					cursor={"pointer"}
				>
					<Icon width={"24px"} icon={"mingcute:settings-7-line"} />
				</Flex>
			</PopoverTrigger>
			<PopoverContent px={4} py={2}>
				<Text fontWeight={600}>Choose columns</Text>
				{visibleCols.map((col) => (
					<Checkbox
						py={"8px"}
						px={2}
						_hover={{
							bg: "gray.100",
						}}
						cursor={"pointer"}
						onChange={(e) => {
							setVisibleCols((prev) =>
								prev.map((v) =>
									v.value === col.value
										? //@ts-ignore
										  { ...v, default: e.target.checked }
										: v
								)
							);
						}}
						key={col.value}
						checked={col.default}
					>
						{col.label}
					</Checkbox>
				))}
			</PopoverContent>
		</PopoverRoot>
	);
};

export default VisibleColumnsPopover;
