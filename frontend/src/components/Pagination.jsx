// src/components/Pagination.jsx
import React from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];

  // show a compacted set if many pages
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center gap-2" aria-label="Paginação">
      <button
        className="px-3 py-1 rounded-md border bg-[#0f1216] text-gray-300 disabled:opacity-50"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="Ir para primeira página"
      >
        «
      </button>

      <button
        className="px-3 py-1 rounded-md border bg-[#0f1216] text-gray-300 disabled:opacity-50"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        ‹
      </button>

      {start > 1 && (
        <span className="px-2 text-gray-400">…</span>
      )}

      {pages.map((n) => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          className={`px-3 py-1 rounded-md border ${n === currentPage ? "bg-blue-600 text-white" : "bg-[#0f1216] text-gray-300"}`}
          aria-current={n === currentPage ? "page" : undefined}
        >
          {n}
        </button>
      ))}

      {end < totalPages && <span className="px-2 text-gray-400">…</span>}

      <button
        className="px-3 py-1 rounded-md border bg-[#0f1216] text-gray-300 disabled:opacity-50"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
      >
        ›
      </button>

      <button
        className="px-3 py-1 rounded-md border bg-[#0f1216] text-gray-300 disabled:opacity-50"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Última página"
      >
        »
      </button>
    </nav>
  );
}
