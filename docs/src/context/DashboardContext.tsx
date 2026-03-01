import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type ModuleId =
  | "VLAData"
  | "VLANowFrame"
  | "UTCtoLSTConverter"
  | "LSTtoUTCConverter"
  | "VLAScheduleFrame"
  | "VLAAntennaFrame";

export type LayoutMode = "auto" | "single" | "double" | "triple";

interface DashboardContextType {
  moduleOrder: ModuleId[];
  setModuleOrder: (order: ModuleId[]) => void;
  moveModule: (fromIndex: number, toIndex: number) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  resetOrder: () => void;
}

const DEFAULT_ORDER: ModuleId[] = [
  "VLAData",
  "VLANowFrame",
  "UTCtoLSTConverter",
  "LSTtoUTCConverter",
  "VLAScheduleFrame",
  "VLAAntennaFrame",
];

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [moduleOrder, setModuleOrderState] = useState<ModuleId[]>(() => {
    const saved = getCookie("vla-module-order");
    if (saved) {
      try {
        const parsed = JSON.parse(decodeURIComponent(saved));
        if (Array.isArray(parsed) && parsed.length === DEFAULT_ORDER.length) {
          return parsed as ModuleId[];
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_ORDER;
  });

  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(() => {
    const saved = getCookie("vla-layout-mode");
    if (saved === "auto" || saved === "single" || saved === "double" || saved === "triple") return saved;
    return "auto";
  });

  useEffect(() => {
    setCookie("vla-module-order", encodeURIComponent(JSON.stringify(moduleOrder)));
  }, [moduleOrder]);

  useEffect(() => {
    setCookie("vla-layout-mode", layoutMode);
  }, [layoutMode]);

  const setModuleOrder = (order: ModuleId[]) => setModuleOrderState(order);

  const moveModule = (fromIndex: number, toIndex: number) => {
    const newOrder = [...moduleOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setModuleOrderState(newOrder);
  };

  const setLayoutMode = (mode: LayoutMode) => setLayoutModeState(mode);

  const resetOrder = () => setModuleOrderState(DEFAULT_ORDER);

  return (
    <DashboardContext.Provider
      value={{ moduleOrder, setModuleOrder, moveModule, layoutMode, setLayoutMode, resetOrder }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

export { DEFAULT_ORDER };
