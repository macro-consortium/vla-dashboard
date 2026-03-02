import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type Telescope = "VLA" | "VLBA";

export type VLAModuleId =
  | "VLAData"
  | "VLANowFrame"
  | "UTCtoLSTConverter"
  | "LSTtoUTCConverter"
  | "VLAScheduleFrame"
  | "VLAAntennaFrame"
  | "VLAWebcam"
  | "VLAObsLogs"
  | "VLAConfigSchedule"
  | "VLAPressurePlot";

export type VLBAModuleId =
  | "VLBAData"
  | "VLBAWebcam"
  | "VLBAScheduleFrame"
  | "VLBADynamicQueue"
  | "VLBARecentlyObserved"
  | "UTCtoLSTConverter"
  | "LSTtoUTCConverter";

export type ModuleId = VLAModuleId | VLBAModuleId;

export type LayoutMode = "auto" | "single" | "double" | "triple" | "quad";

export interface ModuleSpan {
  col: number;
  row: number;
}

export type ModuleSpans = Partial<Record<ModuleId, ModuleSpan>>;

interface DashboardContextType {
  telescope: Telescope;
  setTelescope: (telescope: Telescope) => void;
  moduleOrder: ModuleId[];
  setModuleOrder: (order: ModuleId[]) => void;
  moveModule: (fromIndex: number, toIndex: number) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  moduleSpans: ModuleSpans;
  setModuleSpan: (moduleId: ModuleId, col: number, row: number) => void;
  resetOrder: () => void;
  timeBarSticky: boolean;
  setTimeBarSticky: (sticky: boolean) => void;
  timeBarExpanded: boolean;
  setTimeBarExpanded: (expanded: boolean) => void;
}

const VLA_DEFAULT_ORDER: ModuleId[] = [
  "VLAWebcam",
  "VLANowFrame",
  "VLAData",
  "VLAObsLogs",
  "VLAScheduleFrame",
  "VLAConfigSchedule",
  "VLAPressurePlot",
  "UTCtoLSTConverter",
  "VLAAntennaFrame",
  "LSTtoUTCConverter",
];

const VLBA_DEFAULT_ORDER: ModuleId[] = [
  "VLBAWebcam",
  "VLBAData",
  "VLBAScheduleFrame",
  "VLBADynamicQueue",
  "VLBARecentlyObserved",
  "UTCtoLSTConverter",
  "LSTtoUTCConverter",
];

const VLA_DEFAULT_SPANS: ModuleSpans = {
  VLAData: { col: 4, row: 1 },
  VLAWebcam: { col: 6, row: 1 },
  VLAScheduleFrame: { col: 4, row: 1 },
  VLAAntennaFrame: { col: 4, row: 1 },
  VLAObsLogs: { col: 4, row: 1 },
};

const VLBA_DEFAULT_SPANS: ModuleSpans = {
  VLBAWebcam: { col: 6, row: 1 },
  VLBAData: { col: 4, row: 1 },
  VLBAScheduleFrame: { col: 4, row: 1 },
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

function getDefaultOrder(telescope: Telescope): ModuleId[] {
  return telescope === "VLA" ? VLA_DEFAULT_ORDER : VLBA_DEFAULT_ORDER;
}

function getDefaultSpans(telescope: Telescope): ModuleSpans {
  return telescope === "VLA" ? VLA_DEFAULT_SPANS : VLBA_DEFAULT_SPANS;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  // Telescope selection
  const [telescope, setTelescopeState] = useState<Telescope>(() => {
    const saved = getCookie("dashboard-telescope");
    if (saved === "VLA" || saved === "VLBA") return saved;
    return "VLA";
  });

  // Separate module orders for VLA and VLBA
  const [vlaModuleOrder, setVlaModuleOrderState] = useState<ModuleId[]>(() => {
    const saved = getCookie("vla-module-order");
    if (saved) {
      try {
        const parsed = JSON.parse(decodeURIComponent(saved)) as ModuleId[];
        const hasAllModules = VLA_DEFAULT_ORDER.every((id) => parsed.includes(id));
        const hasOnlyValidModules = parsed.every((id) => VLA_DEFAULT_ORDER.includes(id));
        if (Array.isArray(parsed) && hasAllModules && hasOnlyValidModules) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    return VLA_DEFAULT_ORDER;
  });

  const [vlbaModuleOrder, setVlbaModuleOrderState] = useState<ModuleId[]>(() => {
    const saved = getCookie("vlba-module-order");
    if (saved) {
      try {
        const parsed = JSON.parse(decodeURIComponent(saved)) as ModuleId[];
        const hasAllModules = VLBA_DEFAULT_ORDER.every((id) => parsed.includes(id));
        const hasOnlyValidModules = parsed.every((id) => VLBA_DEFAULT_ORDER.includes(id));
        if (Array.isArray(parsed) && hasAllModules && hasOnlyValidModules) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    return VLBA_DEFAULT_ORDER;
  });

  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(() => {
    const saved = getCookie("dashboard-layout-mode");
    if (saved === "auto" || saved === "single" || saved === "double" || saved === "triple" || saved === "quad") return saved;
    return "auto";
  });

  // Combined spans for both telescopes
  const [moduleSpans, setModuleSpansState] = useState<ModuleSpans>(() => {
    const saved = getCookie("dashboard-module-spans");
    if (saved) {
      try {
        const parsed = JSON.parse(decodeURIComponent(saved));
        if (typeof parsed === "object" && parsed !== null) {
          const migrated: ModuleSpans = {};
          for (const [key, value] of Object.entries(parsed)) {
            if (typeof value === "number") {
              migrated[key as ModuleId] = { col: value, row: 1 };
            } else if (typeof value === "object" && value !== null && "col" in value && "row" in value) {
              migrated[key as ModuleId] = value as ModuleSpan;
            }
          }
          return migrated;
        }
      } catch {
        // ignore
      }
    }
    return { ...VLA_DEFAULT_SPANS, ...VLBA_DEFAULT_SPANS };
  });

  const [timeBarSticky, setTimeBarStickyState] = useState<boolean>(() => {
    const saved = getCookie("dashboard-timebar-sticky");
    return saved === "true";
  });

  const [timeBarExpanded, setTimeBarExpandedState] = useState<boolean>(() => {
    const saved = getCookie("dashboard-timebar-expanded");
    return saved === "true";
  });

  // Get current module order based on telescope
  const moduleOrder = telescope === "VLA" ? vlaModuleOrder : vlbaModuleOrder;

  // Save cookies on changes
  useEffect(() => {
    setCookie("dashboard-telescope", telescope);
  }, [telescope]);

  useEffect(() => {
    setCookie("vla-module-order", encodeURIComponent(JSON.stringify(vlaModuleOrder)));
  }, [vlaModuleOrder]);

  useEffect(() => {
    setCookie("vlba-module-order", encodeURIComponent(JSON.stringify(vlbaModuleOrder)));
  }, [vlbaModuleOrder]);

  useEffect(() => {
    setCookie("dashboard-layout-mode", layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    setCookie("dashboard-module-spans", encodeURIComponent(JSON.stringify(moduleSpans)));
  }, [moduleSpans]);

  useEffect(() => {
    setCookie("dashboard-timebar-sticky", String(timeBarSticky));
  }, [timeBarSticky]);

  useEffect(() => {
    setCookie("dashboard-timebar-expanded", String(timeBarExpanded));
  }, [timeBarExpanded]);

  const setTelescope = (t: Telescope) => setTelescopeState(t);

  const setModuleOrder = (order: ModuleId[]) => {
    if (telescope === "VLA") {
      setVlaModuleOrderState(order);
    } else {
      setVlbaModuleOrderState(order);
    }
  };

  const setTimeBarSticky = (sticky: boolean) => setTimeBarStickyState(sticky);
  const setTimeBarExpanded = (expanded: boolean) => setTimeBarExpandedState(expanded);

  const moveModule = (fromIndex: number, toIndex: number) => {
    const currentOrder = telescope === "VLA" ? vlaModuleOrder : vlbaModuleOrder;
    const newOrder = [...currentOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);

    if (telescope === "VLA") {
      setVlaModuleOrderState(newOrder);
    } else {
      setVlbaModuleOrderState(newOrder);
    }
  };

  const setLayoutMode = (mode: LayoutMode) => setLayoutModeState(mode);

  const setModuleSpan = (moduleId: ModuleId, col: number, row: number) => {
    setModuleSpansState((prev) => ({
      ...prev,
      [moduleId]: { col, row },
    }));
  };

  const resetOrder = () => {
    if (telescope === "VLA") {
      setVlaModuleOrderState(VLA_DEFAULT_ORDER);
    } else {
      setVlbaModuleOrderState(VLBA_DEFAULT_ORDER);
    }
    setModuleSpansState((prev) => ({
      ...prev,
      ...getDefaultSpans(telescope),
    }));
  };

  return (
    <DashboardContext.Provider
      value={{
        telescope,
        setTelescope,
        moduleOrder,
        setModuleOrder,
        moveModule,
        layoutMode,
        setLayoutMode,
        moduleSpans,
        setModuleSpan,
        resetOrder,
        timeBarSticky,
        setTimeBarSticky,
        timeBarExpanded,
        setTimeBarExpanded,
      }}
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

export { VLA_DEFAULT_ORDER, VLBA_DEFAULT_ORDER, getDefaultOrder, getDefaultSpans };
