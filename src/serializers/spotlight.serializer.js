export const spotlightSerializer = (spotlight) => {
  return {
    id: spotlight.id,
    title: spotlight.title,
    description: spotlight.description,
    image: spotlight.image,
    status: spotlight.status,
    createdAt: spotlight.createdAt,
    updatedAt: spotlight.updatedAt,
  };
};
