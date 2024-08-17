import { useMutation, useQuery } from "@tanstack/react-query";
import { rowModel, rowTypes } from ".";
import { httpRequest } from "@/shared/lib/axios";
import { queryClient } from "@/shared/react-query";
import { applyUpdates, deleteRow, insertRow } from "./utils";

const list = async () => {
  const res = await httpRequest<rowTypes.TreeRowResponse[]>({
    method: "get",
    url: rowModel.ENDPOINTS.get(),
  });

  return res;
};

const update = async (data: rowTypes.RowUpdate, rid: rowTypes.RowId) => {
  const res = await httpRequest<rowTypes.RecalculateRowResponse>({
    method: "post",
    url: rowModel.ENDPOINTS.update(rid),
    data,
  });

  return res;
};

const remove = async (rid: rowTypes.RowId) => {
  const res = await httpRequest<rowTypes.RecalculateRowResponse>({
    method: "delete",
    url: rowModel.ENDPOINTS.delete(rid),
  });

  return res;
};

const create = async (data: rowTypes.RowRequest) => {
  const res = await httpRequest<rowTypes.RecalculateRowResponse>({
    method: "post",
    url: rowModel.ENDPOINTS.create(),
    data,
  });

  return res;
};

export function useRowsQuery() {
  return useQuery({
    queryKey: rowModel.QUERY_KEYS.root(),
    queryFn: list,
  });
}

export function useRowsUpdateMutation(rid: rowTypes.RowId) {
  return useMutation({
    mutationKey: rowModel.QUERY_KEYS.update(rid),
    mutationFn: async (data: rowTypes.RowUpdate) => update(data, rid),
    onSuccess(data, variables, context) {
      const { current, changed } = data;

      const list = queryClient.getQueryData<rowTypes.TreeRowResponse[]>(
        rowModel.QUERY_KEYS.root()
      );

      if (!list) return;

      const updatedList = applyUpdates(list, current, changed);

      console.log({ data, variables, list, updatedList });

      queryClient.setQueryData(rowModel.QUERY_KEYS.root(), updatedList);
    },
  });
}

export function useRowsCreateMutation() {
  return useMutation({
    mutationKey: rowModel.QUERY_KEYS.create(),
    mutationFn: async (data: rowTypes.RowRequest) => create(data),
    onSuccess(data, variables, context) {
      const { current } = data;

      const list = queryClient.getQueryData<rowTypes.TreeRowResponse[]>(
        rowModel.QUERY_KEYS.root()
      );

      if (!list) return;

      const newTreeRow: rowTypes.TreeRowResponse = { ...current, child: [] };
      const updatedList = insertRow(list, newTreeRow, variables.parentId!);

      console.log({ updatedList, newTreeRow });

      queryClient.setQueryData(rowModel.QUERY_KEYS.root(), updatedList);
    },
  });
}

export function useRowsDeleteMutation(rid: rowTypes.RowId) {
  return useMutation({
    mutationKey: rowModel.QUERY_KEYS.delete(rid),
    mutationFn: async () => remove(rid), // Assume `remove` is an API call to delete the row
    onSuccess(data, variables, context) {
      const list = queryClient.getQueryData<rowTypes.TreeRowResponse[]>(
        rowModel.QUERY_KEYS.root()
      );

      if (!list) return;

      const updatedList = deleteRow(list, rid);

      queryClient.setQueryData(rowModel.QUERY_KEYS.root(), updatedList);
    },
  });
}
