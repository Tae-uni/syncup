"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BombIcon, ClockIcon } from "lucide-react";

import MostAvailableTimes from "@/components/sync/MostAvailableTimes";
import TimeGridHeatmap from "@/components/sync/TimeGridHeatmap";
import VoterDetails from "@/components/sync/VoterDetails";
import LoadingSkeleton from "@/components/sync/LoadingSkeleton";
import ErrorDisplay from "@/components/sync/ErrorDisplay";

import { SyncData } from "@/types/sync";
import { getSync } from "../syncApi";
import { getAllSelectedTimeBlocks, createVoteDataMap } from "@/lib/timeUtils";

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

  const voteData = createVoteDataMap(syncData.timeOptions, timeBlocks);

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
          {/* Heatmap component */}
          <TimeGridHeatmap
            dates={dates}
            timeBlocks={timeBlocks}
            voteData={voteData}
            totalParticipants={syncData.participants.length}
          />
        </section>

        {/* Participant availability section */}
        <section className="container mx-auto px-4 py-4 max-w-4xl mb-8">
          <VoterDetails
            syncData={syncData}
            dates={dates}
            timeBlocks={timeBlocks}
          />
        </section>
      </section>

      <section>
        {/* TODO: Share link button */}
      </section>
    </main>
  )
}
