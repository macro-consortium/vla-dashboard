import { useTheme } from "../context/ThemeContext";

export const VLBA_DYNAMIC_QUEUE_URL = "https://www.vlba.nrao.edu/astro/schedules/dynqueue.html";

export default function VLBADynamicQueue() {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col flex-1 min-h-[400px]">
      <iframe
        src={VLBA_DYNAMIC_QUEUE_URL}
        className={`w-full flex-1 min-h-[350px] rounded border bg-white ${isDark ? "border-gray-600" : "border-gray-300"}`}
        title="VLBA Dynamic Queue"
      />
      <p className={`mt-2 flex-shrink-0 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Current dynamic queue from{" "}
        <a
          href={VLBA_DYNAMIC_QUEUE_URL}
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
