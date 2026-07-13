"use client";

import * as React from "react";
import { ShieldCheck, Map, Home, Activity, Target, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type Zone } from "@/lib/zones";
import { RolesManager } from "@/components/RolesManager";
import { ZonesAdmin } from "@/components/ZonesAdmin";
import {
  PropertyTypesManager,
  ActionTypesManager,
  KpiTemplatesManager,
} from "@/components/MasterDataManagers";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type SectionKey = "roles" | "zones" | "property_types" | "action_types" | "kpi";
type Section = { key: SectionKey; label: string; icon: LucideIcon };

// Single settings hub (Shelter-style): add a section here and it appears in the sub-nav.
// The master-data vocabularies are the CEO-governed canonical lists everything references.
const SECTIONS: Section[] = [
  { key: "roles", label: "บทบาท & สิทธิ์", icon: ShieldCheck },
  { key: "zones", label: "โซน", icon: Map },
  { key: "property_types", label: "ประเภททรัพย์", icon: Home },
  { key: "action_types", label: "ประเภทกิจกรรม", icon: Activity },
  { key: "kpi", label: "เป้าหมาย KPI", icon: Target },
];

export function SettingsView({ zones }: { zones: Zone[] }) {
  const [section, setSection] = React.useState<SectionKey>("roles");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-4 items-start">
      {/* Section sub-nav */}
      <nav className="flex lg:flex-col gap-px overflow-x-auto lg:overflow-visible lg:sticky lg:top-[72px]">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-body font-medium transition-colors text-left whitespace-nowrap shrink-0",
              section === s.key
                ? "bg-accent-wash text-text"
                : "text-text-muted hover:bg-surface-hover hover:text-text"
            )}
          >
            <s.icon
              size={16}
              strokeWidth={1.75}
              className={section === s.key ? "text-accent" : ""}
            />
            {s.label}
          </button>
        ))}
      </nav>

      {/* Section content */}
      <div className="flex flex-col gap-4 min-w-0">
        {section === "roles" && <RolesSection />}
        {section === "zones" && <ZonesSection zones={zones} />}
        {section === "property_types" && (
          <>
            <SectionHeader title="ประเภททรัพย์" desc="รายการประเภททรัพย์กลาง · จัดการโดย CEO" />
            <PropertyTypesManager />
          </>
        )}
        {section === "action_types" && (
          <>
            <SectionHeader
              title="ประเภทกิจกรรม"
              desc="ชุดกิจกรรมกลางที่ปุ่มบันทึกและหน้าผลงานใช้ · จัดการโดย CEO"
            />
            <ActionTypesManager />
          </>
        )}
        {section === "kpi" && (
          <>
            <SectionHeader
              title="เป้าหมาย KPI"
              desc="เทมเพลตเป้าหมายที่หัวหน้าใช้ตั้งเป้าให้ทีม (เชื่อมกับกิจกรรม/ไปป์ไลน์)"
            />
            <KpiTemplatesManager />
          </>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-h2">{title}</h2>
        {desc && <p className="text-small text-text-muted mt-0.5">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-2 px-4 py-3">
      <Info size={16} strokeWidth={1.75} className="text-accent mt-0.5 shrink-0" />
      <p className="text-small text-text-muted">{children}</p>
    </div>
  );
}

function RolesSection() {
  return (
    <>
      <SectionHeader title="บทบาท & สิทธิ์" desc="กำหนดบทบาทและสิทธิ์การใช้งาน · จัดการโดย CEO" />
      <Note>
        สร้างบทบาท เปิด/ปิดสิทธิ์ และกำหนดผู้ใช้ได้ที่นี่ — ผู้ใช้หนึ่งคนถือได้หลายบทบาท (สิทธิ์รวมกัน)
        เช่น หัวหน้าทีมที่ยังขายอยู่ = Agent + Sales Leader.{" "}
        <span className="text-text">โหมดออกแบบ: การเปลี่ยนแปลงยังไม่ถูกบันทึก</span>
      </Note>
      <RolesManager />
    </>
  );
}

function ZonesSection({ zones }: { zones: Zone[] }) {
  return (
    <>
      <SectionHeader
        title="โซน"
        desc="ข้อมูลอ้างอิงกลางที่ทรัพย์ · Lead · Last Match ใช้ร่วมกัน"
        action={
          <Button size="sm" disabled>
            + เพิ่มโซน
          </Button>
        }
      />
      <ZonesAdmin zones={zones} />
    </>
  );
}

