/**
 * projectService.js
 *
 * Handles all HTTP calls to the /api/project/* endpoints.
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
 * Fetch every project the authenticated user has access to.
 * Returns: { success, projects: Project[] }
 */
const getAllProjects = async () => {
  const { data } = await axiosInstance.get("/api/project/getprojects");
  return data;
};

/**
 * Fetch a single project by its MongoDB ObjectId.
 * Returns: { success, project: Project }
 */
const getProjectById = async (projectId) => {
  const { data } = await axiosInstance.get(`/api/project/${projectId}`);
  return data;
};

/**
 * Create a new project. Admin-only on the backend.
 * Payload: { name: string, description?: string }
 * Returns: { success, message, project: Project }
 */
const createProject = async ({ name, description }) => {
  const { data } = await axiosInstance.post("/api/project/create", {
    name,
    description,
  });
  return data;
};

/**
 * Add members (or leaders) to an existing project. Admin-only.
 * Payload: { projectId: string, members: Array<{ email: string, role: "leader" | "member" }> }
 * Returns: { success, message, project: Project }
 */
const addMembersToProject = async (projectId, members) => {
  const { data } = await axiosInstance.post("/api/project/add-members", {
    projectId,
    members,
  });
  return data;
};

/**
 * Update a project's name and/or description. Admin-only.
 * Payload: { name?: string, description?: string }
 * Returns: { success, message, project: Project }
 */
const updateProject = async (projectId, { name, description }) => {
  const { data } = await axiosInstance.put(`/api/project/${projectId}`, {
    name,
    description,
  });
  return data;
};

/**
 * Permanently delete a project by its ID. Admin-only.
 * Returns: { success, message }
 */
const deleteProject = async (projectId) => {
  const { data } = await axiosInstance.delete(`/api/project/${projectId}`);
  return data;
};

/**
 * Remove a single member from a project by their userId. Admin-only.
 * Returns: { success, message, project: Project }
 */
const removeMember = async (projectId, userId) => {
  const { data } = await axiosInstance.delete(
    `/api/project/${projectId}/members/${userId}`
  );
  return data;
};

const projectService = {
  getAllProjects,
  getProjectById,
  createProject,
  addMembersToProject,
  updateProject,
  deleteProject,
  removeMember,
};

export default projectService;
