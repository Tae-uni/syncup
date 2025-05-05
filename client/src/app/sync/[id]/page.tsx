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
import { getAllSelectedTimeBlocks, createVoteDataMap } from "@/lib/timeUtils";
import { getSync } from "../syncApi";

export default function SyncView() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSync() {
      setLoading(true);
      try {
        const result = await getSync(id);
        if (result.success) {
          setSyncData(result.data ?? null);
          console.log('API response:', result);
          console.log('Sync data:', result.data);
        } else {
          setError(result.error || "Failed to load sync data");
        }
      } catch (error) {
        setError("An unexpected error occurred");
        console.error(error)
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadSync();
    }
  }, [id]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!syncData) {
    return <ErrorDisplay message="Sync not found" />
  }

  console.log('syncData-title:', syncData.data.title);
  type ParticipantNameOnly = Pick<SyncData['data']['participants'][number], 'name'>;
  const participantNames: ParticipantNameOnly[] = (syncData.data.participants?.map(p => ({ name: p.name }))) || [];

  const dates = Array.from(new Set(
    syncData.data.timeOptions?.map(opt => {
      return new Date(opt.date).toISOString().split('T')[0];
    }) || []
  ));

  // Get all time blocks including those outside the default range
  const timeBlocks = getAllSelectedTimeBlocks(syncData.data.timeOptions || []);

  const voteData = createVoteDataMap(syncData.data.timeOptions || [], timeBlocks);

  return (
    <main>
      <header className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{syncData.data.title}</h1>
        {syncData.data.description && (
          <h2 className="text-lg font-medium mb-4">{syncData.data.description}</h2>
        )}
        <div className="py-1 text-sm font-mono">
          <ClockIcon className="w-5 h-5 inline-block" /> {syncData.data.timeZone}
          {syncData.data.expiresAt && (
            <div className="font-mono">
              <BombIcon className="w-5 h-5 inline-block" /> {new Date(syncData.data.expiresAt).toLocaleString()}
            </div>
          )}
        </div>
      </header>
      <hr className="mx-4" />
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{syncData.data.participants?.length || 0} Participants</h2>
          {participantNames.length > 0 ? (
            <ul className="list-disc list-inside pl-5">
              {participantNames.map((p, index) => (
                <li key={index}>{p.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No participants yet</p>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">
            Most available time
          </h2>
          {/* Most available time */}
          <MostAvailableTimes
            timeOptions={syncData.data.timeOptions || []}
            totalParticipants={syncData.data.participants?.length || 0}
            limit={2}
          />
          {/* Heatmap component */}
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Detailed availability
          </h2>
          {/* Heatmap component */}
          <TimeGridHeatmap
            dates={dates}
            timeBlocks={timeBlocks}
            voteData={voteData}
            totalParticipants={syncData.data.participants?.length || 0}
          />
        </section>

        {/* Participant availability section */}
        <section className="container mx-auto px-4 py-4 max-w-4xl mb-8">
          <h2 className="text-lg font-semibold mb-4">Participant Votes</h2>
          <VoterDetails
            syncData={syncData.data}
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
