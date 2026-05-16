"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

interface Props {
  syncId: string;
}

export default function SyncCreatedSuccess({ syncId }: Props) {
  const router = useRouter();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const participantURL = `${origin}/sync/${syncId}`;
  const editURL = `${origin}/sync/${syncId}/edit`;

  const [copiedParticipant, setCopiedParticipant] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);

  const copy = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <Link href="/">
          <span className="text-lg font-semibold tracking-tight">
            SyncUp
          </span>
        </Link>
      </nav>

      <main className="flex flex-col items-center justify-center flex-1 px-6 py-16">
        <div className="w-full max-w-xl bg-card rounded-2xl border border-border shadow-sm p-12">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Sync Created!</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-10">
            Save the links below. You&apos;ll need the edit link to manage your sync.
          </p>

          <div className="flex flex-col gap-8">
            <div>
              <p className="text-lg font-medium mb-1">Participant link</p>
              <p className="text-sm text-muted-foreground mb-3">
                Share this with participants to collect votes.
              </p>
              <div className="flex gap-2">
                <Input readOnly value={participantURL} className="text-sm" />
                <Button variant="outline" onClick={() => copy(participantURL,
                  setCopiedParticipant)}>
                  {copiedParticipant ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="border-t border-border" />

            <div>
              <p className="text-lg font-medium mb-1">Leader edit link</p>
              <p className="text-sm text-muted-foreground mb-3">
                Keep this private. You&apos;ll use it with your passcode to edit the
                sync.
              </p>
              <div className="flex gap-2">
                <Input readOnly value={editURL} className="text-sm" />
                <Button variant="outline" onClick={() => copy(editURL, setCopiedEdit)}>
                  {copiedEdit ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="pt-5">
              <Button className="w-full" onClick={() => router.push(`/sync/${syncId}`)}>
                View Sync →
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}