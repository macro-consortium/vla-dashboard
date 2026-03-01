import { useTheme } from "../context/ThemeContext";

export const VLA_ANTENNA_PDF_URL = "https://www.vla.nrao.edu/operators/CurrentPos.pdf";

export default function VLAAntennaFrame() {
  const { isDark } = useTheme();

  return (
    <div>
      <iframe
        src={VLA_ANTENNA_PDF_URL}
        width="720"
        height="480"
        className={`w-full rounded border ${isDark ? "border-gray-600" : "border-gray-300"}`}
        title="VLA Antenna Positions Frame"
      />
      <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
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