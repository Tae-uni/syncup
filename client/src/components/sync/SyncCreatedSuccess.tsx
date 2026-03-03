"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <main className="flex flex-col items-center justify-center min-h-screen p-10">
            <h1 className="text-3xl font-bold mb-2">Sync Created!</h1>
            <p className="text-gray-500 mb-10">
                Save the links below. You&apos;ll need the edit link to manage your sync.
            </p>

            <div className="flex flex-col w-full max-w-md gap-6">
                <div>
                    <p className="text-sm font-medium mb-1">Participant link</p>
                    <p className="text-xs text-gray-400 mb-2">Share this with participants to collect votes.</p>
                    <div className="flex gap-2">
                        <Input readOnly value={participantURL} className="bg-gray-50 text-sm" />
                        <Button variant="outline" onClick={() => copy(participantURL, setCopiedParticipant)}>
                            {copiedParticipant ? "Copied!" : "Copy"}
                        </Button>
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium mb-1">Leader edit link</p>
                    <p className="text-xs text-gray-400 mb-2">Keep this private. You&apos;ll use it with your passcode to edit the sync.</p>
                    <div className="flex gap-2">
                        <Input readOnly value={editURL} className="bg-gray-50 text-sm" />
                        <Button variant="outline" onClick={() => copy(editURL, setCopiedEdit)}>
                            {copiedEdit ? "Copied!" : "Copy"}
                        </Button>
                    </div>
                </div>

                <Button className="mt-2 bg-blue-500 text-white hover:bg-blue-600" onClick={() => router.push(`/sync/${syncId}`)}>
                    View Sync
                </Button>
            </div>
        </main>
    )
}