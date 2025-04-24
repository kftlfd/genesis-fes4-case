import { FC } from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const MAX_BUTTONS = 5;

const maxDirButtons = Math.floor(MAX_BUTTONS / 2);

type Props = {
  curPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const PagePagination: FC<Props> = ({ curPage, totalPages, onPageChange }) => {
  const prevPages = Array.from(
    { length: Math.min(curPage - 1, maxDirButtons) },
    (_, i) => curPage - i - 1,
  ).reverse();

  const nextPages = Array.from(
    { length: Math.min(totalPages - curPage, maxDirButtons) },
    (_, i) => curPage + 1 + i,
  );

  const pages = [...prevPages, curPage, ...nextPages];

  return (
    <Pagination data-testid="pagination">
      <PaginationContent>
        <PaginationItem onClick={() => onPageChange(Math.max(curPage - 1, 1))}>
          <PaginationPrevious href="#" data-testid="pagination-prev" />
        </PaginationItem>

        {pages.map((p) => (
          <PaginationItem key={p} onClick={() => onPageChange(p)}>
            <PaginationLink href="#" isActive={p === curPage}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem onClick={() => onPageChange(Math.min(curPage + 1, totalPages))}>
          <PaginationNext href="#" data-testid="pagination-next" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
