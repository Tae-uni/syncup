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
    id: string;
    title: string;
    description?: string;
    timeZone: string;
    expiresAt?: string; 
    createdAt: string;

    timeOptions: TimeOption[];
    participants: Participant[];
  }
}