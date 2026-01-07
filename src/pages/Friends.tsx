import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CreateTipDialog } from "@/components/tips/CreateTipDialog";
import { FriendsView } from "@/components/views/FriendsView";

export default function Friends() {
  const [showCreateTip, setShowCreateTip] = useState(false);

  return (
    <AppShell activeView="friends" onCreateTip={() => setShowCreateTip(true)}>
      <FriendsView />

      {showCreateTip && <CreateTipDialog onClose={() => setShowCreateTip(false)} />}
    </AppShell>
  );
}

