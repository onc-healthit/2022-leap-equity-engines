import DataIngestion from "@/components/ingestion/data-ingestion";

export default function Ingestion({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-row gap-2 ">
      <div className="flex flex-col gap-2 max-w-lg">
        <h1 className="text-2xl font-extrabold tracking-tight">Data Ingestion</h1>
        <p>
          Upload a JSON file containing patient data in the universal format to begin ingestion in the ElasticSearch
          cluster.
        </p>
        <DataIngestion patientId={params.id} />
      </div>
    </div>
  );
}
