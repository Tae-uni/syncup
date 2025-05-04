"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  message: string;
}

export default function ErrorDisplay({ message }: ErrorDisplayProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
      <div className="bg-red-50 border border-red-20 text-red-700 px-4 py-8 rounded-md">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{message}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/sync")}>
          Go Back
        </Button>
      </div>
    </div>
  );
} 