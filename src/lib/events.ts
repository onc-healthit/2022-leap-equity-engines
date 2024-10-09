"use server";

import {
  ActionState,
  EventCluster,
  EventFilter,
  Group,
  Patient,
  PatientEvent,
  PatientEventBase,
  PatientEventMinMax,
} from "./types";
import { config } from "./config";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getTokens } from "next-firebase-auth-edge";

export async function fetchPatients(): Promise<Patient[]> {
  const headers = await getAuthHeader();
  const response = await fetch(`${config.backendUrl}/api/v1/patients`, {
    headers: headers,
  });
  const resp = await response.json();
  return resp.data.patients;
}

export async function fetchPatient(id: string): Promise<Patient> {
  const headers = await getAuthHeader();
  const response = await fetch(`${config.backendUrl}/api/v1/patients/${id}`, {
    headers: headers,
  });
  const resp = await response.json();
  return resp.data.patient;
}

export async function fetchEventClusters(id: string, query: string = "", filter = "default"): Promise<EventCluster[]> {
  const queryParmas = new URLSearchParams({ q: query, f: filter });
  const headers = await getAuthHeader();
  const response = await fetch(`${config.backendUrl}/api/v1/clusters/${id}?${queryParmas.toString()}`, {
    headers: headers,
  });
  const resp = await response.json();
  if (!resp.data?.clusters) return [];
  return resp.data.clusters as EventCluster[];
}

export async function fetchPatientEvents(
  id: string,
  eventName: string,
  filter = "default",
  query = "",
): Promise<PatientEvent[]> {
  const headers = await getAuthHeader();
  const queryParmas = new URLSearchParams({ q: query, e: eventName, f: filter });
  const response = await fetch(`${config.backendUrl}/api/v1/search/${id}?${queryParmas.toString()}`, {
    headers: headers,
  });
  const resp = await response.json();
  if (!resp.data?.events) return [];
  return resp.data.events as PatientEvent[];
}

export async function fetchBigDataPatientEvents(
  id: string,
  eventName: string,
  scale: number,
  tag: string,
  endTime: string,
  averageOut?: boolean,
  filter = "bigData",
): Promise<PatientEventMinMax[] | PatientEvent[]> {
  const queryParmas = new URLSearchParams({ e: eventName, f: filter });
  queryParmas.append("endTime", endTime);
  queryParmas.append("scale", scale.toString());
  const headers = await getAuthHeader();
  const response = await fetch(`${config.backendUrl}/api/v1/search/${id}?${queryParmas.toString()}`, {
    headers: headers,
    next: { tags: [tag] },
  });
  const resp = await response.json();
  if (!resp.data?.events) return [];
  const events = resp.data.events as PatientEventMinMax[];
  return getExtendedMinMaxPatientEvents(events, averageOut);
}

export async function fetchEventsSuggestions(id: string, q: string): Promise<string[]> {
  const headers = await getAuthHeader();
  const result = await fetch(`${config.backendUrl}/api/v1/suggestions/${id}?q=${q}`, {
    headers: headers,
  }).then((res) => res.json());
  return result.data.suggestions;
}

export async function fetchEventFilters(): Promise<EventFilter[]> {
  const headers = await getAuthHeader();
  const result = await fetch(`${config.backendUrl}/api/v1/filters`, {
    headers: headers,
  }).then((res) => res.json());
  return result;
}

export async function getDocumentData(patientId: string, fileName: string): Promise<Uint8Array> {
  const headers = await getAuthHeader();
  const result = await fetch(`${config.backendUrl}/api/v1/document/${patientId}/${fileName}`, {
    headers: headers,
  });
  const arrayBuffer = await result.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

export async function getMedlineUrl(loinc: string): Promise<string | undefined> {
  try {
    const response = await fetch(`${config.medlineUrl}${loinc}`);
    const resp = await response.json();
    return resp.feed?.entry[0]?.link[0]?.href;
  } catch {
    return undefined;
  }
}

export async function uploadDocumentFile(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const patientId = formData.get("patientId") as string;
    if (!patientId) {
      return { message: "Patient ID is required", data: null, status: "error" };
    }
    const headers = await getAuthHeader();
    const response = await fetch(`${config.backendUrl}/api/v1/document/${patientId}`, {
      method: "POST",
      body: formData,
      headers: headers,
    });

    revalidatePath(`/patient/${patientId}`);

    if (response.status === 401) {
      return { message: "Invalid user role for this operation.", data: null, status: "error" };
    } else if (response.status !== 200) {
      return { message: "Error uploading file", data: null, status: "error" };
    }
    const resp = await response.json();
    return { message: "File uploaded successfully", data: resp.data, status: "success" };
  } catch (e) {
    return { message: "Error uploading file", data: null, status: "success" };
  }
}

export async function uploadPublicFile(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const patientId = formData.get("patientId") as string;
    if (!patientId) {
      return { message: "Patient ID is required", data: null, status: "error" };
    }
    const event = formData.get("event") as string;
    if (!event) {
      return { message: "Event name is required", data: null, status: "error" };
    }
    const headers = await getAuthHeader();
    const response = await fetch(`${config.backendUrl}/api/v1/import/upload/${patientId}/${event}`, {
      method: "POST",
      body: formData,
      headers: headers,
    });

    if (response.status === 401) {
      return { message: "Invalid user role for this operation.", data: null, status: "error" };
    } else if (response.status !== 200) {
      return { message: "Error uploading file", data: null, status: "error" };
    }
    const resp = await response.json();
    return { message: "File uploaded successfully", data: resp.data, status: "success" };
  } catch (e) {
    return { message: "Error uploading file", data: null, status: "success" };
  }
}

export async function ingestFile(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const erase = formData.get("erase") === "on" ? "true" : "false";
    const patientId = formData.get("patientId") as string;
    if (!patientId) {
      return { message: "Patient ID is required", data: null, status: "error" };
    }
    const ingestionType = formData.get("ingestionType") as string;
    const queryParams = new URLSearchParams({ erase });
    const headers = await getAuthHeader();
    const response = await fetch(
      `${config.backendUrl}/api/v1/ingest/${patientId}/${ingestionType}?${queryParams.toString()}`,
      {
        method: "POST",
        body: formData,
        headers: headers,
      },
    );

    revalidatePath(`/patient/${patientId}`);

    if (response.status === 401) {
      return { message: "Invalid user role for this operation.", data: null, status: "error" };
    } else if (response.status !== 200) {
      return { message: "Error uploading file", data: null, status: "error" };
    }
    const resp = await response.json();
    return { message: "File uploaded successfully", data: resp.data, status: "success" };
  } catch (e) {
    return { message: "Error uploading file", data: null, status: "success" };
  }
}

export async function importEventData(
  patientId: string,
  events: PatientEventBase[],
  event?: string,
): Promise<ActionState<void>> {
  if (!event) {
    return { message: "No event name was found for the data.", status: "error" };
  }
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${config.backendUrl}/api/v1/import/${patientId}/${event}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(events),
    });

    revalidatePath(`/patient/${patientId}`);

    if (response.status != 200) {
      return { message: "An error ocurred while importing event data points.", status: "error" };
    }
    return { message: "Success", status: "success" };
  } catch {
    return { message: "An error ocurred while importing event data points.", status: "error" };
  }
}

export async function favoriteEvent(patientId: string, event: string, state: boolean): Promise<ActionState<void>> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${config.backendUrl}/api/v1/favorites`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ event, state, patientId }),
    });
    revalidatePath(`/patient/${patientId}`);
    if (response.status != 200) {
      return { message: "An error ocurred while changing favorite status for this item.", status: "error" };
    }
    return { message: "Success", status: "success" };
  } catch {
    return { message: "An error ocurred while changing favorite status for this item.", status: "error" };
  }
}

export async function disableLineEvent(patientId: string, event: string, state: boolean): Promise<ActionState<void>> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${config.backendUrl}/api/v1/lines`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ event, state, patientId }),
    });

    if (response.status != 200) {
      return { message: "An error ocurred while changing line status for this item.", status: "error" };
    }
    return { message: "Success", status: "success" };
  } catch {
    return { message: "An error ocurred while changing line status for this item.", status: "error" };
  }
}

export async function createGroup(patientId: string, name: string): Promise<ActionState<void>> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${config.backendUrl}/api/v1/groups/${patientId}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ name }),
    });
    revalidatePath(`/patient/${patientId}`);
    if (response.status != 200) {
      return { message: "An error ocurred while adding item to virtual group.", status: "error" };
    }
    return { message: "Success", status: "success" };
  } catch {
    return { message: "An error ocurred while creating virtual group.", status: "error" };
  }
}

export async function removeEvents(patientId: string, event: string): Promise<ActionState<void>> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${config.backendUrl}/api/v1/patient_data/${patientId}/${event}`, {
      method: "DELETE",
      headers: headers,
    });
    revalidatePath(`/patient/${patientId}`);
    if (response.status != 200) {
      return { message: "An error ocurred while deleting events.", status: "error" };
    }
    return { message: "Success", status: "success" };
  } catch {
    return { message: "An error ocurred while deleting events.", status: "error" };
  }
}

export async function removeGroup(patientId: string, name: string): Promise<ActionState<void>> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${config.backendUrl}/api/v1/groups/${patientId}/${name}`, {
      method: "DELETE",
      headers: headers,
    });
    revalidatePath(`/patient/${patientId}`);
    if (response.status != 200) {
      return { message: "An error ocurred while deleting virtual group.", status: "error" };
    }
    return { message: "Success", status: "success" };
  } catch {
    return { message: "An error ocurred while deleting virtual group.", status: "error" };
  }
}

export async function fetchGroups(patientId: string): Promise<Group[] | null> {
  const headers = await getAuthHeader();
  const result = await fetch(`${config.backendUrl}/api/v1/groups/${patientId}`, {
    headers: headers,
  }).then((res) => res.json());
  return result.data;
}

export async function addToGroup(patientId: string, group: string, event: string): Promise<ActionState<void>> {
  try {
    const headers = await getAuthHeader();
    const response = await fetch(`${config.backendUrl}/api/v1/groups/${patientId}`, {
      headers: headers,
      method: "PUT",
      body: JSON.stringify({ name: group, event }),
    });
    revalidatePath(`/patient/${patientId}`);
    if (response.status != 200) {
      return { message: "An error ocurred while adding item to virtual group.", status: "error" };
    }
    return { message: "Success", status: "success" };
  } catch {
    return { message: "An error ocurred while adding item to virtual group.", status: "error" };
  }
}

const getExtendedMinMaxPatientEvents = (
  events: PatientEventMinMax[],
  averageOut?: boolean,
): PatientEventMinMax[] | PatientEvent[] => {
  const extendedEvents = events.map((event, _) => {
    const value = averageOut ? (event.value.min + event.value.max) / 2 : (event.value ?? { min: 0, max: 0 });
    return { ...event, value };
  });

  return extendedEvents as PatientEventMinMax[] | PatientEvent[];
};

async function getAuthHeader() {
  const tokens = await getTokens(cookies(), {
    apiKey: process.env.FIREBASE_API_KEY!,
    cookieName: "__session",
    cookieSignatureKeys: [process.env.COOKIES_SIGNATURE_KEY!],
  });

  return {
    Authorization: `Bearer ${tokens?.token}`,
  };
}
