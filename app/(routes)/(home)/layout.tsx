import Sidebar from "@/app/components/sidebar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}