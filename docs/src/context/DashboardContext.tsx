import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type ModuleId =
  | "VLAData"
  | "VLANowFrame"
  | "UTCtoLSTConverter"
  | "LSTtoUTCConverter"
  | "VLAScheduleFrame"
  | "VLAAntennaFrame"
  | "VLAWebcam"
  | "VLAObsLogs";

export type LayoutMode = "auto" | "single" | "double" | "triple";

export interface ModuleSpan {
  col: number;
  row: number;
}

export type ModuleSpans = Partial<Record<ModuleId, ModuleSpan>>;

interface DashboardContextType {
  moduleOrder: ModuleId[];
  setModuleOrder: (order: ModuleId[]) => void;
  moveModule: (fromIndex: number, toIndex: number) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  moduleSpans: ModuleSpans;
  setModuleSpan: (moduleId: ModuleId, col: number, row: number) => void;
  resetOrder: () => void;
}

const DEFAULT_ORDER: ModuleId[] = [
  "VLAWebcam",
  "VLANowFrame",
  "VLAData",
  "VLAObsLogs",
  "VLAScheduleFrame",
  "UTCtoLSTConverter",
  "VLAAntennaFrame",
  "LSTtoUTCConverter",
];

const DEFAULT_SPANS: ModuleSpans = {
  VLAData: { col: 2, row: 1 },
  VLAWebcam: { col: 2, row: 1 },
  VLAScheduleFrame: { col: 2, row: 1 },
  VLAAntennaFrame: { col: 2, row: 1 },
  VLAObsLogs: { col: 2, row: 1 },
};

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
        const parsed = JSON.parse(decodeURIComponent(saved)) as ModuleId[];
        // Validate that all default modules are present
        const hasAllModules = DEFAULT_ORDER.every((id) => parsed.includes(id));
        const hasOnlyValidModules = parsed.every((id) => DEFAULT_ORDER.includes(id));
        if (Array.isArray(parsed) && hasAllModules && hasOnlyValidModules) {
          return parsed;
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

  const [moduleSpans, setModuleSpansState] = useState<ModuleSpans>(() => {
    const saved = getCookie("vla-module-spans");
    if (saved) {
      try {
        const parsed = JSON.parse(decodeURIComponent(saved));
        if (typeof parsed === "object" && parsed !== null) {
          // Migrate old format (number) to new format ({ col, row })
          const migrated: ModuleSpans = {};
          for (const [key, value] of Object.entries(parsed)) {
            if (typeof value === "number") {
              // Old format: just a number for col span
              migrated[key as ModuleId] = { col: value, row: 1 };
            } else if (typeof value === "object" && value !== null && "col" in value && "row" in value) {
              // New format: { col, row }
              migrated[key as ModuleId] = value as ModuleSpan;
            }
          }
          return migrated;
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_SPANS;
  });

  useEffect(() => {
    setCookie("vla-module-order", encodeURIComponent(JSON.stringify(moduleOrder)));
  }, [moduleOrder]);

  useEffect(() => {
    setCookie("vla-layout-mode", layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    setCookie("vla-module-spans", encodeURIComponent(JSON.stringify(moduleSpans)));
  }, [moduleSpans]);

  const setModuleOrder = (order: ModuleId[]) => setModuleOrderState(order);

  const moveModule = (fromIndex: number, toIndex: number) => {
    const newOrder = [...moduleOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);
    setModuleOrderState(newOrder);
  };

  const setLayoutMode = (mode: LayoutMode) => setLayoutModeState(mode);

  const setModuleSpan = (moduleId: ModuleId, col: number, row: number) => {
    setModuleSpansState((prev) => ({
      ...prev,
      [moduleId]: { col, row },
    }));
  };

  const resetOrder = () => {
    setModuleOrderState(DEFAULT_ORDER);
    setModuleSpansState(DEFAULT_SPANS);
  };

  return (
    <DashboardContext.Provider
      value={{ moduleOrder, setModuleOrder, moveModule, layoutMode, setLayoutMode, moduleSpans, setModuleSpan, resetOrder }}
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
