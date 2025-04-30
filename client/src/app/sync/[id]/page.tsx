"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import AvailabilityHeatmap from "@/components/sync/AvailabilityHeatmap";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SyncData } from "@/types/sync";
import { buildHeatmapData } from "@/lib/heatmapConvert";
import { getSync } from "../syncApi";

export default function SyncView() {
  const params = useParams();
  // const id = params.id as string;

  // const [loading, setLoading] = useState(true);
  // const [syncData, setSyncData] = useState<SyncData | null>(null);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   async function loadSync() {
  //     setLoading(true);
  //     try {
  //       const result = await getSync(id);
  //       if (result.success) {
  //         setSyncData(result.data ?? null);
  //       } else {
  //         setError(result.error || "Failed to load sync data");
  //       }
  //     } catch (error) {
  //       setError("An unexpected error occurred");
  //       console.error(error)
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   if (id) {
  //     loadSync();
  //   }
  // }, [id]);

  // if (loading) {
  //   return <LoadingSkeleton />;
  // }

  // if (error) {
  //   return <ErrorDisplay message={error} />;
  // }

  // if (!syncData) {
  //   return <ErrorDisplay message="Sync not found" />
  // }

  const syncData: SyncData = {
    id: "mock-id-1",
    title: "Team Weekly Planning",
    description: "Let's find the best time for our weekly team meeting. Please vote for all times that work for you.",
    timeZone: "Asia/Seoul",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    timeOptions: [
      {
        id: "to1",
        syncId: "mock-id-1",
        date: "2023-08-10",
        startTime: "09:00:00",
        endTime: "10:00:00",
        createdByParticipantId: null,
        createdAt: new Date().toISOString(),
        votes: [
          { id: "v1", participantId: "p1", timeOptionId: "to1", createdAt: new Date().toISOString() },
          { id: "v2", participantId: "p2", timeOptionId: "to1", createdAt: new Date().toISOString() },
          { id: "v3", participantId: "p3", timeOptionId: "to1", createdAt: new Date().toISOString() }
        ]
      },
      {
        id: "to2",
        syncId: "mock-id-1",
        date: "2023-08-11",
        startTime: "14:00:00",
        endTime: "15:00:00",
        createdByParticipantId: null,
        createdAt: new Date().toISOString(),
        votes: [
          { id: "v4", participantId: "p1", timeOptionId: "to2", createdAt: new Date().toISOString() },
          { id: "v5", participantId: "p4", timeOptionId: "to2", createdAt: new Date().toISOString() }
        ]
      },
    ],
    participants: [
      {
        id: "p1",
        name: "Alex Kim",
        syncId: "mock-id-1",
        createdAt: new Date().toISOString(),
        votes: [],
        TimeOption: []
      },
      {
        id: "p2",
        name: "Jessica Park",
        syncId: "mock-id-1",
        createdAt: new Date().toISOString(),
        votes: [],
        TimeOption: []
      },
    ]
  };

  type ParticipantNameOnly = Pick<SyncData['participants'][number], 'name'>;
  const participantNames: ParticipantNameOnly[] = syncData.participants.map(p => ({ name: p.name }))

  const dates = Array.from(new Set(syncData.timeOptions.map(opt => opt.date)));
  const timeBlocks = getAllTimeBlocks(syncData.timeOptions);
  const heatmapData = buildHeatmapData(syncData.timeOptions, dates, timeBlocks);
  const totalParticipants = syncData.participants.length;
  return (
    <main>
      <header className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{syncData.title}</h1>
        {syncData.description && (
          <h2 className="text-lg font-medium mb-4">{syncData.description}</h2>
        )}
        <div className="mt-10 flex justify-between">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            Host Timezone: {syncData.timeZone}
          </div>
          {syncData.expiresAt && (
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-sm text-sm">
              Expires at: {new Date(syncData.expiresAt).toLocaleString()}
            </div>
          )}
        </div>
      </header>

      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{syncData.participants.length} Participants</h2>
          <ul className="list-disc list-inside pl-5">
            {participantNames.map((p) => (
              <li key={p.name}>{p.name}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Heatmap</h2>
          {/* TODO:Heatmap component */}
          <AvailabilityHeatmap data={heatmapData} dates={dates} timeBlocks={timeBlocks} totalParticipants={totalParticipants}/>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-4">
            Most available time:
            {/* TODO: Show the most available time */}
          </h2>
        </section>
      </section>

      <section>
        {/* TODO: Share link button */}
      </section>
    </main>
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Skeleton className="h-10 w-3/4 mb-4" />
      <Skeleton className="h-20 w-full mb-8" />
      <Skeleton className="h-60 w-full mb-8" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
      <div className="bg-red-50 border border-red-20 text-red-700 px-4 py-8 rounded-md">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{message}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
}

// 9am - 5pm every 30 minutes
function getDefaultTimeBlocks() {
  const blocks: string[] = [];
  for (let hour = 9; hour < 17; hour++) {
    blocks.push(`${hour.toString().padStart(2, "0")}:00`);
    blocks.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  blocks.push("17:00");
  return blocks;
}

// Get all time blocks from time options
function getAllTimeBlocks(timeOptions: SyncData["timeOptions"]) {
  const defaultBlocks = getDefaultTimeBlocks();
  const userBlocks = new Set(defaultBlocks);

  timeOptions.forEach(opt => {
    // 09:00:00 -> 09:00 format change
    const start = opt.startTime.slice(0, 5);
    const end = opt.endTime.slice(0, 5);
    userBlocks.add(start);
    userBlocks.add(end);
  });

  return Array.from(userBlocks).sort();
}