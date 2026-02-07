"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { RiTimeLine } from "react-icons/ri";
import { MdAccessTime, MdHowToVote, MdOutlineCalendarMonth, MdPeopleAlt, MdShare, MdTimer } from "react-icons/md";
import { Card, CardContent } from "@/components/ui/card";
import MostAvailableTimes from "@/components/sync/MostAvailableTimes";
import VoterDetails from "@/components/sync/VoterDetails";
import LoadingSkeleton from "@/components/sync/LoadingSkeleton";
import ErrorDisplay from "@/components/sync/ErrorDisplay";
import VoteForm from "@/components/sync/VoteForm";

import { GetSyncPayload, VoteSubmitData } from "@/types/sync";
import { getSync, submitVote, cancelVote } from "../syncApi";
import { Switch } from "@/components/ui/switch";

export default function SyncView() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [syncData, setSyncData] = useState<GetSyncPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLocalTime, setShowLocalTime] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const fetchSyncData = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;

    if (!silent) setLoading(true);

    const res = await getSync(id);

    if (res.success && res.data) {
      setSyncData(res.data);
      setError(null);
    } else {
      setError(res.error || "Failed to load sync data");
    }

    if (!silent) setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) fetchSyncData();
  }, [id, fetchSyncData]);

  const optimisticVoteSubmit = (voteData: VoteSubmitData) => {
    if (!syncData) return;

    const exists = syncData.sync.participants.some(
      (p) => p.name === voteData.participantName
    );
    if (!exists) return;

    const newSyncData = structuredClone(syncData);
    const { sync } = newSyncData;

    const participant = sync.participants.find(
      (p) => p.name === voteData.participantName
    );
    if (!participant) return;

    const participantId = participant.id;

    sync.timeOptions.forEach((option: any) => {
      option.votes = option.votes.filter(
        (vote: any) => vote.participantId !== participantId
      );
    });

    voteData.timeOptionIds.forEach(optionId => {
      const timeOption = sync.timeOptions.find((opt) => opt.id === optionId);
      if (timeOption) {
        timeOption.votes.push({
          participantId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    setSyncData(newSyncData);
  };

  const voteCancel = (participantName: string, passcode: string) => {
    if (!syncData) return;

    const exists = syncData.sync.participants.some(
      (p) => p.name === participantName
    );
    if (!exists) return;

    const newSyncData = structuredClone(syncData);
    const { sync } = newSyncData;

    const participant = sync.participants.find((p) => p.name === participantName);
    if (!participant) return;

    sync.participants = sync.participants.filter(
      (p) => p.name !== participantName
    );

    sync.timeOptions.forEach((opt) => {
      opt.votes = opt.votes.filter(
        (vote) => vote.participantId !== participant.id
      );
    });

    setSyncData(newSyncData);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!syncData) {
    return <ErrorDisplay message="Sync not found" />
  }

  const { sync } = syncData;

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
              syncData={syncData}
              showLocalTime={showLocalTime}
              error={voteError}
              formKey={formKey}
              onSubmit={async (data) => {
                setVoteError(null);
                optimisticVoteSubmit(data);

                const res = await submitVote(id, data);

                if (!res.success) {
                  setVoteError(res.error || "Invalid passcode");
                  await fetchSyncData({ silent: true });
                  return;
                }

                toast.success("Vote submitted successfully!");
                setFormKey(prev => prev + 1);
                await fetchSyncData({ silent: true });
              }}
              onCancel={async (participantName, passcode) => {
                setVoteError(null);
                voteCancel(participantName, passcode);

                const res = await cancelVote(id, participantName, passcode);

                if (!res.success) {
                  setVoteError(res.error || "Invalid passcode");
                  await fetchSyncData({ silent: true });
                  return;
                }

                toast.success("Vote cancelled successfully");
                setFormKey(prev => prev + 1);
                await fetchSyncData({ silent: true });
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
              syncData={syncData}
              timeZone={sync.timeZone}
              showLocalTime={showLocalTime}
            />
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
