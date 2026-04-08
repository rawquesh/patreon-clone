"use client";
import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { categories } from "./data";
import { Icon } from "@iconify/react/dist/iconify.js";

const CategoriesFilter: React.FC = () => {
	const [activeCategory, setActiveCategory] = React.useState("all");

	return (
		<Flex className="no-scrollbar" overflowX={"scroll"} mt={3} maxW={"100%"}>
			{categories.map((category) => (
				<Flex
					// flexGrow={1}
					key={category.value}
					bg={activeCategory === category.value ? "star.800" : "star.100"}
					color={activeCategory === category.value ? "star.100" : "star.900"}
					border={"0.5px solid"}
					borderColor={"star.200"}
					p={"10px"}
					rounded={"8px"}
					mr={"10px"}
					minW={"41px"}
					minWidth={{ base: "max-content", md: "41px" }}
					cursor={"pointer"}
					as={"button"}
					_hover={{
						bg: activeCategory === category.value ? "star.800" : "star.200",
					}}
					onClick={() => setActiveCategory(category.value)}
					alignItems={"center"}
					gap={3}
				>
					<Text textWrap={"nowrap"}>{category.label}</Text>
					{category.value !== "all" && category.value === activeCategory && (
						<Icon icon={"lets-icons:close-round-fill"} />
					)}
				</Flex>
			))}
		</Flex>
	);
};

export default CategoriesFilter;
