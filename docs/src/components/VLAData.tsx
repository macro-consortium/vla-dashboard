import { useEffect, useState } from "react";
import Info from "./Info";

interface ObservationData {
  telescope: string;
  proposal_code: string;
  proposal_title: string;
  proposal_abstract: string;
  PI_name: string;
  PI_institution: string;
  source_name: string;
  source_ra: string;
  source_dec: string;
}

export default function VLAData() {
  const [data, setData] = useState<ObservationData | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://data-query.nrao.edu/accumulator/vla",
        {
          headers: { Accept: "application/json" },
        }
      );
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 w-full max-w-3xl rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Current VLA Observation</h2>
      {data ? (
        <div className="space-y-3">
          <Info label="Telescope" value={data.telescope} different={false}/>
          <Info label="Proposal Code" value={data.proposal_code} different={false}/>
          <Info label="Proposal Title" value={data.proposal_title} different={false}/>
          <Info label="Proposal Abstract" value={data.proposal_abstract} different={false}/>
          <Info label="PI Name" value={data.PI_name} different={true}/>
          <Info label="PI Institution" value={data.PI_institution} different={false}/>
          <Info label="Source Name" value={data.source_name} different={true}/>
          <Info label="Source RA" value={data.source_ra} different={false}/>
          <Info label="Source DEC" value={data.source_dec} different={false}/>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <p className="mt-5 text-md">
        <span className="text-gray-700 text-lg">Note:</span> If the VLA is undergoing daily maintenance, this data
        may be out of date.
      </p>
    </div>
  );
}
