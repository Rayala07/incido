import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjects,
  createProject,
  clearProjectsError,
  selectProjects,
  selectProjectsLoading,
  selectProjectsError,
  selectIsCreating,
  selectCreateError,
} from "../store/projectsSlice";

/**
 * useProjects — the single bridge between the projects UI and the data layer.
 *
 * Usage:
 *   const { projects, isLoading, createProject } = useProjects();
 */
export const useProjects = () => {
  const dispatch = useDispatch();

  const projects     = useSelector(selectProjects);
  const isLoading    = useSelector(selectProjectsLoading);
  const error        = useSelector(selectProjectsError);
  const isCreating   = useSelector(selectIsCreating);
  const createError  = useSelector(selectCreateError);

  const loadProjects = useCallback(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreateProject = useCallback((projectData) => {
    return dispatch(createProject(projectData));
  }, [dispatch]);

  const dismissError = useCallback(() => {
    dispatch(clearProjectsError());
  }, [dispatch]);

  return {
    projects,
    isLoading,
    error,
    isCreating,
    createError,
    loadProjects,
    createProject: handleCreateProject,
    dismissError,
  };
};

export default useProjects;
