import CategoryPage from "./category-page";

type tParams = Promise<{ category: string }>;

const TopCreatorCategoryPage = async (props: { params: tParams }) => {
  const { category } = await props.params;

  return <CategoryPage category={category} />;
};

export default TopCreatorCategoryPage;
