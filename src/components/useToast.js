import { useState, useCallback, useRef } from "react";

export default function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const fireToast = useCallback((msg, type) => {
    setToast({ msg, type });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  return [toast, fireToast];
}
