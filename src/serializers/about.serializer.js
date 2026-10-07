export const aboutSerializer = (about) => {
  return {
    id: about.id,
    title: about.title,
    description: about.description,
    image: about.image,
    status: about.status,
    createdAt: about.createdAt,
    updatedAt: about.updatedAt,
  };
};
