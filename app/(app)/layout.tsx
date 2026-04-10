import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { requireUser } from "@/lib/auth/require-user";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser();

  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 py-6 md:px-6 xl:px-8">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Topbar email={user.email} />
          <MobileNav />
          <main className="space-y-6 pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

