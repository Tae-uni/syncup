export async function createSync(formData: {
  title: string;
  description?: string;
  timeSelector: {
    date: Date;
    startTime: string;
    endTime: string;
  }[];
  timeZone: string;
}) {
  try {
    const timeSelector = formData.timeSelector.map(item => {
      const dataStr = item.date.toISOString().split('T')[0];

      return {
        date: dataStr,
        startTime: item.startTime,
        endTime: item.endTime,
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
      throw new Error(errorData.message || 'Failed to create sync');
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Error creating sync:', error);
    return { success: false, error: 'Failed to create sync' };
  }
}