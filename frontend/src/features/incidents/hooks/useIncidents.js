import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllIncidents,
  createIncident,
  clearIncidentsError,
  selectIncidents,
  selectIncidentsLoading,
  selectIncidentsError,
  selectIsCreatingIncident,
  selectCreateIncidentError,
} from "../store/incidentsSlice";

/**
 * useIncidents — the single bridge between the incidents UI and the data layer.
 *
 * Usage:
 *   const { incidents, isLoading, createIncident } = useIncidents();
 */
export const useIncidents = () => {
  const dispatch = useDispatch();

  const incidents      = useSelector(selectIncidents);
  const isLoading      = useSelector(selectIncidentsLoading);
  const error          = useSelector(selectIncidentsError);
  const isCreating     = useSelector(selectIsCreatingIncident);
  const createError    = useSelector(selectCreateIncidentError);

  const loadIncidents = useCallback(() => {
    dispatch(fetchAllIncidents());
  }, [dispatch]);

  const handleCreateIncident = useCallback((incidentData) => {
    return dispatch(createIncident(incidentData));
  }, [dispatch]);

  const dismissError = useCallback(() => {
    dispatch(clearIncidentsError());
  }, [dispatch]);

  return {
    incidents,
    isLoading,
    error,
    isCreating,
    createError,
    loadIncidents,
    createIncident: handleCreateIncident,
    dismissError,
  };
};

export default useIncidents;
