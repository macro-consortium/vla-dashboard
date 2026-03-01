import { useState } from "react";
import type { ReactNode } from "react";
import VLAData from "./components/VLAData";
import VLANowFrame from "./components/VLANowFrame";
import UTCtoLSTConverter from "./components/UTCtoLSTConverter";
import LSTtoUTCConverter from "./components/LSTtoUTCConverter";
import TimeComponent from "./components/TimeComponent";
import TimeComponentResponsive from "./components/TimeComponentResponsive";
import VLAScheduleFrame, { VLA_SCHEDULE_PDF_URL } from "./components/VLAScheduleFrame";
import VLAAntennaFrame, { VLA_ANTENNA_PDF_URL } from "./components/VLAAntennaFrame";
import VLAWebcam, { VLA_WEBCAM_URL } from "./components/VLAWebcam";
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
    popOutUrl: VLA_SCHEDULE_PDF_URL,
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
};

function DashboardContent() {
  const { isDark } = useTheme();
  const { moduleOrder, moveModule, layoutMode } = useDashboard();
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
      <div className="flex flex-col gap-5 items-center my-6 w-full max-w-7xl">
        <h1
          className={`text-3xl font-bold text-center ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          VLA Dashboard
        </h1>
        <TimeComponentResponsive />
        <div className="hidden min-[1550px]:block w-full mt-6">
          <TimeComponent />
        </div>
      </div>

      <div
        className={`w-full ${
          layoutMode === "single" ? "max-w-3xl" : "max-w-7xl"
        } mx-auto`}
      >
        <SettingsPanel />
      </div>

      <div
        className={`w-full ${
          layoutMode === "single" ? "" : "max-w-7xl"
        } grid ${getGridClasses()} gap-6 items-start`}
      >
        {moduleOrder.map((moduleId, index) => {
          const config = MODULE_CONFIGS[moduleId];
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
