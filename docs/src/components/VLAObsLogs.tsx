import { useTheme } from "../context/ThemeContext";

export const VLA_OBS_LOGS_URL = "https://www.vla.nrao.edu/cgi-bin/oplogs.cgi";

export default function VLAObsLogs() {
  const { isDark } = useTheme();

  return (
    <div>
      <iframe
        src={VLA_OBS_LOGS_URL}
        width="720"
        height="500"
        className={`w-full rounded border ${isDark ? "border-gray-600" : "border-gray-300"}`}
        title="VLA Observation Logs"
      />
      <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Search observation logs at{" "}
        <a
          href={VLA_OBS_LOGS_URL}
          className="text-blue-500 underline hover:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          VLA Operators Logs
        </a>
        .
      </p>
    </div>
  );
}
