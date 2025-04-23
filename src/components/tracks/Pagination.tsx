import {
  Pagination,
  PaginationContent,
  // PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { FC } from 'react';

export const PagePagination: FC<{
  curPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ curPage, totalPages, onPageChange }) => {
  return (
    <Pagination data-testid="pagination">
      <PaginationContent>
        <PaginationItem onClick={() => onPageChange(Math.max(curPage - 1, 1))}>
          <PaginationPrevious href="#" data-testid="pagination-prev" />
        </PaginationItem>

        {Array.from({ length: curPage - 1 }, (_, i) => i + 1).map((p) => (
          <PaginationItem key={p} onClick={() => onPageChange(p)}>
            <PaginationLink href="#">{p}</PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationLink href="#" isActive>
            {curPage}
          </PaginationLink>
        </PaginationItem>

        {Array.from({ length: totalPages - curPage }, (_, i) => curPage + 1 + i).map((p) => (
          <PaginationItem key={p} onClick={() => onPageChange(p)}>
            <PaginationLink href="#">{p}</PaginationLink>
          </PaginationItem>
        ))}

        {/* <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem> */}

        <PaginationItem onClick={() => onPageChange(Math.min(curPage + 1, totalPages))}>
          <PaginationNext href="#" data-testid="pagination-next" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
