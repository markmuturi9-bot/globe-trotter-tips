import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CreateTipDialog } from "@/components/tips/CreateTipDialog";
import { SettingsView } from "@/components/views/SettingsView";
import { useLanguage } from "@/lib/i18n";

export default function Settings() {
  const [showCreateTip, setShowCreateTip] = useState(false);
  const { t } = useLanguage();

  return (
    <AppShell
      activeView="profile"
      backTo={{ to: "/profile", title: t("settings.title") }}
      onCreateTip={() => setShowCreateTip(true)}
    >
      <SettingsView />

      {showCreateTip && <CreateTipDialog onClose={() => setShowCreateTip(false)} />}
    </AppShell>
  );
}
