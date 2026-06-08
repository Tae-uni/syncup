"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";

import { Input } from "@/components/ui/input";
import { verifyLeader } from "@/app/sync/syncApi";
import SyncEditForm from "@/components/sync/SyncEditForm";

export default function EditSyncPage() {
  const { id } = useParams<{ id: string }>();
  const [passcode, setPasscode] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVerify = async (code: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await verifyLeader(id, code);
      if (result.success) {
        setVerified(true);
      } else {
        setError(result.error ?? "Invalid passcode");
        setPasscode("");
        inputRef.current?.focus();
      }
    } catch {
      setError("An error occurred. Please try again.");
      setPasscode("");
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (passcode.length === 4 && !isSubmitting) {
      handleVerify(passcode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passcode]);

  if (verified) {
    return <SyncEditForm syncId={id} passcode={passcode} />;
  }

  return (
    <main className="relative min-h-screen p-10">
      <Link
        href={`/sync/${id}`}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <MdArrowBack /> Back to sync
      </Link>

      <div className="mx-auto pt-[20vh] w-full max-w-sm flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Enter your passcode
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Required to edit this sync
        </p>

        <Input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={passcode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 4);
            setPasscode(val);
            if (error) setError(null);
          }}
          autoFocus
          className="sr-only caret-transparent"
          aria-label="Passcode"
        />
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex gap-5 cursor-pointer"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-colors ${i < passcode.length
                ? "bg-indigo-950 border-indigo-950"
                : "border-gray-300"
                }`}
            />
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-8 h-4">
          {isSubmitting ? "Verifying..." : ""}
        </p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </main>
  );
}