"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { useRbac } from "@/components/RbacProvider";
import { ListingForm } from "@/components/ListingForm";

// Topbar action for the listings page. Gated to listings.edit — whoever can edit listings can
// create one (no separate listings.create perm exists). Opens the design-first ListingForm.
export function ListingIntakeButton() {
  const { can } = useRbac();
  const [open, setOpen] = React.useState(false);

  if (!can("listings.edit")) return null;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>+ เพิ่มทรัพย์</Button>
      <ListingForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}
