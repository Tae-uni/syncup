"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SyncExpiredDisplay() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
      <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-8 rounded-md">
        <h2 className="text-xl font-bold mb-2">Sync Expired</h2>
        <p>This Sync has expired and is no longer available.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/sync")}>
          Create a new Sync
        </Button>
      </div>
    </div>
  )
}