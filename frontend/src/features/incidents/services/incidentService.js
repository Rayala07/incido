/**
 * incidentService.js
 *
 * Handles all HTTP calls to the /api/incident/* endpoints.
 *
 * Rules followed throughout this file:
 *  - Every function returns the `data` payload from Axios directly.
 *  - Errors are intentionally NOT caught here — the calling component
 *    or hook is responsible for error handling so nothing is swallowed silently.
 *  - The shared axiosInstance already attaches the auth cookie on every request,
 *    so no manual token handling is needed.
 */

import axiosInstance from "../../auth/services/axiosInstance";

/**
 * Fetch all incidents the authenticated user is authorised to see.
 * This includes incidents where the user is the creator, leader,
 * a member, or the incident is marked as public.
 *
 * Returns: { success, count, incidents: Incident[] }
 * Each incident has projectId populated as { _id, name, description }.
 */
const getAllIncidents = async () => {
  const { data } = await axiosInstance.get("/api/incident/allincidents");
  return data;
};

/**
 * Create a new incident.
 * The projectId MUST be passed — the backend will reject the request
 * with a 400 if it is missing or invalid.
 *
 * Payload:
 *   title            — string, required, 3–200 chars
 *   description      — string, required, 10–5000 chars
 *   projectId        — string (MongoDB ObjectId), required
 *   severity         — "low" | "medium" | "high" | "critical", optional
 *                      (if omitted, the AI infers it from the description)
 *   isPublic         — boolean, optional, defaults to false
 *   affectedUsers    — number, optional
 *   affectedServices — string[], optional
 *
 * Returns: { success, message, incident: Incident }
 */
const createIncident = async ({
  title,
  description,
  projectId,
  severity,
  isPublic,
  affectedUsers,
  affectedServices,
  responderEmails,
}) => {
  const { data } = await axiosInstance.post("/api/incident/create", {
    title,
    description,
    projectId,
    severity,
    isPublic,
    affectedUsers,
    affectedServices,
    responderEmails,
  });
  return data;
};

const getIncident = async (id) => {
  const { data } = await axiosInstance.get(`/api/incident/${id}`);
  return data;
};

const getTimeline = async (id) => {
  const { data } = await axiosInstance.get(`/api/incident/${id}/timeline`);
  return data;
};

const addTimelineEntry = async (id, payload) => {
  const { data } = await axiosInstance.post(`/api/incident/${id}/timeline`, payload);
  return data;
};

const getIncidentDetails = async (id) => {
  const { data } = await axiosInstance.get(`/api/incident/${id}/details`);
  return data;
};

const closeIncident = async (id) => {
  const { data } = await axiosInstance.patch(`/api/incident/${id}/close`);
  return data;
};

/**
 * Download the postmortem report for a resolved incident as a PDF.
 * The backend uses Puppeteer to render the report to A4 PDF.
 *
 * IMPORTANT: responseType must be 'blob' — the server streams raw binary
 * PDF bytes, not JSON. If this is omitted, Axios corrupts the buffer.
 *
 * Returns: a Blob of type application/pdf
 */
const downloadPostmortemPDF = async (id) => {
  const response = await axiosInstance.get(`/api/incident/${id}/download-pdf`, {
    responseType: "blob",
  });
  return response.data; // raw Blob
};

/**
 * Fetch all open action items for resolved incidents the user can see.
 * The backend scopes results by role (admin = all, leader/responder = their scope).
 * Each item is enriched with: incidentId, incidentTitle, incidentSeverity, projectName.
 *
 * Returns: { success, count, actionItems: ActionItem[] }
 */
const getActionItems = async () => {
  const { data } = await axiosInstance.get("/api/incident/action-items");
  return data;
};

/**
 * Resolve an action item
 */
const resolveActionItem = async (incidentId, itemId) => {
  const { data } = await axiosInstance.patch(`/api/incident/${incidentId}/action-items/${itemId}/resolve`);
  return data;
};

/**
 * Search for past incidents similar to the given query string.
 * Uses the RAG pipeline on the backend (Pinecone vector search + AI explanation).
 *
 * Query: GET /api/incident/search?q=<text>
 * Returns: { success, matchCount, confidence, recurring, recurringMessage,
 *            insight, suggestedFixes, isNewPattern, results: [] }
 */
const searchSimilarIncidents = async (query) => {
  const { data } = await axiosInstance.get(
    `/api/incident/search?q=${encodeURIComponent(query.trim())}`
  );
  return data;
};

const incidentService = { 
  getAllIncidents, 
  createIncident,
  getIncident,
  getTimeline,
  addTimelineEntry,
  getIncidentDetails,
  closeIncident,
  downloadPostmortemPDF,
  getActionItems,
  resolveActionItem,
  searchSimilarIncidents,
};

export default incidentService;
