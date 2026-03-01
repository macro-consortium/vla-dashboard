import { useTheme } from "../context/ThemeContext";

export default function Info({
  label,
  value,
  different,
}: {
  label: string;
  value: string;
  different: boolean;
}) {
  const { isDark } = useTheme();

  return (
    <div>
      <p className={`text-lg font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        {label}
      </p>
      <p
        className={`text-md ${
          different
            ? "text-red-500 font-bold"
            : isDark
              ? "text-gray-100"
              : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
