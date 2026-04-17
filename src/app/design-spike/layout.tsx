import { notFound } from "next/navigation";

// Dev-only : la page de spike n'est accessible qu'en environnement local.
// En production (Vercel), Next renvoie un 404 standard.
export default function DesignSpikeLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <>{children}</>;
}
