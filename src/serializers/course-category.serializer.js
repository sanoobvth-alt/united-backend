export const courseCategorySerializer = (category) => {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};
