export function getPaginationParams(
  page: number = 1, // Default value to 1 if page is undefined
  pageSize: number = 10, // Default value to 10 if pageSize is undefined
  totalItems: number,
) {
  // Asegúrate de que page y pageSize sean números enteros
  page = Math.max(parseInt(String(page), 10), 1); // Asegura que sea al menos 1
  pageSize = Math.max(parseInt(String(pageSize), 10), 1); // Asegura que sea al menos 1

  const skip = (page - 1) * pageSize;
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    skip,
    take: pageSize,
    totalItems,
    totalPages,
  };
}
