export default function Info({
  label,
  value,
  different,
}: {
  label: string;
  value: string;
  different: boolean;
}) {
  return (
    <div>
      <p className="text-lg font-semibold text-gray-700">{label}</p>
      <p
        className={`text-md ${
          different ? "text-red-600 font-bold" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
