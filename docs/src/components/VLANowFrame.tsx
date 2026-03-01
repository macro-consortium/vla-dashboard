import { useTheme } from "../context/ThemeContext";

export default function VLANowFrame() {
  const { isDark } = useTheme();

  return (
    <div>
      <iframe
        src="https://www.aoc.nrao.edu/~schedsoc/recent_VLA/index.shtml"
        width="720"
        height="480"
        className={`w-full rounded border ${isDark ? "border-gray-600" : "border-gray-300"}`}
        title="VLA Now Frame"
      />
      <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Data from{" "}
        <a
          href="https://go.nrao.edu/vlanow"
          className="text-blue-500 underline hover:text-blue-400"
        >
          VLANow
        </a>
        .
      </p>
    </div>
  );
}
