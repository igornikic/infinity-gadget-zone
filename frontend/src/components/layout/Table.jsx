import React, { useState, useMemo } from "react";
import {
  // Basic
  useReactTable,
  flexRender,
  getCoreRowModel,
  createColumnHelper,
  // Sorting
  getSortedRowModel,
  // Filter
  getFilteredRowModel,
  // Pagination
  getPaginationRowModel,
} from "@tanstack/react-table";

import Pagination from "./Pagination";

import { SearchIcon } from "../../icons/NavIcons";
import "./Search.css";
import "./Table.css";

const columnHelper = createColumnHelper();

// ColumnDef
export const columnDef = [
  columnHelper.accessor("id", {
    acessoryKey: "id",
    header: "Id",
  }),
  {
    accessorKey: "first_name",
    header: "First Name",
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
];

const Table = ({ tableData }) => {
  const finalData = useMemo(() => tableData, []);
  const finalColumnDef = useMemo(() => columnDef, []);

  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState("");

  const table = useReactTable({
    columns: finalColumnDef,
    data: finalData,
    state: {
      sorting,
      globalFilter: filtering,
    },
    getCoreRowModel: getCoreRowModel(),
    // Sorting
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    // Filtering
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChanged: setFiltering,
    // Pagination
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  return (
    <div className="table-component">
      <div>
        {/* Pagination */}
        <Pagination table={table} />
        <br />
        <div className="filter-option">
          <span>Go to page:</span>
          {/* Go to page input field */}
          <input
            type="number"
            className="table-input"
            value={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
          />
        </div>
        <br />
        <div className="filter-option">
          {/* Total number of rows */}
          <span>
            Total Rows: {table.getPrePaginationRowModel().rows.length}
          </span>
          {/* Page size dropdown */}
          <select
            id="page-size-dropdown"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Search */}
      <div className="search-table">
        <div className="search">
          {/* Search input field */}
          <input
            type="search"
            id="search"
            name="search"
            value={filtering}
            placeholder="Search..."
            onChange={(e) => setFiltering(e.target.value)}
            autoComplete="on"
          />
          {/* Submit button */}
          <button type="submit" aria-label="Search" className="search-button">
            <SearchIcon />
          </button>
        </div>
      </div>
      {/* Table */}
      <div className="table-container">
        <table>
          {/* Table Heading */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div onClick={header.column.getToggleSortingHandler()}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " ▲",
                            desc: " ▼",
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          {/* Table body */}
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <br />
      {/* Current page */}
      <span>
        Page{" "}
        <strong>
          {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </strong>
      </span>
      {/* Pagination */}
      <Pagination table={table} />
    </div>
  );
};

export default Table;
