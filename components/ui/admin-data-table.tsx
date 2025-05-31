"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LuPencil,
  LuTrash2,
  LuPlus,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import Link from "next/link";

interface Column<T = any> {
  header: string;
  accessorKey: string;
  cell?: (props: { row: T }) => React.ReactNode;
}

interface AdminDataTableProps {
  columns: Column[];
  data: any[];
  onDelete: (id: string) => void;
  createLink?: string;
  editPathPrefix?: string;
  searchPlaceholder?: string;
  showCreateButton?: boolean;
  showDeleteButton?: boolean;
  showActionsColumn?: boolean;
  itemsPerPage?: number;
}

export function AdminDataTable({
  columns,
  data,
  onDelete,
  createLink = "",
  editPathPrefix = "",
  searchPlaceholder = "Buscar...",
  showCreateButton = true,
  showDeleteButton = true,
  showActionsColumn = true,
  itemsPerPage = 10,
}: AdminDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="max-w-sm"
        />
        {showCreateButton && createLink && (
          <Link href={createLink}>
            <Button className="bg-mint-green hover:bg-accent-green hover:text-mint-green">
              <LuPlus className="mr-2" />
              Crear Nuevo
            </Button>
          </Link>
        )}
      </div>
      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessorKey}>{column.header}</TableHead>
              ))}
              {showActionsColumn && (editPathPrefix || showDeleteButton) && (
                <TableHead>Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (showActionsColumn && (editPathPrefix || showDeleteButton)
                      ? 1
                      : 0)
                  }
                  className="text-center h-32"
                >
                  No hay elementos para mostrar
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey}>
                      {column.cell
                        ? column.cell({ row })
                        : row[column.accessorKey]}
                    </TableCell>
                  ))}
                  {showActionsColumn &&
                    (editPathPrefix || showDeleteButton) && (
                      <TableCell>
                        <div className="flex space-x-2">
                          {editPathPrefix && (
                            <Link href={`${editPathPrefix}/${row.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-mint-green hover:text-white hover:bg-mint-green border-mint-green"
                              >
                                <LuPencil className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {showDeleteButton && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-white hover:bg-red-600 border-red-600"
                              onClick={() => onDelete(row.id)}
                            >
                              <LuTrash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>{" "}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </p>
            <p className="text-sm text-gray-500">
              ({startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
              {filteredData.length} elementos)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="hidden sm:flex"
              >
                Primera
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <LuChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <LuChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="hidden sm:flex"
              >
                Última
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
