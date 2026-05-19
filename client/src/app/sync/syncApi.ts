import { convertToUTC } from "@/lib/timezoneConvert";
import {
  CreateSyncFormData,
  GetSyncPayload,
  VoteSubmitData,
  ApiResponse,
  SubmitVoteResult,
  CancelVoteResult,
  CreateSyncResult,
} from "@/types/sync";

const API_BASE_URL = "http://localhost:5002/api";

function humanizeErrorMessage(path: string | undefined, message: string): string {
  const timeSelectorMatch = path?.match(/^timeSelector\.(\d+)$/);
  if (timeSelectorMatch) {
    const slotNumber = parseInt(timeSelectorMatch[1], 10) + 1;
    return `Time slot ${slotNumber}: ${humanizeMessage(message)}`;
  }

  if (path === "timeSelector") {
    return humanizeMessage(message);
  }

  if (path === "title") {
    return `Title: ${humanizeMessage(message)}`;
  }

  return humanizeMessage(message);
}

function humanizeMessage(message: string): string {
  const messageMap: Record<string, string> = {
    "At least one time selector is required": "Please add at least one time slot",
    "End time must be after start time": "End time must be after start time",
    "Invalid start time": "Invalid start time format",
    "Invalid end time": "Invalid end time format",
    "Title is required": "Please enter a title",
    "Invalid time zone": "Invalid timezone selected",
  };

  return messageMap[message] || message;
}

type ServerFail =
  | {
    success: false;
    error?: {
      code?: string;
      message?: string;
      details?: Array<{ path?: string; message: string }>;
    };
  }
  | { success: false; errors?: Array<{ path?: string; message: string }> }
  | { success: false; error?: string; code?: string };

async function parseServerError(res: Response): Promise<{ message: string; code?: string }> {
  try {
    const body = (await res.json()) as ServerFail;

    if ("error" in body && typeof body.error === "object") {
      const { code, message, details } = body.error;

      // details가 있으면 사용자 친화적 메시지로 변환
      if (details && Array.isArray(details) && details.length > 0) {
        return {
          message: details.map((d) => humanizeErrorMessage(d.path, d.message)).join("\n"),
          code,
        };
      }

      if (message) {
        return { message: humanizeMessage(message), code };
      }
    }

    if ("errors" in body && body.errors?.length) {
      return {
        message: body.errors.map((e) => humanizeErrorMessage(e.path, e.message)).join("\n"),
      };
    }

    if ("error" in body && typeof body.error === "string") {
      return { message: humanizeMessage(body.error) };
    }
  } catch { }

  return { message: `Request failed (${res.status})` };
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const { message, code } = await parseServerError(res);
    return { success: false, error: message, errorCode: code };
  }

  try {
    const json = await res.json();
    return { success: true, data: json.data as T };
  } catch {
    return { success: false, error: "Invalid response from server" };
  }
}

export async function createSync(
  formData: CreateSyncFormData,
): Promise<ApiResponse<CreateSyncResult>> {
  const timeSelector = formData.timeSelector.map((item) => {
    const year = item.date.getFullYear();
    const month = String(item.date.getMonth() + 1).padStart(2, "0");
    const day = String(item.date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

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
    leaderPasscode: formData.leaderPasscode,
    ...(formData.expiresAt && { expiresAt: formData.expiresAt }),
  };

  console.log("Payload to server:", JSON.stringify(serverData, null, 2));

  return request<CreateSyncResult>(`${API_BASE_URL}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(serverData),
  });
}

export async function getSync(id: string): Promise<ApiResponse<GetSyncPayload>> {
  return request<GetSyncPayload>(`${API_BASE_URL}/sync/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

export async function updateSync(
  syncId: string,
  formData: CreateSyncFormData,
): Promise<ApiResponse<CreateSyncResult>> {
  const timeSelector = formData.timeSelector.map((item) => {
    const year = item.date.getFullYear();
    const month = String(item.date.getMonth() + 1).padStart(2, "0");
    const day = String(item.date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const startInUTC = convertToUTC(dateStr, item.startTime, formData.timeZone);
    const endInUTC = convertToUTC(dateStr, item.endTime, formData.timeZone);
    return { date: dateStr, startTime: startInUTC, endTime: endInUTC };
  });

  return request<CreateSyncResult>(`${API_BASE_URL}/sync/${syncId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: formData.title,
      description: formData.description,
      timeZone: formData.timeZone,
      timeSelector,
      leaderPasscode: formData.leaderPasscode,
    }),
  });
}

export async function deleteSync(syncId: string, leaderPasscode: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE_URL}/sync/${syncId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leaderPasscode }),
  });

  if (!res.ok) {
    const { message, code } = await parseServerError(res);
    return { success: false, error: message, errorCode: code };
  }

  return { success: true };
}

export async function verifyLeader(syncId: string, passcode: string): Promise<ApiResponse<void>> {
  return request<void>(`${API_BASE_URL}/sync/${syncId}/verify-leader`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leaderPasscode: passcode }),
  });
}

export async function submitVote(
  syncId: string,
  data: VoteSubmitData,
): Promise<ApiResponse<SubmitVoteResult>> {
  return request<SubmitVoteResult>(`${API_BASE_URL}/sync/${syncId}/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function cancelVote(
  syncId: string,
  participantName: string,
  passcode: string,
): Promise<ApiResponse<CancelVoteResult>> {
  return request<CancelVoteResult>(`${API_BASE_URL}/sync/${syncId}/votes`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantName, passcode }),
  });
}
