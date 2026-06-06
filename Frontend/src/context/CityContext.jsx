import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";

const FALLBACK_CITY = "Ahmedabad";
const STORAGE_KEY = "selectedCity";

const CityContext = createContext(null);

export function CityProvider({ children }) {
  const [city, setCityState] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEY) || "";
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  // First-visit picker is non-dismissable until a city is chosen.
  const [firstVisit, setFirstVisit] = useState(false);

  // Pull the city list once on mount.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/cinemas/cities");
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        if (!alive) return;
        setCities(list);

        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          if (list.length > 0) {
            // No previous city — show the modal so the user picks one.
            setIsOpen(true);
            setFirstVisit(true);
          } else {
            // No list either — fall back so the rest of the app keeps working.
            setCityState(FALLBACK_CITY);
            localStorage.setItem(STORAGE_KEY, FALLBACK_CITY);
          }
        }
      } catch (err) {
        if (!alive) return;
        // API failed and nothing stored — fall back so we don't break downstream
        // components that rely on a city being present.
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setCityState(FALLBACK_CITY);
          localStorage.setItem(STORAGE_KEY, FALLBACK_CITY);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const setCity = useCallback((next) => {
    if (!next) return;
    setCityState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore quota / privacy mode errors — context state is still authoritative.
    }
    // Keep the legacy event around for any consumer that hasn't migrated yet.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("city-changed"));
    }
  }, []);

  const openPicker = useCallback(() => {
    setFirstVisit(false);
    setIsOpen(true);
  }, []);

  const closePicker = useCallback(() => {
    // Only honor close if it's not the first-visit modal.
    setIsOpen(false);
    setFirstVisit(false);
  }, []);

  const pickAndClose = useCallback(
    (next) => {
      setCity(next);
      setIsOpen(false);
      setFirstVisit(false);
    },
    [setCity]
  );

  const value = useMemo(
    () => ({
      city: city || FALLBACK_CITY,
      cities,
      loading,
      isOpen,
      firstVisit,
      setCity,
      pickAndClose,
      openPicker,
      closePicker,
    }),
    [
      city,
      cities,
      loading,
      isOpen,
      firstVisit,
      setCity,
      pickAndClose,
      openPicker,
      closePicker,
    ]
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used inside CityProvider");
  return ctx;
}
