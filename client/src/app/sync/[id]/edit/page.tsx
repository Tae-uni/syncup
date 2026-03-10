"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verifyLeader } from "@/app/sync/syncApi";
import SyncEditForm from "@/components/sync/SyncEditForm";

export default function EditSyncPage() {
    const { id } = useParams<{ id: string }>();
    const [passcode, setPasscode] = useState("");
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVerify = async () => {
        setError(null);
        setIsSubmitting(true);
        try {
            const result = await verifyLeader(id, passcode);
            if (result.success) {
                setVerified(true);
            } else {
                setError(result.error ?? "Invalid passcode");
            }
        } catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (verified) {
        return <SyncEditForm syncId={id} passcode={passcode} />;
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-10">
            <h1 className="text-3xl font-bold mb-2">Leader Verification</h1>
            <p className="text-gray-500 mb-8">
                Enter your passcode to edit this sync.
            </p>
            <div className="flex flex-col w-full max-w-xs">
                <Label htmlFor="passcode">Passcode</Label>
                <Input
                    id="passcode"
                    type="password"
                    maxLength={4}
                    placeholder="Enter 4-digit passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="mt-3"
                />
                {error && <p className="text-red-500 text-sm mt-1 ms-1">{error}</p>}
            </div>
            <Button
                onClick={handleVerify}
                disabled={isSubmitting || passcode.length !== 4}
                className="bg-blue-400 text-white hover:bg-blue-600 mt-5"
            >
                {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
        </main>
    );
}