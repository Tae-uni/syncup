import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Link2, CheckSquare } from "lucide-react";

const features = [
  {
    icon: CalendarPlus,
    step: "01",
    title: "Create a Sync",
    description:
      "Set a title, pick your available time options, and choose an expiry date.",
  },
  {
    icon: Link2,
    step: "02",
    title: "Share the Link",
    description:
      "Copy the unique link and send it to your group - no app required.",
  },
  {
    icon: CheckSquare,
    step: "03",
    title: "Everyone Votes",
    description:
      "Participants vote on their availability. No sign-up, just a name and passcode.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-border-border">
        <span className="text-lg font-semibold tracking-tight">SyncUp</span>
        <Link href="/sync">
          <Button size="sm">Create a Sync</Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center flex-1 px-6 py-28 bg-gradient-to-b from-background via-background to-secondary/40">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Free to use · No account required
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl text-balance">
          Find a time that works for everyone.
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-lg text-balance">
          No sign-ups. Just create a Sync, share the link, and let everyone vote.
        </p>
        <Link href="/sync" className="mt-10">
          <Button size="lg" className="px-8 text-base">Create a Sync  →</Button>
        </Link>
      </section>

      {/* Feature Cards */}
      <section className="px-8 pb-28">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-mono text-muted-foreground/60">
                  {step}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SyncUp. All rights reserved.
      </footer>
    </div>
  );
}
