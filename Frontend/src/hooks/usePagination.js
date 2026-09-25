import { useState } from "react";

export default function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);

  const goTo = (p) => setPage(p);
  const next = () => setPage((p) => p + 1);
  const prev = () => setPage((p) => Math.max(1, p - 1));
  const reset = () => setPage(1);

  return { page, limit, goTo, next, prev, reset };
}
