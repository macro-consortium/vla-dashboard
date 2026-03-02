import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export const VLA_PRESSURE_PLOT_URL = "https://www.aoc.nrao.edu/~schedsoc/daily_pressure_plot/pressure.png";

export default function VLAPressurePlot() {
  const { isDark } = useTheme();
  const [currentSrc, setCurrentSrc] = useState(`${VLA_PRESSURE_PLOT_URL}?t=${Date.now()}`);
  const [isLoading, setIsLoading] = useState(true);

  // Preload new image before swapping to prevent layout shift
  useEffect(() => {
    const interval = setInterval(() => {
      const newSrc = `${VLA_PRESSURE_PLOT_URL}?t=${Date.now()}`;
      const img = new Image();
      img.onload = () => {
        setCurrentSrc(newSrc);
      };
      img.src = newSrc;
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Expandable image container */}
      <div
        className={`relative w-full flex-1 min-h-[250px] rounded border overflow-hidden ${isDark ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-gray-100"}`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Loading pressure plot...
            </span>
          </div>
        )}
        <img
          src={currentSrc}
          alt="VLA Daily Pressure Plot"
          className="w-full h-full object-contain"
          onLoad={() => setIsLoading(false)}
        />
      </div>
      <p className={`mt-2 text-xs flex-shrink-0 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Refreshes every 5 minutes
      </p>
      <p className={`mt-1 flex-shrink-0 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Daily pressure plot from{" "}
        <a
          href={VLA_PRESSURE_PLOT_URL}
          className="text-blue-500 underline hover:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          VLA Scheduling
        </a>
        .
      </p>
    </div>
  );
}
