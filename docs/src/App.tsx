import { useState } from "react";
import type { ReactNode } from "react";
import VLAData from "./components/VLAData";
import VLANowFrame from "./components/VLANowFrame";
import UTCtoLSTConverter from "./components/UTCtoLSTConverter";
import LSTtoUTCConverter from "./components/LSTtoUTCConverter";
import TimeBar from "./components/TimeBar";
import VLAScheduleFrame from "./components/VLAScheduleFrame";
import VLAAntennaFrame, { VLA_ANTENNA_PDF_URL } from "./components/VLAAntennaFrame";
import VLAWebcam, { VLA_WEBCAM_URL } from "./components/VLAWebcam";
import VLAObsLogs, { VLA_OBS_LOGS_URL } from "./components/VLAObsLogs";
import VLAPressurePlot from "./components/VLAPressurePlot";
import ModuleWrapper from "./components/ModuleWrapper";
import SettingsPanel from "./components/SettingsPanel";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { DashboardProvider, useDashboard } from "./context/DashboardContext";
import type { ModuleId } from "./context/DashboardContext";

interface ModuleConfig {
  id: ModuleId;
  title: string;
  component: ReactNode;
  popOutUrl?: string;
}

const MODULE_CONFIGS: Record<ModuleId, Omit<ModuleConfig, "id">> = {
  VLAData: {
    title: "Current VLA Observation",
    component: <VLAData />,
  },
  VLANowFrame: {
    title: "VLA Now",
    component: <VLANowFrame />,
    popOutUrl: "https://go.nrao.edu/vlanow",
  },
  UTCtoLSTConverter: {
    title: "UTC to LST Converter",
    component: <UTCtoLSTConverter />,
  },
  LSTtoUTCConverter: {
    title: "LST to UTC Converter",
    component: <LSTtoUTCConverter />,
  },
  VLAScheduleFrame: {
    title: "VLA Monthly Schedule",
    component: <VLAScheduleFrame />,
  },
  VLAAntennaFrame: {
    title: "VLA Antenna Positions",
    component: <VLAAntennaFrame />,
    popOutUrl: VLA_ANTENNA_PDF_URL,
  },
  VLAWebcam: {
    title: "VLA Webcam",
    component: <VLAWebcam />,
    popOutUrl: VLA_WEBCAM_URL,
  },
  VLAObsLogs: {
    title: "VLA Observation Logs",
    component: <VLAObsLogs />,
    popOutUrl: VLA_OBS_LOGS_URL,
  },
  VLAPressurePlot: {
    title: "VLA Pressure Plot",
    component: <VLAPressurePlot />,
  },
};

function DashboardContent() {
  const { isDark } = useTheme();
  const { moduleOrder, moveModule, layoutMode, moduleSpans, setModuleSpan, timeBarSticky } = useDashboard();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (toIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      moveModule(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getMaxColumns = () => {
    switch (layoutMode) {
      case "single":
        return 1;
      case "double":
        return 2;
      case "triple":
      case "auto":
      default:
        return 3;
    }
  };

  const maxColumns = getMaxColumns();

  const getGridClasses = () => {
    switch (layoutMode) {
      case "single":
        return "grid-cols-1 max-w-3xl mx-auto";
      case "double":
        return "grid-cols-1 lg:grid-cols-2";
      case "triple":
        return "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3";
      case "auto":
      default:
        return "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3";
    }
  };

  return (
    <div
      className={`relative p-6 min-h-screen flex flex-col items-center transition-colors duration-200 ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      }`}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4 items-center mt-6 mb-4 w-full max-w-7xl 2xl:max-w-[80%]">
        <h1
          className={`text-3xl font-bold text-center ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          VLA Dashboard
        </h1>
      </div>

      <div className={`w-full max-w-7xl 2xl:max-w-[80%] mb-4 ${timeBarSticky ? "sticky top-0 z-40" : ""}`}>
        <TimeBar />
      </div>

      <div
        className={`w-full ${
          layoutMode === "single" ? "max-w-3xl" : "max-w-7xl 2xl:max-w-[80%]"
        } mx-auto`}
      >
        <SettingsPanel />
      </div>

      <div
        className={`w-full ${
          layoutMode === "single" ? "" : "max-w-7xl 2xl:max-w-[80%]"
        } grid ${getGridClasses()} gap-6 grid-flow-dense auto-rows-auto`}
      >
        {moduleOrder.map((moduleId, index) => {
          const config = MODULE_CONFIGS[moduleId];
          const savedSpan = moduleSpans[moduleId];
          const colSpan = Math.min(savedSpan?.col ?? 1, maxColumns);
          const rowSpan = savedSpan?.row ?? 1;
          return (
            <ModuleWrapper
              key={moduleId}
              title={config.title}
              popOutUrl={config.popOutUrl}
              index={index}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedIndex === index}
              dragOverIndex={dragOverIndex}
              colSpan={colSpan}
              rowSpan={rowSpan}
              maxColumns={maxColumns}
              onSpanChange={(col, row) => setModuleSpan(moduleId, col, row)}
            >
              {config.component}
            </ModuleWrapper>
          );
        })}
      </div>

      <p
        className={`mt-10 text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        View source and contribute on{" "}
        <a
          href="https://github.com/macro-consortium/vla-dashboard"
          className="text-blue-500 underline hover:text-blue-400"
        >
          GitHub
        </a>
      </p>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    </ThemeProvider>
  );
}

export default App;
