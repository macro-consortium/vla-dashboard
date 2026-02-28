export default function VLANowFrame() {
  return (
    <div className="bg-white mt-6 p-4 w-full max-w-3xl rounded-lg shadow-md">
      <iframe
        src="https://www.aoc.nrao.edu/~schedsoc/recent_VLA/index.shtml"
        width="720"
        height="480"
        className="w-full rounded border"
        title="VLA Now Frame"
      />
      <p className="mt-2">
        Data from{" "}
        <a
          href="https://go.nrao.edu/vlanow"
          className="text-blue-600 underline"
        >
          VLANow
        </a>
        .
      </p>
    </div>
  );
}
