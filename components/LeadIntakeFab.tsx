"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { useRbac } from "@/components/RbacProvider";
import { useNewLeads } from "@/components/NewLeadsProvider";
import { LeadForm } from "@/components/LeadForm";
import { cn } from "@/lib/cn";

// Lead-intake FAB — for whoever receives leads across channels and logs them. Gated to
// leads.create (Admin / Listing Support / Sales Leader / CEO). Same crimson-filled style as
// the sales log-activity FAB; stacks ABOVE it for anyone who has both perms (avoids overlap).
export function LeadIntakeFab() {
  const { can, currentUser } = useRbac();
  const { addLead } = useNewLeads();
  const [open, setOpen] = React.useState(false);

  if (!can("leads.create")) return null;
  const mode = can("leads.assign") ? "admin" : "rep";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="เพิ่มลีด"
        className={cn(
          "fixed right-5 z-40 inline-flex items-center gap-2 rounded-full bg-accent text-text-onaccent h-12 pl-4 pr-5 shadow-pop hover:bg-accent-hover transition-colors font-medium",
          can("activity.log") ? "bottom-[76px]" : "bottom-5"
        )}
      >
        <UserPlus size={18} strokeWidth={2.25} /> เพิ่มลีด
      </button>
      <LeadForm open={open} mode={mode} createdBy={currentUser.name} onClose={() => setOpen(false)} onCreated={addLead} />
    </>
  );
}
