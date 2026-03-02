import { useTheme } from "../context/ThemeContext";
import { useDashboard } from "../context/DashboardContext";
import type { LayoutMode } from "../context/DashboardContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import GridViewIcon from "@mui/icons-material/GridView";

export default function SettingsPanel() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { layoutMode, setLayoutMode, resetOrder } = useDashboard();

  const layoutOptions: { mode: LayoutMode; label: string; icon: React.ReactNode }[] = [
    { mode: "auto", label: "Auto", icon: <AutoAwesomeIcon fontSize="small" /> },
    { mode: "single", label: "1 Col", icon: <ViewStreamIcon fontSize="small" /> },
    { mode: "double", label: "2 Col", icon: <ViewColumnIcon fontSize="small" /> },
    { mode: "triple", label: "3 Col", icon: <ViewWeekIcon fontSize="small" /> },
    { mode: "quad", label: "4 Col", icon: <GridViewIcon fontSize="small" /> },
  ];

  return (
    <div
      className={`
        w-full rounded-lg shadow-md p-4 mb-6
        ${isDark ? "bg-gray-800" : "bg-white"}
      `}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Theme:
          </span>
          <button
            onClick={toggleTheme}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
              ${isDark
                ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
            `}
          >
            {theme === "dark" ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            <span className="text-sm capitalize">{theme}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Layout:
          </span>
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
            {layoutOptions.map(({ mode, label, icon }) => (
              <button
                key={mode}
                onClick={() => setLayoutMode(mode)}
                className={`
                  flex items-center gap-1 px-3 py-1.5 text-sm transition-colors
                  ${layoutMode === mode
                    ? isDark
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"}
                `}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={resetOrder}
          className={`
            flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors
            ${isDark
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
          title="Reset module order to default"
        >
          <RestartAltIcon fontSize="small" />
          <span className="hidden sm:inline">Reset Order</span>
        </button>
      </div>

      <p className={`mt-3 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Drag modules by their header to reorder. Click the grid icon on each module to resize. Preferences are saved automatically.
      </p>
    </div>
  );
}
