import { rowModel, rowTypes } from "@/entities/row";
import { Row, Table } from "@tanstack/react-table";

// Utility function to delete a row from a nested structure
const deleteRow = (
  rows: rowTypes.TreeRowResponse[],
  rowIdToDelete: rowTypes.RowId
): rowTypes.TreeRowResponse[] => {
  return rows.reduce<rowTypes.TreeRowResponse[]>((acc, row) => {
    if (row.id === rowIdToDelete) {
      // If the current row is the one to delete, skip it
      return acc;
    } else if (row.child && row.child.length > 0) {
      // If the current row has children, recursively delete in children
      const updatedChildren = deleteRow(row.child, rowIdToDelete);
      if (updatedChildren.length > 0) {
        acc.push({ ...row, child: updatedChildren });
      } else {
        acc.push({ ...row, child: [] });
      }
    } else {
      acc.push(row);
    }
    return acc;
  }, []);
};

function createOutlayBlankRow(
  tree: rowTypes.TreeRowResponse[],
  parentId: rowTypes.RowId | null
): rowTypes.TreeRowResponse[] {
  const blank: rowTypes.TreeRowResponse = {
    id: "creation",
    rowName: "",
    child: [],
    salary: 0,
    overheads: 0,
    estimatedProfit: 0,
    equipmentCosts: 0,
    machineOperatorSalary: 0,
    mainCosts: 0,
    materials: 0,
    mimExploitation: 0,
    supportCosts: 0,
    total: 0,
  };

  if (parentId === null) {
    tree.push(blank);
  }

  const node = searchNode(tree, parentId);
  if (node !== null) node.child.push(blank);

  return tree;
}

function searchNode(
  tree: rowTypes.TreeRowResponse[],
  id: rowTypes.RowId | null
): rowTypes.TreeRowResponse | null {
  const stack = [...tree];

  while (stack.length) {
    const node = stack.pop()!;
    if (node.id === id) return node;
    stack.push(...node.child);
  }

  return null;
}

// Utility function to insert a new row into a nested structure
const insertRow = (
  rows: rowTypes.TreeRowResponse[],
  rowToInsert: rowTypes.TreeRowResponse,
  parentId: rowTypes.RowId | null
): rowTypes.TreeRowResponse[] => {
  return rows.map((row) => {
    if (row.id === parentId) {
      return {
        ...row,
        child: row.child
          .concat(rowToInsert)
          .filter((row) => row.id !== "creation"), // Remove any placeholder row if needed
      };
    }

    if (row.child.length > 0) {
      return { ...row, child: insertRow(row.child, rowToInsert, parentId) };
    }

    return row; // Return the original row if no changes are needed
  });
};

// Function to update a single node within a tree using the searchNode method
const updateNode = (
  tree: rowTypes.TreeRowResponse[],
  id: rowTypes.RowId,
  updates: Partial<rowTypes.TreeRowResponse>
): rowTypes.TreeRowResponse[] => {
  const node = searchNode(tree, id);
  if (node) {
    Object.assign(node, updates);
  }
  return tree;
};

// Function to apply updates for current and changed nodes
const applyUpdates = (
  tree: rowTypes.TreeRowResponse[],
  current: rowTypes.RowResponse,
  changed: rowTypes.RowResponse[]
): rowTypes.TreeRowResponse[] => {
  // Update the current node
  let updatedTree = updateNode(tree, current.id, current);

  // Update any other changed nodes
  for (const change of changed) {
    updatedTree = updateNode(updatedTree, change.id, change);
  }

  return updatedTree;
};

const getParentIndex = (
  table: Table<rowTypes.TreeRowResponse>,
  row: Row<rowTypes.TreeRowResponse>
) =>
  table
    .getRowModel()
    .flatRows.findIndex(
      (flatRow) => flatRow.getParentRow()?.id === row.getParentRow()?.id
    );

export {
  applyUpdates,
  insertRow,
  rowModel,
  updateNode,
  rowTypes,
  searchNode,
  deleteRow,
  getParentIndex,
  createOutlayBlankRow,
};
