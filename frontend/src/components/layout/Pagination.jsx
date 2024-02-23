import React, { useState, useEffect } from "react";

import "./Pagination.css";
import "./SecondaryBtn.css";

const Pagination = ({ table, pageCount, handlePageChange }) => {
  const [pageIndex, setPageIndex] = useState(0);
  const pageNumbers = [];
  const pagesToShow = 3;
  let currentPage;

  // Determine if pagination is for data table or other
  if (table) {
    currentPage = table.getState().pagination.pageIndex + 1;
    pageCount = table.getPageCount();
  } else {
    currentPage = pageIndex + 1;
  }

  // Functions to handle previous page navigation
  const getCanPreviousPage = () =>
    table ? table.getCanPreviousPage() : pageIndex > 0;
  const previousPage = () =>
    table
      ? table.previousPage()
      : setPageIndex((prevIndex) => Math.max(0, prevIndex - 1));

  // Functions to handle next page navigation
  const getCanNextPage = () =>
    table ? table.getCanNextPage() : pageIndex < pageCount - 1;
  const nextPage = () =>
    table
      ? table.nextPage()
      : setPageIndex((prevIndex) => Math.min(prevIndex + 1, pageCount - 1));

  useEffect(() => {
    // Notify the parent component when pageIndex changes in 1-based index
    if (typeof handlePageChange === "function") {
      handlePageChange(pageIndex + 1);
    }
  }, [pageIndex, handlePageChange]);

  const prevPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
  const next = Math.min(pageCount, prevPage + pagesToShow - 1);

  // Push 1 when on page greater than 1
  if (prevPage > 1) {
    pageNumbers.push(1);
  }

  // Push 2 instead of ... when on page 4
  if (currentPage === 4) {
    pageNumbers.push(2);
  }

  // Push ... on page number greater than 4
  if (currentPage > 4) {
    pageNumbers.push("...");
  }

  // Push (pageCount - 2) to pageNumbers array if on last page
  if (currentPage === pageCount && pageCount > 5) {
    pageNumbers.push(pageCount - 2);
  }

  // Push numbers
  for (let i = prevPage; i <= next; i++) {
    pageNumbers.push(i);
  }

  // Push (pageCount - 1) to pageNumbers array if on (pageCount - 3) page
  if (currentPage === pageCount - 3) {
    pageNumbers.push(pageCount - 1);
  }

  // Add right ... if current page is less than (pageCount - 3)
  if (currentPage < pageCount - 3) {
    pageNumbers.push("...");
  }

  // Push last page if we are not on it
  if (next < pageCount) {
    pageNumbers.push(pageCount);
  }

  return (
    <div className="pagination">
      <div className="pagination-order">
        {/* Go to first page */}
        <button
          className="rounded-circle"
          onClick={() => (table ? table.setPageIndex(0) : setPageIndex(0))}
          disabled={!getCanPreviousPage()}
        >
          {"<<"}
        </button>
        {/* Prev page */}
        <button onClick={previousPage} disabled={!getCanPreviousPage()}>
          {"<"}
        </button>
      </div>
      <div className="pagination-order">
        {/* Pagination numbers */}
        {pageNumbers.map((pageNum, index) => (
          <button
            key={index}
            className={
              typeof pageNum === "number" && pageNum === currentPage
                ? "secondary-btn"
                : ""
            }
            onClick={() => {
              if (typeof pageNum === "number" && !table) {
                setPageIndex(pageNum - 1);
              }
              if (typeof pageNum === "number" && table) {
                table.setPageIndex(pageNum - 1);
              }
            }}
            disabled={
              typeof pageNum === "number" ? pageNum === currentPage : true
            }
          >
            {pageNum}
          </button>
        ))}
      </div>
      <div className="pagination-order">
        {/* Next page */}
        <button onClick={nextPage} disabled={!getCanNextPage()}>
          {">"}
        </button>
        {/* Go to last page */}
        <button
          className="rounded-circle"
          onClick={() =>
            table
              ? table.setPageIndex(table.getPageCount() - 1)
              : setPageIndex(pageCount - 1)
          }
          disabled={!getCanNextPage()}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
