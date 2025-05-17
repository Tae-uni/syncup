import { convertToUTC } from "@/lib/timezoneConvert";
import { CreateSyncFormData, SyncData, VoteSubmitData } from "@/types/sync";

export async function createSync(formData: CreateSyncFormData) {
  try {
    const timeSelector = formData.timeSelector.map(item => {
      const dateStr = item.date.toISOString().split('T')[0];

      const startInUTC = convertToUTC(dateStr, item.startTime, formData.timeZone);
      const endInUTC = convertToUTC(dateStr, item.endTime, formData.timeZone);

      return {
        date: dateStr,
        startTime: startInUTC,
        endTime: endInUTC,
        // originalTimeZone: formData.timeZone,
      };
    });

    const serverData = {
      title: formData.title,
      description: formData.description,
      timeSelector,
      timeZone: formData.timeZone,
    };

    console.log('Payload to server:', JSON.stringify(serverData, null, 2));

    const response = await fetch(`http://localhost:5002/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serverData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error details:', errorData);
      throw new Error(errorData.message || 'Failed to create sync');
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Error creating sync:', error);
    return { success: false, error: 'Failed to create sync' };
  }
}

export async function getSync(id: string): Promise<{ success: boolean, data?: SyncData, error?: string }> {
  try {
    const response = await fetch(`http://localhost:5002/api/sync/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch sync');
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Error fetching sync:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sync'
    };
  }
}

export async function submitVote(syncId: string, data: VoteSubmitData): Promise<{ success: boolean, data?: SyncData, error?: string }> {
  try {
    const response = await fetch(`http://localhost:5002/api/sync/${syncId}/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participantName: data.participantName,
        timeOptionIds: data.timeOptionIds
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit vote');
    }

    const result = await response.json();
    return { success: true, data: result };

  } catch (error) {
    console.error('Error submitting vote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit vote'
    };
  }
}

export async function cancelVote(syncId: string, participantName: string): Promise<{ success: boolean, data?: SyncData, error?: string }> {
  try {
    const response = await fetch(`http://localhost:5002/api/sync/${syncId}/votes`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participantName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel vote');
    }

    const result = await response.json();
    return { success: true, data: result};
  } catch (error) {    
    console.error('Error cancelling vote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel vote'
    };
  }
}