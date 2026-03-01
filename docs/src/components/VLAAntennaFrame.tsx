export default function VLAAntennaFrame() {
  return (
    <div className="bg-white mt-6 p-4 w-full max-w-3xl rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Current VLA Antenna Positions</h2>
      <iframe
        src="https://www.vla.nrao.edu/operators/CurrentPos.pdf"
        width="720"
        height="480"
        className="w-full rounded border"
        title="VLA Antenna Positions Frame"
      />
      <p className="mt-2">
        Data from{" "}
        <a
          href="https://www.vla.nrao.edu/operators/CurrentPos.pdf"
          className="text-blue-600 underline"
        >
          VLA Antenna Positions
        </a>
        .
      </p>
    </div>
  );
}