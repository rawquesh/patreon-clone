import { Grid, Stack } from "@chakra-ui/react";
import React, { Suspense } from "react";
import ExploreSearchBar from "../search-bar";
import ExplorerBreadcrumbs from "./explorer-breadcrumbs";
import { creatorsData } from "@/utils/creators-data";
import CreatorCard from "@/components/ui/creator-card";
import ExplorerPagination from "./explorer-pagination";

const ExploreCreatorsPage: React.FC = () => {
	return (
		<Stack py={"47px"} gap={8} px={{ base: "10px", md: "51px" }}>
			<ExploreSearchBar />
			<Suspense>
				<ExplorerBreadcrumbs />
			</Suspense>
			<Grid
				gap={{ base: "8px" }}
				css={{
					gridTemplateColumns: {
						base: "repeat(2, minmax(0px, 1fr))",
						sm: "repeat(auto-fill, minmax(200px, 1fr))",
					},
				}}
			>
				{creatorsData.map((creator) => (
					<CreatorCard
						key={creator.id}
						description={creator.description}
						href={`#`}
						image={creator.image}
						name={creator.name}
					/>
				))}
				{creatorsData.map((creator) => (
					<CreatorCard
						key={creator.id}
						description={creator.description}
						href={`#`}
						image={creator.image}
						name={creator.name}
					/>
				))}
			</Grid>
			<ExplorerPagination />
		</Stack>
	);
};

export default ExploreCreatorsPage;
