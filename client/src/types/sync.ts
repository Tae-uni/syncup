export interface TimeOption {
  id: string;
  syncId: string;
  date: string;       
  startTime: string;  
  endTime: string;    
  createdByParticipantId?: string | null;
  createdAt: string;

  votes: Vote[];
}

export interface Participant {
  id: string;
  name: string;
  syncId: string;
  createdAt: string;

  votes: Vote[];
  TimeOption: TimeOption[];
}

export interface Vote {
  id: string;
  participantId: string;
  timeOptionId: string;
  createdAt: string;
}

export interface VoteSubmitData {
  participantName: string;
  timeOptionIds: string[];
}

// export interface VoteSubmitResponse {
//   success: boolean;
//   data?: {
//     participant: Participant;
//     votes: Vote[];
//   };
//   error?: string;
// }

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

// Get Sync data
export interface SyncData {
  success: boolean;
  data: {
    sync: {
    id: string;
    title: string;
    description?: string;
    timeZone: string;
    expiresAt?: string; 
    createdAt: string;

    timeOptions: TimeOption[];
    participants: Participant[];
    }
    votes: Record<string, string[]>;
  }
}