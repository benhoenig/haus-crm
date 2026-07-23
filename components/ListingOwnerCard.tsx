"use client";

import * as React from "react";
import { Phone, MessageSquare, Lock, Handshake } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { useRbac } from "@/components/RbacProvider";
import { listingAgent } from "@/lib/listings";

// Owner contact is PRIVATE. A sale sees the owner's name/phone only for listings they manage,
// or if they hold `contacts.view_all` (Listing Support / leadership — owners are contacts).
// Everyone else sees the managing agent's contact instead, so they can reach out to Co-Agent.
// Design-first: "manages this listing" uses the seeded managing agent (lib/listings); wire to
// the real creating-agent + real contacts RLS.
export function ListingOwnerCard({
  ownerName,
  ownerPhone,
  listingId,
}: {
  ownerName: string | null;
  ownerPhone: string | null;
  listingId: string;
}) {
  const { can, currentUser } = useRbac();
  const agent = listingAgent(listingId);
  const isManager = !!agent && currentUser.name === agent.nickname;
  const canSeeOwner = can("contacts.view_all") || isManager;

  if (canSeeOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>เจ้าของทรัพย์</CardTitle>
        </CardHeader>
        {ownerName ? (
          <div className="p-4 flex items-center gap-3">
            <Avatar name={ownerName} tone="crimson" className="h-10 w-10" />
            <div className="min-w-0">
              <div className="text-body font-medium truncate">{ownerName}</div>
              {ownerPhone && (
                <a
                  href={`tel:${ownerPhone}`}
                  className="num text-small text-text-muted hover:text-accent inline-flex items-center gap-1 transition-colors"
                >
                  <Phone size={12} strokeWidth={1.75} />
                  {ownerPhone}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-small text-text-subtle">ไม่ระบุเจ้าของ</div>
        )}
      </Card>
    );
  }

  // Co-agent view — owner hidden, managing agent's contact shown instead.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake size={16} strokeWidth={1.75} className="text-accent" />
          ผู้ดูแลทรัพย์
        </CardTitle>
        <Pill tone="neutral">Co-Agent</Pill>
      </CardHeader>
      {agent ? (
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={agent.nickname} src={agent.avatarUrl} tone="crimson" className="h-10 w-10" />
            <div className="min-w-0">
              <div className="text-body font-medium truncate num">{agent.nickname}</div>
              <div className="text-label text-text-subtle">{agent.position}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {agent.phone ? (
              <a href={`tel:${agent.phone}`} className="num text-small text-text-muted hover:text-accent inline-flex items-center gap-1 transition-colors">
                <Phone size={12} strokeWidth={1.75} /> {agent.phone}
              </a>
            ) : (
              <span className="text-small text-text-subtle">ไม่มีเบอร์โทร</span>
            )}
            {agent.lineUserId && (
              <span className="text-small text-text-muted inline-flex items-center gap-1">
                <MessageSquare size={12} strokeWidth={1.75} /> <span className="num">{agent.lineUserId}</span>
              </span>
            )}
          </div>
          <p className="text-label text-text-subtle inline-flex items-center gap-1.5">
            <Lock size={11} strokeWidth={1.75} /> ข้อมูลเจ้าของเป็นความลับ — ติดต่อผู้ดูแลเพื่อ Co-Agent
          </p>
        </div>
      ) : (
        <div className="p-4 text-small text-text-subtle">ไม่ระบุผู้ดูแล</div>
      )}
    </Card>
  );
}
