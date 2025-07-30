import { useMemo, useState } from 'react'

export interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
}

export interface PaginationState {
  page: number
  pageSize: number
  offset: number
}

export interface PaginationControls {
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  goToFirstPage: () => void
  goToLastPage: (totalPages: number) => void
  setPageSize: (size: number) => void
  canGoToNextPage: (totalPages: number) => boolean
  canGoToPreviousPage: boolean
}

export interface UsePaginationReturn extends PaginationState, PaginationControls {
  pageSizeOptions: number[]
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100]
}: PaginationOptions = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize])

  const goToPage = (newPage: number) => {
    setPage(Math.max(1, newPage))
  }

  const goToNextPage = () => {
    setPage(prev => prev + 1)
  }

  const goToPreviousPage = () => {
    setPage(prev => Math.max(1, prev - 1))
  }

  const goToFirstPage = () => {
    setPage(1)
  }

  const goToLastPage = (totalPages: number) => {
    setPage(Math.max(1, totalPages))
  }

  const setPageSize = (size: number) => {
    setPageSizeState(size)
    setPage(1) // Reset to first page when changing page size
  }

  const canGoToNextPage = (totalPages: number) => page < totalPages
  const canGoToPreviousPage = page > 1

  return {
    page,
    pageSize,
    offset,
    pageSizeOptions,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setPageSize,
    canGoToNextPage,
    canGoToPreviousPage
  }
}