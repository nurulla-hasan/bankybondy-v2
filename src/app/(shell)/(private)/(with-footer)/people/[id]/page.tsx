import { Suspense } from "react";

import { PersonProfile } from "../_components/profile/person-profile";

interface PersonPageProps {
  params: Promise<{ id: string }>;
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={null}>
      <PersonProfile id={id} />
    </Suspense>
  );
}
