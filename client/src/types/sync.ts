// Types of View Models
export interface SyncView {
  id: string;
  title: string;
  description?: string;
  timeZone: string;
  expiresAt?: string;
  createdAt: string;

  timeOptions: TimeOptionView[];
  participants: ParticipantView[];
}

export interface TimeOptionView {
  id: string;
  date: string;
  startTime: string;
  endTime: string;

  votes: VoteView[];
}

export interface VoteView {
  participantId: string;
  timestamp: string;
}

export interface ParticipantView {
  id: string;
  name: string;
}

// API Wrapper Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// API payloads
export interface GetSyncPayload {
  sync: SyncView;
  votes: Record<string, string[]>;
}

// Requests
export interface VoteSubmitData {
  participantName: string;
  timeOptionIds: string[];
  passcode: string;
}

export interface CancelVoteData {
  participantName: string;
  passcode: string;
}

// Results
export interface CancelVoteResult {
  deletedParticipantId: string;
}

export interface SubmitVoteResult {
  participant: ParticipantView;
  voteCount: number;
}

export interface Vote {
  id: string;
  participantId: string;
  timeOptionId: string;
  createdAt: string;
}

// Create Sync form data
export interface CreateSyncFormData {
  title: string;
  description?: string;
  timeSelector: {
    date: Date;
    startTime: string;
    endTime: string;
  }[];
  timeZone: string;
}

export type CreateSyncResult = {
  id: string;
}

// Get Sync data
// export interface SyncData {
//   success: boolean;
//   data: {
//     sync: SyncView;
//     votes: Record<string, string[]>;
//   }
// }

// export interface VoteSubmitResponse {
//   participant: ParticipantView;
//   voteCount: number;
//   participantId: string;
// }
