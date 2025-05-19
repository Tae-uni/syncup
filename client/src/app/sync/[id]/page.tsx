"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RiTimeLine } from "react-icons/ri";
import { MdAccessTime, MdHowToVote, MdOutlineCalendarMonth, MdPeopleAlt, MdShare, MdTimer } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";
import MostAvailableTimes from "@/components/sync/MostAvailableTimes";
import TimeGridHeatmap from "@/components/sync/TimeGridHeatmap";
import VoterDetails from "@/components/sync/VoterDetails";
import LoadingSkeleton from "@/components/sync/LoadingSkeleton";
import ErrorDisplay from "@/components/sync/ErrorDisplay";
import VoteForm from "@/components/sync/VoteForm";

import { getAllSelectedTimeBlocks, createVoteDataMap } from "@/lib/heatmapTimeUtils";
import { SyncData, VoteSubmitData } from "@/types/sync";
import { getSync, submitVote, cancelVote } from "../syncApi";
import { Switch } from "@/components/ui/switch";

export default function SyncView() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLocalTime, setShowLocalTime] = useState(false);

  const fetchSyncData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSync(id);
      if (result.success) setSyncData(result.data ?? null);
      else setError(result.error || "Failed to load sync data");
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchSyncData();
  }, [id, fetchSyncData]);

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
    <main className="max-w-4xl mx-auto mt-8">
      <Card className="overflow-hidden shadow-xl">
        <div className="bg-gradient-to-br from-orange-400 to-teal-400 p-6 pb-4 relative">
          <header>
            <h1 className="text-2xl font-bold text-white mb-1">{sync.title}</h1>
            {sync.description && (
              <p className="text-white/90 text-base mb-3">{sync.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-white/80 text-base">
              <span><RiTimeLine className="inline mr-1" />{sync.timeZone}</span>
              <span><MdPeopleAlt className="inline mr-1" />{sync.participants?.length || 0} Participants</span>
              <span><MdTimer className="inline mr-1" />Expires: {sync.expiresAt ? new Date(sync.expiresAt).toLocaleDateString() : 'No expiration'}</span>
              <div className="flex items-center gap-2">
                <MdAccessTime className="text-gray-500" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show local time</span>
                  <Switch
                    checked={showLocalTime}
                    onCheckedChange={setShowLocalTime}
                    className="data-[state=checked]:bg-teal-500"
                  />
                </div>
              </div>
              <button className="ml-auto"><MdShare className="inline" /></button>
            </div>
          </header>
        </div>
        {/* Components*/}
        <CardContent className="bg-white p-6 space-y-8">
          {/* Most Available Time */}
          <section>
            <h2 className="flex gap-2 items-center text-xl font-semibold mb-2">
              <MdOutlineCalendarMonth className="text-xl" />
              Most Available Time
            </h2>
            <MostAvailableTimes
              timeOptions={sync.timeOptions || []}
              totalParticipants={sync.participants?.length || 0}
              timeZone={sync.timeZone}
              showLocalTime={showLocalTime}
              limit={2}
            />
          </section>
          {/* Availability Heatmap or Grid */}
          {/* <section>
            <h2 className="text-base font-semibold mb-2 text-gray-700">Availability</h2>
          </section> */}

          {/* Vote Form */}
          <section>
            <h2 className="flex gap-2 items-center text-xl font-semibold mb-4">
              <MdHowToVote className="text-xl" />
              Vote Your Availability
            </h2>
            {/* <p className="text-sm text-gray-500 italic">Please select all times that work for you</p>
            <hr className="mt-2 mb-4" /> */}
            <VoteForm
              syncData={syncData.data}
              showLocalTime={showLocalTime}
              onSubmit={async (data) => {
                await submitVote(id, data)
                // Refresh the sync data
                await fetchSyncData();
              }}
              onCancel={async (participantName) => {
                await cancelVote(id, participantName);
                // Refresh the sync data
                await fetchSyncData();
              }}
            />
          </section>

          {/* Voter Details */}
          <section>
            {/* <h2 className="flex gap-2 items-center text-xl font-semibold mb-2 text-gray-700">
              <MdGroup className="text-2xl" />
              Voter Details
            </h2> */}
            <VoterDetails
              syncData={syncData.data}
              timeZone={sync.timeZone}
              showLocalTime={showLocalTime}
            />
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
