import { useTheme } from "../context/ThemeContext";

export const VLBA_RECENTLY_OBSERVED_URL = "https://www.vlba.nrao.edu/astro/schedules/dyndone.html";

export default function VLBARecentlyObserved() {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <iframe
        src={VLBA_RECENTLY_OBSERVED_URL}
        className={`w-full flex-1 min-h-0 rounded border bg-white ${isDark ? "border-gray-600" : "border-gray-300"}`}
        title="VLBA Recently Observed"
      />
      <p className={`mt-2 flex-shrink-0 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Recently observed programs from{" "}
        <a
          href={VLBA_RECENTLY_OBSERVED_URL}
          className="text-blue-500 underline hover:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          VLBA Schedules
        </a>
        .
      </p>
    </div>
  );
}
