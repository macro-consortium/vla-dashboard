import { useTheme } from "../context/ThemeContext";

export const VLA_SCHEDULE_PDF_URL = "https://www.aoc.nrao.edu/~schedsoc/new_sched/current.pdf";

export default function VLAScheduleFrame() {
  const { isDark } = useTheme();

  return (
    <div>
      <iframe
        src={VLA_SCHEDULE_PDF_URL}
        width="720"
        height="480"
        className={`w-full rounded border ${isDark ? "border-gray-600" : "border-gray-300"}`}
        title="VLA Schedule Frame"
      />
      <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Data from{" "}
        <a
          href={VLA_SCHEDULE_PDF_URL}
          className="text-blue-500 underline hover:text-blue-400"
        >
          VLA Schedule
        </a>
        .
      </p>
    </div>
  );
}