import ActionsBar from "@/components/actions-bar";
export const dynamic = "force-dynamic";

export default async function Patient({ params }: { params: { id: string } }) {
  return <ActionsBar patientId={params.id} />;
}
