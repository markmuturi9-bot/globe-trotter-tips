import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CreateTipDialog } from "@/components/tips/CreateTipDialog";
import { ListView } from "@/components/views/ListView";

export default function List() {
  const [showCreateTip, setShowCreateTip] = useState(false);

  return (
    <AppShell activeView="list" onCreateTip={() => setShowCreateTip(true)}>
      <ListView />

      {showCreateTip && <CreateTipDialog onClose={() => setShowCreateTip(false)} />}
    </AppShell>
  );
}

