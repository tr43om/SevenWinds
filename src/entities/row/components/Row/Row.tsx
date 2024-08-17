import { TreeRowResponse } from "@/entities/row";

import { Row, Table } from "@tanstack/react-table";
import { useTableStore } from "@/entities/row/store";
import { useFormContext } from "react-hook-form";
import * as S from "./Row.styled";
import { Cell } from "../Cell";

interface RowProps<TData> {
  row: Row<TData>;
  index: number;
  parentIndex: number | null;
  isLoading?: boolean;
}

const Row = ({
  row,
  index,
  parentIndex,
  isLoading = false,
}: RowProps<TreeRowResponse>) => {
  const rid = row.original.id;
  const form = useFormContext();

  const { setEditableRowIds, setMode, editableRowIds, mode } = useTableStore();

  return (
    <S.TableRow
      onDoubleClick={() => {
        setEditableRowIds({
          rid,
          parentId: row.getParentRow()?.original.id || null,
        });
        setMode("editing");
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <Cell
          cell={cell}
          row={row}
          index={index}
          isLoading={isLoading}
          parentIndex={parentIndex}
          key={cell.id}
        />
      ))}
    </S.TableRow>
  );
};

export { Row };
