import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from "@/shared/ui";
import { useFormContext } from "react-hook-form";
import { Cell, Row } from "@tanstack/react-table";
import { z } from "zod";
import { RowResponse } from "@/entities/row/schemas";
import * as S from "./Cell.styled";
import { useTableStore } from "../../store";
import { rowTypes } from "../../utils";
import { Controls } from "../Controls";
import { useCallback } from "react";
import { Skeleton } from "@mui/material";

interface CellProps<TData> {
  cell: Cell<TData, unknown>;
  row: Row<TData>;
  index: number;
  parentIndex: number | null;
  isLoading?: boolean;
}

const Cell = ({
  cell,
  row,
  index,
  parentIndex,
  isLoading = false,
}: CellProps<rowTypes.TreeRowResponse>) => {
  const cid = cell.column.id;
  const rid = row.original.id;
  const initialValue = cell.getValue() as number | string;
  const inputType = typeof initialValue === "number" ? "number" : "text";
  const accessorKey = cid as keyof z.infer<typeof RowResponse>;
  const { editableRowIds } = useTableStore();
  const activeRid = editableRowIds?.rid;
  const isEditing = activeRid === rid && cid !== "id";
  const form = useFormContext();

  // Memoized function to render the Controls component when `accessorKey` is "id"
  const renderControls = useCallback(
    () => (
      <Controls
        row={cell.row}
        key={`controls-${cell.row.id}`}
        index={index}
        parentIndex={parentIndex}
      />
    ),
    [cell.row, index, parentIndex]
  );

  // Memoized function to render the input field when `isEditing` is true
  const renderEditableField = useCallback(
    () => (
      <FormField
        control={form.control}
        name={accessorKey}
        defaultValue={initialValue}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input {...field} type={inputType} form={activeRid!.toString()} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    [accessorKey, form.control, initialValue, inputType, activeRid]
  );

  // Function to render cell content based on the `isEditing` state
  const renderCellContent = useCallback(() => {
    if (isLoading)
      return (
        <Skeleton
          height={20}
          sx={{ bgcolor: "grey.800" }}
          variant="rectangular"
          animation="wave"
        />
      );
    return isEditing ? renderEditableField() : initialValue;
  }, [isLoading, isEditing, renderEditableField, initialValue]);

  // Decide what to render based on the `accessorKey`
  if (accessorKey === "id") return renderControls();

  return (
    <S.TableCell key={`${cell.id}-${rid}`}>{renderCellContent()}</S.TableCell>
  );
};

export { Cell };
