export interface PaginationResult<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Data fetched successfully',
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}
