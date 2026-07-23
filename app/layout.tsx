import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNavProvider } from "@/components/MobileNav";
import { RbacProvider } from "@/components/RbacProvider";
import { MasterDataProvider } from "@/components/MasterDataProvider";
import { NotificationsProvider } from "@/components/NotificationsProvider";
import { NewLeadsProvider } from "@/components/NewLeadsProvider";
import { LogActivity } from "@/components/LogActivity";
import { LeadIntakeFab } from "@/components/LeadIntakeFab";

const plexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-thai",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HAUS CRM — Living Estate",
  description: "ระบบ CRM อสังหาฯ Haus Living Estate",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${plexSansThai.variable} ${plexMono.variable}`}>
      <body>
        <RbacProvider>
          {/* Inside RbacProvider — feeds/leads are scoped to the current viewer. */}
          <MasterDataProvider>
          <NotificationsProvider>
            <NewLeadsProvider>
              <MobileNavProvider>
                <div className="grid grid-cols-1 lg:grid-cols-[228px_1fr] min-h-screen">
                  <Sidebar />
                  <main className="min-w-0 flex flex-col">{children}</main>
                </div>
                {/* Quick activity logger — gated to activity.log. */}
                <LogActivity />
                {/* Lead intake FAB — gated to leads.create (admin/back-office). */}
                <LeadIntakeFab />
              </MobileNavProvider>
            </NewLeadsProvider>
          </NotificationsProvider>
          </MasterDataProvider>
        </RbacProvider>
      </body>
    </html>
  );
}
