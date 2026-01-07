import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CreateTipDialog } from "@/components/tips/CreateTipDialog";
import { ProfileView } from "@/components/views/ProfileView";

export default function Profile() {
  const [showCreateTip, setShowCreateTip] = useState(false);

  return (
    <AppShell activeView="profile" onCreateTip={() => setShowCreateTip(true)}>
      <ProfileView />

      {showCreateTip && <CreateTipDialog onClose={() => setShowCreateTip(false)} />}
    </AppShell>
  );
}

