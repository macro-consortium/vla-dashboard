import { useTheme } from "../context/ThemeContext";
import { useDashboard } from "../context/DashboardContext";
import type { Telescope } from "../context/DashboardContext";

export default function TelescopeToggle() {
  const { isDark } = useTheme();
  const { telescope, setTelescope } = useDashboard();

  const handleToggle = (t: Telescope) => {
    setTelescope(t);
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-opacity-50"
         style={{ backgroundColor: isDark ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 0.5)" }}>
      <button
        onClick={() => handleToggle("VLA")}
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
          telescope === "VLA"
            ? isDark
              ? "bg-blue-600 text-white shadow-md"
              : "bg-blue-500 text-white shadow-md"
            : isDark
              ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
        }`}
      >
        VLA
      </button>
      <button
        onClick={() => handleToggle("VLBA")}
        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
          telescope === "VLBA"
            ? isDark
              ? "bg-purple-600 text-white shadow-md"
              : "bg-purple-500 text-white shadow-md"
            : isDark
              ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
        }`}
      >
        VLBA
      </button>
    </div>
  );
}
