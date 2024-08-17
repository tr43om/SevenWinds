import { Row } from "@tanstack/react-table";
import { FileIcon, LucideFile, LucideTrash } from "lucide-react";
import { FC } from "react";
import styled from "styled-components";
import { rowTypes, TreeRowResponse } from "../..";
import { useRowsDeleteMutation } from "../../queries";
import { useEmptyRowTrigger } from "../../hooks/useEmptyRowTrigger";
import { useTableStore } from "../../store";
import * as S from "./Controls.styled";
import { Delete, DeleteOutline, TextSnippet } from "@mui/icons-material";

interface ControlsProps<TData> {
  row: Row<rowTypes.TreeRowResponse>;
  index: number;
  parentIndex: number | null;
}

const Controls: FC<ControlsProps<any>> = ({ row, index, parentIndex }) => {
  const rid = row.original.id;
  const parentId = row.getParentRow()?.original.id || null;
  const { addEmptyRow } = useEmptyRowTrigger();
  const { editableRowIds, mode } = useTableStore();

  const { mutateAsync: deleteRow } = useRowsDeleteMutation(rid);
  // console.log({
  //   parentRowIndex: row.getParentRow()?.id,
  // });

  return (
    <S.Cell $depth={row.depth} $disabled={mode !== "none"}>
      <S.Node
        $depth={row.depth}
        $rowsToParent={parentIndex ? index + 1 - parentIndex : 0}
        $isActive={rid === editableRowIds?.rid}
      />
      <S.Controls $depth={row.depth}>
        <button
          type="submit"
          form={`${editableRowIds?.rid?.toString()}`}
          hidden
          aria-label="submit"
        />
        <S.CreateButton
          disabled={mode !== "none"}
          onClick={() => {
            addEmptyRow({
              parentId,
              rid,
            });
          }}
        >
          <TextSnippet />
        </S.CreateButton>
        <S.DeleteButton
          onClick={async () => await deleteRow()}
          disabled={mode !== "none"}
        >
          <Delete />
        </S.DeleteButton>
      </S.Controls>
    </S.Cell>
  );
};

export { Controls };
