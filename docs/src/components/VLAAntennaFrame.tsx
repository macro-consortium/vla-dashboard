import { useTheme } from "../context/ThemeContext";

export const VLA_ANTENNA_PDF_URL = "https://www.vla.nrao.edu/operators/CurrentPos.pdf";

export default function VLAAntennaFrame() {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col flex-1 min-h-[400px]">
      <iframe
        src={VLA_ANTENNA_PDF_URL}
        className={`w-full flex-1 min-h-[350px] rounded border ${isDark ? "border-gray-600" : "border-gray-300"}`}
        title="VLA Antenna Positions Frame"
      />
      <p className={`mt-2 flex-shrink-0 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Data from{" "}
        <a
          href={VLA_ANTENNA_PDF_URL}
          className="text-blue-500 underline hover:text-blue-400"
        >
          VLA Antenna Positions
        </a>
        .
      </p>
    </div>
  );
}
