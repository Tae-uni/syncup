"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { MdShare, MdEdit } from "react-icons/md";
import MostAvailableTimes from "@/components/sync/MostAvailableTimes";
import VoterDetails from "@/components/sync/VoterDetails";
import LoadingSkeleton from "@/components/sync/LoadingSkeleton";
import SyncExpiredDisplay from "@/components/sync/SyncExpiredDisplay";
import ErrorDisplay from "@/components/sync/ErrorDisplay";
import VoteForm from "@/components/sync/VoteForm";
import BestMatchCard from "@/components/sync/BestMatchCard";

import { GetSyncPayload, VoteSubmitData } from "@/types/sync";
import { getSync, submitVote, cancelVote } from "../syncApi";
import { Switch } from "@/components/ui/switch";

export default function SyncView() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [syncData, setSyncData] = useState<GetSyncPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
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
      setErrorCode(null);
    } else {
      setError(res.error || "Failed to load sync data");
      setErrorCode(res.errorCode || null);
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
    if (errorCode === 'SYNC_EXPIRED') {
      return <SyncExpiredDisplay />
    }
    return <ErrorDisplay message={error} />;
  }

  if (!syncData) {
    return <ErrorDisplay message="Sync not found" />
  }

  const { sync } = syncData;
  const isExpired = sync.expiresAt ? new Date(sync.expiresAt) < new Date() : false;
  const bestMatch = [...(sync.timeOptions || [])].sort((a, b) => b.votes.length - a.votes.length)[0];

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isExpired ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
            {isExpired ? "Expired" : "Live"}
          </span>
          <span>·</span>
          <span>{sync.participants?.length || 0} voted</span>
          <span>·</span>
          <span className="text-xs uppercase tracking-wide">
            EXPIRES {sync.expiresAt ? new Date(sync.expiresAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric"
            }) : "—"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 hover:text-gray-700">
            <MdEdit /> Edit
          </button>
          <button className="flex items-center gap-1 hover:text-gray-700">
            <MdShare /> Share
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{sync.title}</h1>
        {sync.description && (
          <p className="text-gray-500 mb-4">{sync.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span>{sync.timeZone}</span>
          <span>{sync.participants?.length || 0} participants</span>
          <span>{sync.timeOptions?.length || 0} dates</span>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs">Show in my time</span>
            <Switch checked={showLocalTime} onCheckedChange={setShowLocalTime} />
          </div>
        </div>
      </header>

      {bestMatch && (
        <BestMatchCard 
          timeOption={bestMatch}
          totalParticipants={sync.participants?.length || 0}
          participants={sync.participants || []}
          timeZone={sync.timeZone}
          showLocalTime={showLocalTime}
        />
      )}

      {/* 01 All time options */}
      <section className="mb-10">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-xs text-gray-300 font-mono">01</span>
          <h2 className="font-semibold">All time options</h2>
          <span className="ml-auto text-xs text-gray-400">Ranked by vote</span>
        </div>
        <MostAvailableTimes
          timeOptions={sync.timeOptions || []}
          totalParticipants={sync.participants?.length || 0}
          participants={sync.participants || []}
          timeZone={sync.timeZone}
          showLocalTime={showLocalTime}
        />
      </section>

      {/* 02 Cast your vote */}
      <section className="mb-10">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-xs text-gray-300 font-mono">02</span>
          <h2 className="font-semibold">Cast your vote</h2>
          <span className="ml-auto text-xs text-gray-400">Select all times you're available</span>
        </div>
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

      {/* 03 Participants */}
      <section className="mb-10">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-xs text-gray-300 font-mono">03</span>
          <h2 className="font-semibold">
            Participants <span className="text-gray-400 font-normal">({sync.participants?.length || 0})</span>
          </h2>
        </div>
        <VoterDetails
          syncData={syncData}
          timeZone={sync.timeZone}
          showLocalTime={showLocalTime}
        />
      </section>
    </main>
  );
}
