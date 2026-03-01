import { useTheme } from "../context/ThemeContext";

export default function VLAPressurePlot() {
  const { isDark } = useTheme();

  return (
    <div>
      <img
        src="https://www.aoc.nrao.edu/~schedsoc/daily_pressure_plot/pressure.png"
        width="720"
        height="480"
        className={`w-full rounded border ${isDark ? "border-gray-600" : "border-gray-300"}`}
        title="VLA Daily Pressure Plot"
      />
      <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Data from{" "}
        <a
          href="https://www.aoc.nrao.edu/~schedsoc/daily_pressure_plot/pressure.png"
          className="text-blue-500 underline hover:text-blue-400"
        >
          VLA Daily Pressure Plot
        </a>
        .
      </p>
    </div>
  );
}
