import { useEffect, useState } from "react";
import { CreateTipDialog } from "@/components/tips/CreateTipDialog";
import { MapView } from "@/components/views/MapView";
import { AppShell } from "@/components/layout/AppShell";

export default function Map() {
  const [showCreateTip, setShowCreateTip] = useState(false);

  // Hard lock scroll on the map screen (prevents the "scroll the whole page" issue)
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <AppShell activeView="map" onCreateTip={() => setShowCreateTip(true)} scrollContent={false}>
      <MapView />

      {showCreateTip && <CreateTipDialog onClose={() => setShowCreateTip(false)} />}
    </AppShell>
  );
}

