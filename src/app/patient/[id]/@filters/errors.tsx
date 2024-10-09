"use client";

import WithIcon from "@/components/with-icon";
import { Button } from "@healthlab/ui";
import { RefreshCcw } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col gap-2 items-center">
      <p>Unable to fetch event filters.</p>
      <Button onClick={reset}>
        <WithIcon icon={<RefreshCcw width={16} />}>Retry</WithIcon>
      </Button>
    </div>
  );
}
