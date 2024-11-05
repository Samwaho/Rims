import { requireAuth } from "@/lib/actions";

export default async function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth(); // This will redirect if not authenticated
  return <>{children}</>;
}
