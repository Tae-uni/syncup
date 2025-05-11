"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RiTimeLine } from "react-icons/ri";
import { MdPeopleAlt, MdShare, MdTimer } from "react-icons/md";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MostAvailableTimes from "@/components/sync/MostAvailableTimes";
import TimeGridHeatmap from "@/components/sync/TimeGridHeatmap";
import VoterDetails from "@/components/sync/VoterDetails";
import LoadingSkeleton from "@/components/sync/LoadingSkeleton";
import ErrorDisplay from "@/components/sync/ErrorDisplay";

import { getAllSelectedTimeBlocks, createVoteDataMap } from "@/lib/heatmapTimeUtils";
import { SyncData } from "@/types/sync";
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

  const { sync } = syncData.data;

  // type ParticipantNameOnly = Pick<SyncData['data']['sync']['participants'][number], 'name'>;
  // const participantNames: ParticipantNameOnly[] = (sync.participants?.map(p => ({ name: p.name }))) || [];


  // Get all unique dates from the time options
  // const dates = Array.from(new Set(
  //   sync.timeOptions?.map(opt => {
  //     return new Date(opt.date).toISOString().split('T')[0];
  //   }) || []
  // ));

  // Get all time blocks including those outside the default range
  // const timeBlocks = getAllSelectedTimeBlocks(sync.timeOptions || []);

  // const voteData = createVoteDataMap(sync.timeOptions || [], timeBlocks);

  return (
    <main>
      <header className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">{sync.title}</h1>
        {sync.description && (
          <h2 className="text-lg mb-6">{sync.description}</h2>
        )}
        <div className="text-sm space-x-2 text-gray-600">
          <RiTimeLine className="w-5 h-5 inline-block" /> {sync.timeZone}
          <MdPeopleAlt className="w-5 h-5 inline-block" /> {sync.participants?.length || 0} participants
          <MdTimer className="w-5 h-5 inline-block" /> {sync.expiresAt ? new Date(sync.expiresAt).toLocaleString() : 'No expiration date'}
          {/* TODO: Add share link */}
          <MdShare className="w-5 h-5 inline-block" /> 
        </div>
      </header>

      <section className="container mx-auto px-4 pt-4 max-w-4xl mb-1">
        <Card>
          <CardHeader className="rounded-t-xl">
            <CardTitle className="text-lg font-semibold">
              Most available time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Most available time */}
            <MostAvailableTimes
              timeOptions={sync.timeOptions || []}
              totalParticipants={sync.participants?.length || 0}
              timeZone={sync.timeZone}
              limit={2}
            />
          </CardContent>
        </Card>
      </section>

      {/* Heatmap component
      <section className="container mx-auto px-4 py-4 max-w-4xl mb-2">
        <Card>
          <CardHeader className="rounded-t-xl">
            <CardTitle className="text-lg font-semibold">
              Detailed availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeGridHeatmap
              dates={dates}
              timeBlocks={timeBlocks}
              voteData={voteData}
              totalParticipants={sync.participants?.length || 0}
            />
          </CardContent>
        </Card>
      </section>
      */}

      {/* Participant availability section */}
      <section className="container mx-auto px-4 py-4 max-w-4xl mb-2">
        <Card>
          <CardHeader className="rounded-t-xl">
            <CardTitle className="text-lg font-semibold mb-2">
              Participant Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VoterDetails
              syncData={syncData.data}
              timeZone={sync.timeZone}
            />
          </CardContent>
        </Card>
      </section>

      <section>
        {/* TODO: Share link button */}
      </section>
    </main>
  )
}
