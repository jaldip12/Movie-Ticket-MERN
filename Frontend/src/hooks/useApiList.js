import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";

/**
 * useApiList — paginated admin list fetch + busy state + write helpers.
 *
 * Expects the API to return: { data: { items, total, pageCount, page } }
 *
 * Usage:
 *   const list = useApiList("/bookings", { params: { status }, pageSize: 20 });
 *   list.items, list.total, list.page, list.pageCount, list.loading,
 *   list.setPage(n), list.refetch(),
 *   list.busyId, list.setBusyId(id),
 *   list.patch(id, body, msg), list.remove(id, msg)
 */
export function useApiList(endpoint, options = {}) {
  const {
    params = {},
    pageSize = 20,
    refreshKey,
    method = "get",
    initialPage = 1,
  } = options;

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  // Stabilize params by serializing them; reset to page 1 when params change.
  const paramsKey = useMemo(() => JSON.stringify(params || {}), [params]);
  const previousParamsKey = useRef(paramsKey);

  const fetchPage = useCallback(
    async (pageNum) => {
      setLoading(true);
      try {
        const res = await api[method](endpoint, {
          params: { page: pageNum, limit: pageSize, ...params },
        });
        const data = res.data?.data || {};
        // Support both { items, total, pageCount, page } and array data.
        if (Array.isArray(data)) {
          setItems(data);
          setTotal(data.length);
          setPageCount(1);
          setPage(1);
        } else {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
          setPageCount(data.pageCount ?? 1);
          setPage(data.page ?? pageNum);
        }
      } catch (err) {
        console.error(`Error loading ${endpoint}:`, err);
        toast.error(
          err?.response?.data?.message || "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    },
    // We intentionally depend on paramsKey instead of params reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint, pageSize, paramsKey, method]
  );

  // Initial + params-change effect: reset to page 1 if params changed,
  // otherwise refetch the current page.
  useEffect(() => {
    if (previousParamsKey.current !== paramsKey) {
      previousParamsKey.current = paramsKey;
      setPage(1);
      fetchPage(1);
    } else {
      fetchPage(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, refreshKey]);

  // Page-change effect.
  useEffect(() => {
    if (previousParamsKey.current === paramsKey) {
      fetchPage(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const refetch = useCallback(() => fetchPage(page), [fetchPage, page]);

  const patch = useCallback(
    async (id, body, successMsg = "Updated") => {
      setBusyId(id);
      try {
        await api.patch(`${endpoint}/${id}`, body);
        toast.success(successMsg);
        await fetchPage(page);
      } catch (err) {
        console.error(`Error patching ${endpoint}/${id}:`, err);
        toast.error(
          err?.response?.data?.message || "Failed to update"
        );
      } finally {
        setBusyId(null);
      }
    },
    [endpoint, fetchPage, page]
  );

  const remove = useCallback(
    async (id, successMsg = "Deleted") => {
      setBusyId(id);
      try {
        await api.delete(`${endpoint}/${id}`);
        toast.success(successMsg);
        await fetchPage(page);
      } catch (err) {
        console.error(`Error deleting ${endpoint}/${id}:`, err);
        toast.error(
          err?.response?.data?.message || "Failed to delete"
        );
      } finally {
        setBusyId(null);
      }
    },
    [endpoint, fetchPage, page]
  );

  return {
    items,
    total,
    page,
    pageCount,
    loading,
    busyId,
    setBusyId,
    setItems,
    setPage,
    refetch,
    patch,
    remove,
  };
}

export default useApiList;
