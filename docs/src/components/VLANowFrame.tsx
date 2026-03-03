import { useTheme } from "../context/ThemeContext";

const VLA_NOW_URL = "https://www.aoc.nrao.edu/~schedsoc/recent_VLA/index.shtml";

export default function VLANowFrame() {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col flex-1 min-h-[400px]">
      <iframe
        src={VLA_NOW_URL}
        className={`w-full flex-1 min-h-[350px] rounded border ${isDark ? "border-gray-600" : "border-gray-300"}`}
        title="VLA Now Frame"
      />
      <p className={`mt-2 flex-shrink-0 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Data from{" "}
        <a
          href="https://go.nrao.edu/vlanow"
          className="text-blue-500 underline hover:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          VLANow
        </a>
        .
      </p>
    </div>
  );
}
