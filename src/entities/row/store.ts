import { create } from "zustand";
import { rowTypes } from "./utils";

type ModeType = "editing" | "creation" | "none";
type Ids = {
  rid: rowTypes.RowId | undefined;
  parentId: rowTypes.RowParentId | undefined;
};

type Store = {
  editableRowIds?: Ids | null;
  mode?: ModeType;
  setEditableRowIds: (variables: Ids | null) => void; // Updated type definition
  setMode: (mode: ModeType | undefined) => void; // Updated type definition
};

const useTableStore = create<Store>((set) => ({
  mode: "none",

  setEditableRowIds: (variables) =>
    set(() => ({
      editableRowIds: {
        rid: variables?.rid,
        parentId: variables?.parentId || null,
      },
    })),
  setMode: (mode) => set(() => ({ mode })),
}));

export { useTableStore };
