import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl">SyncUp</h1>
      <p className="text-lg mt-8">
        Quickly sync schedule with your group - all in just a few second!
      </p>
      
      <Link href="/" className="mt-20">
        <Button variant={"default"} className="mt-20">
          Create a new meeting
        </Button>
      </Link>
    </main>
  );
}
