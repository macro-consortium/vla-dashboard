import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export const VLBA_CURRENT_SCHEDULE_URL = "https://www.vlba.nrao.edu/astro/new_sched/current.pdf";
export const VLBA_FUTURE_SCHEDULE_URL = "https://www.vlba.nrao.edu/astro/new_sched/future.pdf";

type ScheduleTab = "current" | "future";

export default function VLBAScheduleFrame() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<ScheduleTab>("current");

  const tabs: { id: ScheduleTab; label: string; url: string }[] = [
    { id: "current", label: "Current", url: VLBA_CURRENT_SCHEDULE_URL },
    { id: "future", label: "Future", url: VLBA_FUTURE_SCHEDULE_URL },
  ];

  const activeUrl = activeTab === "current" ? VLBA_CURRENT_SCHEDULE_URL : VLBA_FUTURE_SCHEDULE_URL;

  const handlePopOut = () => {
    window.open(activeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Tab buttons */}
      <div className="flex mb-3 gap-1 justify-between items-center flex-shrink-0">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                activeTab === tab.id
                  ? isDark
                    ? "bg-purple-700 text-white"
                    : "bg-purple-500 text-white"
                  : isDark
                    ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handlePopOut}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
            isDark
              ? "text-purple-400 hover:bg-gray-700"
              : "text-purple-600 hover:bg-purple-50"
          }`}
          title={`Open ${activeTab} schedule in new tab`}
        >
          <OpenInNewIcon fontSize="small" />
          <span className="hidden sm:inline">Open PDF</span>
        </button>
      </div>

      <iframe
        src={activeUrl}
        className={`w-full flex-1 min-h-0 rounded border ${isDark ? "border-gray-600" : "border-gray-300"}`}
        title={`VLBA Schedule - ${activeTab === "current" ? "Current" : "Future"}`}
      />
      <p className={`mt-2 flex-shrink-0 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Data from{" "}
        <a
          href={activeUrl}
          className="text-blue-500 underline hover:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          VLBA {activeTab === "current" ? "Current" : "Future"} Schedule
        </a>
        .
      </p>
    </div>
  );
}
