export default function VLAScheduleFrame() {
  return (
    <div className="bg-white mt-6 p-4 w-full max-w-3xl rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">VLA Monthly Schedule</h2>
      <iframe
        src="https://www.aoc.nrao.edu/~schedsoc/new_sched/current.pdf"
        width="720"
        height="480"
        className="w-full rounded border"
        title="VLA Schedule Frame"
      />
      <p className="mt-2">
        Data from{" "}
        <a
          href="https://www.aoc.nrao.edu/~schedsoc/new_sched/current.pdf"
          className="text-blue-600 underline"
        >
          VLANow
        </a>
        .
      </p>
    </div>
  );
}