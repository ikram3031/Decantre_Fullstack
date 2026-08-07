import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange, isLight = false, className = '' }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }

    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i += 1) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const baseButtonClass = `flex h-9 min-w-9 items-center justify-center rounded-[4px] border px-3 text-sm font-medium transition-all`;
  const activeButtonClass = isLight
    ? 'border-gold bg-gold text-black shadow-sm'
    : 'border-gold bg-gold text-black shadow-sm';
  const defaultButtonClass = isLight
    ? 'border-zinc-300 text-zinc-700 hover:border-gold hover:bg-gold/10 hover:text-gold'
    : 'border-gold/20 bg-luxury-dark/40 text-zinc-300 hover:border-gold hover:text-gold';

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`.trim()}>
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`${baseButtonClass} ${isLight ? 'border-zinc-300 text-zinc-600' : 'border-gold/20 text-zinc-400'} disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageNumbers.map((page, index) => {
        const isCurrentPage = page === currentPage;
        const isEllipsis = page === '...';

        return (
          <button
            key={`${page}-${index}`}
            type="button"
            disabled={isEllipsis}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`${baseButtonClass} ${isEllipsis ? 'cursor-default border-transparent text-zinc-500' : isCurrentPage ? activeButtonClass : defaultButtonClass}`}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`${baseButtonClass} ${isLight ? 'border-zinc-300 text-zinc-600' : 'border-gold/20 text-zinc-400'} disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
