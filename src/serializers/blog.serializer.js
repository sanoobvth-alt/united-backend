export const blogSerializer = (blog) => {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    description: blog.description,
    content: blog.content,
    image: blog.image,
    status: blog.status,
    category: blog.category
      ? {
          id: blog.category.id,
          name: blog.category.name,
          slug: blog.category.slug,
        }
      : null,
    tags: Array.isArray(blog.tags)
      ? blog.tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
        }))
      : [],
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
};
