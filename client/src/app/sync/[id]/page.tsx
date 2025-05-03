"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BombIcon, ClockIcon } from "lucide-react";

import MostAvailableTimes from "@/components/sync/MostAvailableTimes";
import TimeGridHeatmap from "@/components/sync/TimeGridHeatmap";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SyncData } from "@/types/sync";
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

  // Mock data
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
        startTime: "07:30:00",
        endTime: "10:00:00",
        createdByParticipantId: null,
        createdAt: new Date().toISOString(),
        votes: [
          { id: "v1", participantId: "p1", timeOptionId: "to1", createdAt: new Date().toISOString() },
          { id: "v2", participantId: "p2", timeOptionId: "to1", createdAt: new Date().toISOString() },
          { id: "v3", participantId: "p3", timeOptionId: "to1", createdAt: new Date().toISOString() },
          { id: "v4", participantId: "p1", timeOptionId: "to2", createdAt: new Date().toISOString() },
        ]
      },
      {
        id: "to2",
        syncId: "mock-id-1",
        date: "2023-08-11",
        startTime: "15:00:00",
        endTime: "16:30:00",
        createdByParticipantId: null,
        createdAt: new Date().toISOString(),
        votes: [
          { id: "v4", participantId: "p1", timeOptionId: "to2", createdAt: new Date().toISOString() },
          { id: "v5", participantId: "p4", timeOptionId: "to2", createdAt: new Date().toISOString() }
        ]
      },
      {
        id: "to3",
        syncId: "mock-id-1",
        date: "2023-08-12",
        startTime: "10:30:00",
        endTime: "12:00:00",
        createdByParticipantId: null,
        createdAt: new Date().toISOString(),
        votes: [
          { id: "v1", participantId: "p1", timeOptionId: "to1", createdAt: new Date().toISOString() },
          { id: "v2", participantId: "p2", timeOptionId: "to1", createdAt: new Date().toISOString() },
          { id: "v3", participantId: "p3", timeOptionId: "to1", createdAt: new Date().toISOString() },
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
      {
        id: "p3",
        name: "John Doe",
        syncId: "mock-id-1",
        createdAt: new Date().toISOString(),
        votes: [],
        TimeOption: []
      },
      {
        id: "p4",
        name: "Jane Smith",
        syncId: "mock-id-1",
        createdAt: new Date().toISOString(),
        votes: [],
        TimeOption: []
      },
      {
        id: "p5",
        name: "John Doe",
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
  // Get all time blocks including those outside the default range
  const timeBlocks = getAllSelectedTimeBlocks(syncData.timeOptions);

  const voteData = new Map<string, number>();

  syncData.timeOptions.forEach(opt => {
    const startTime = opt.startTime.slice(0, 5);
    const endTime = opt.endTime.slice(0, 5);
    
    const startIdx = timeBlocks.indexOf(startTime);
    const endIdx = timeBlocks.indexOf(endTime);

    if (startIdx !== -1 && endIdx !== -1) {
      for (let i = startIdx; i <= endIdx; i++) {
        const key = `${opt.date}_${timeBlocks[i]}`;
        voteData.set(key, (voteData.get(key) || 0) + opt.votes.length);
      }
    }
  });

  return (
    <main>
      <header className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{syncData.title}</h1>
        {syncData.description && (
          <h2 className="text-lg font-medium mb-4">{syncData.description}</h2>
        )}
        <div className="py-1 text-sm font-mono">
          <ClockIcon className="w-5 h-5 inline-block" /> {syncData.timeZone}
          {syncData.expiresAt && (
            <div className="font-mono">
              <BombIcon className="w-5 h-5 inline-block" /> {new Date(syncData.expiresAt).toLocaleString()}
            </div>
          )}
        </div>
      </header>
      <hr className="mx-4" />
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{syncData.participants.length} Participants</h2>
          <ul className="list-disc list-inside pl-5">
            {participantNames.map((p) => (
              <li key={p.name}>{p.name}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">
            Most available time
          </h2>
          {/* Most available time */}
          <MostAvailableTimes
            timeOptions={syncData.timeOptions}
            totalParticipants={syncData.participants.length}
            limit={2}
          />
          {/* Heatmap component */}
        </section>

        <section className="mb-8">
          {/* <h2 className="text-xl font-semibold mb-4 mt-4">Heatmap</h2> */}
          {/* Heatmap 컴포넌트 */}
          <TimeGridHeatmap
            dates={dates}
            timeBlocks={timeBlocks}
            voteData={voteData}
            totalParticipants={syncData.participants.length}
          />
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

// Get all selected time blocks including the extended range
function getAllSelectedTimeBlocks(timeOptions: SyncData["timeOptions"]) {
  const blocks = new Set<string>();

  // Add 9:00-17:00 in 30min increments
  for (let hour = 9; hour < 17; hour++) {
    blocks.add(`${hour.toString().padStart(2, "0")}:00`);
    blocks.add(`${hour.toString().padStart(2, "0")}:30`);
  }
  blocks.add('17:00');
  
  // Add any additional blocks from time options
  timeOptions.forEach(opt => {
    const startTime = opt.startTime.slice(0, 5);
    const endTime = opt.endTime.slice(0, 5);

    blocks.add(startTime);

    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);

    let currentHour = startHour;
    let currentMinute = startMinute;

    // Add blocks in 30min increments between start and end
    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }

      const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
      blocks.add(timeStr);
    }
  });

  return Array.from(blocks).sort((a, b) => {
    const [aHour, aMinute] = a.split(':').map(Number);
    const [bHour, bMinute] = b.split(':').map(Number);

    if (aHour !== bHour) return aHour - bHour;
    return aMinute - bMinute;
  });
}