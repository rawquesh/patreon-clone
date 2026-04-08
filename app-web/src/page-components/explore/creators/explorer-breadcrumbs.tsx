"use client";
import {
	BreadcrumbCurrentLink,
	BreadcrumbLink,
	BreadcrumbRoot,
} from "@/components/ui/breadcrumb";
import { Flex } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSearchParams } from "next/navigation";

const ExplorerBreadcrumbs = () => {
	const searchParams = useSearchParams();

	const key = searchParams.get("key") || "";
	const cleanedUpKey = key?.split("-").join(" ");

	return (
		<Flex justifyContent={"center"}>
			<BreadcrumbRoot
				fontSize={"xl"}
				fontWeight={500}
				separator={<Icon icon={"heroicons:slash-solid"} />}
			>
				<BreadcrumbLink href="#">Explore</BreadcrumbLink>
				<BreadcrumbLink href="#">Creators</BreadcrumbLink>
				<BreadcrumbCurrentLink textTransform={"capitalize"}>
					{cleanedUpKey}
				</BreadcrumbCurrentLink>
			</BreadcrumbRoot>
		</Flex>
	);
};

export default ExplorerBreadcrumbs;
