import { useMemo, useReducer } from 'react';

export interface DashboardState {
  calendars: any[];
  events: any[];
  loading: boolean;
  error: string;
  gcalConnected: boolean;
  showTokenInput: boolean;
  tokensText: string;
  viewMode: 'day' | 'week' | 'month';
  isCreateOpen: boolean;
  clients: any[];
  activeSection: 'appointments' | 'clients';
  selectedClient: any | null;
  isClientDetailOpen: boolean;
  selectedAppointment: any | null;
  isAppointmentDetailsOpen: boolean;
}

export enum DashboardActionType {
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_CALENDARS = 'SET_CALENDARS',
  SET_EVENTS = 'SET_EVENTS',
  ADD_EVENT = 'ADD_EVENT',
  SET_CLIENTS = 'SET_CLIENTS',
  ADD_CLIENT = 'ADD_CLIENT',
  SET_GCAL_CONNECTED = 'SET_GCAL_CONNECTED',
  SET_SHOW_TOKEN_INPUT = 'SET_SHOW_TOKEN_INPUT',
  SET_TOKENS_TEXT = 'SET_TOKENS_TEXT',
  SET_VIEW_MODE = 'SET_VIEW_MODE',
  SET_IS_CREATE_OPEN = 'SET_IS_CREATE_OPEN',
  SET_ACTIVE_SECTION = 'SET_ACTIVE_SECTION',
  CLEAR_ERROR = 'CLEAR_ERROR',
  RESET_TOKENS = 'RESET_TOKENS',
  SET_SELECTED_CLIENT = 'SET_SELECTED_CLIENT',
  SET_CLIENT_DETAIL_OPEN = 'SET_CLIENT_DETAIL_OPEN',
  SET_SELECTED_APPOINTMENT = 'SET_SELECTED_APPOINTMENT',
  SET_APPOINTMENT_DETAILS_OPEN = 'SET_APPOINTMENT_DETAILS_OPEN',
}

type DashboardAction =
  | { type: DashboardActionType.SET_LOADING; payload: boolean }
  | { type: DashboardActionType.SET_ERROR; payload: string }
  | { type: DashboardActionType.SET_CALENDARS; payload: any[] }
  | { type: DashboardActionType.SET_EVENTS; payload: any[] }
  | { type: DashboardActionType.ADD_EVENT; payload: any }
  | { type: DashboardActionType.SET_CLIENTS; payload: any[] }
  | { type: DashboardActionType.ADD_CLIENT; payload: any }
  | { type: DashboardActionType.SET_GCAL_CONNECTED; payload: boolean }
  | { type: DashboardActionType.SET_SHOW_TOKEN_INPUT; payload: boolean }
  | { type: DashboardActionType.SET_TOKENS_TEXT; payload: string }
  | { type: DashboardActionType.SET_VIEW_MODE; payload: 'day' | 'week' | 'month' }
  | { type: DashboardActionType.SET_IS_CREATE_OPEN; payload: boolean }
  | { type: DashboardActionType.SET_ACTIVE_SECTION; payload: 'appointments' | 'clients' }
  | { type: DashboardActionType.CLEAR_ERROR }
  | { type: DashboardActionType.RESET_TOKENS }
  | { type: DashboardActionType.SET_SELECTED_CLIENT; payload: any | null }
  | { type: DashboardActionType.SET_CLIENT_DETAIL_OPEN; payload: boolean }
  | { type: DashboardActionType.SET_SELECTED_APPOINTMENT; payload: any | null }
  | { type: DashboardActionType.SET_APPOINTMENT_DETAILS_OPEN; payload: boolean }

const initialState: DashboardState = {
  calendars: [],
  events: [],
  loading: false,
  error: '',
  gcalConnected: false,
  showTokenInput: false,
  tokensText: '',
  viewMode: 'day',
  isCreateOpen: false,
  clients: [],
  activeSection: 'appointments',
  selectedClient: null,
  isClientDetailOpen: false,
  selectedAppointment: null,
  isAppointmentDetailsOpen: false,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case DashboardActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case DashboardActionType.SET_ERROR:
      return { ...state, error: action.payload };
    case DashboardActionType.SET_CALENDARS:
      return { ...state, calendars: action.payload };
    case DashboardActionType.SET_EVENTS:
      return { ...state, events: action.payload };
    case DashboardActionType.ADD_EVENT:
      return { ...state, events: [...state.events, action.payload] };
    case DashboardActionType.SET_CLIENTS:
      return { ...state, clients: action.payload };
    case DashboardActionType.ADD_CLIENT:
      return { ...state, clients: [...state.clients, action.payload] };
    case DashboardActionType.SET_GCAL_CONNECTED:
      return { ...state, gcalConnected: action.payload };
    case DashboardActionType.SET_SHOW_TOKEN_INPUT:
      return { ...state, showTokenInput: action.payload };
    case DashboardActionType.SET_TOKENS_TEXT:
      return { ...state, tokensText: action.payload };
    case DashboardActionType.SET_VIEW_MODE:
      return { ...state, viewMode: action.payload };
    case DashboardActionType.SET_IS_CREATE_OPEN:
      return { ...state, isCreateOpen: action.payload };
    case DashboardActionType.SET_ACTIVE_SECTION:
      return { ...state, activeSection: action.payload };
    case DashboardActionType.CLEAR_ERROR:
      return { ...state, error: '' };
    case DashboardActionType.RESET_TOKENS:
      return { ...state, showTokenInput: false, tokensText: '', error: '' };
    case DashboardActionType.SET_SELECTED_CLIENT:
      return { ...state, selectedClient: action.payload };
    case DashboardActionType.SET_CLIENT_DETAIL_OPEN:
      return { ...state, isClientDetailOpen: action.payload };
    case DashboardActionType.SET_SELECTED_APPOINTMENT:
      return { ...state, selectedAppointment: action.payload };
    case DashboardActionType.SET_APPOINTMENT_DETAILS_OPEN:
      return { ...state, isAppointmentDetailsOpen: action.payload };
    default:
      return state;
  }
}

export function useDashboardState() {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const actions = useMemo(() => ({
    setLoading: (loading: boolean) => dispatch({ type: DashboardActionType.SET_LOADING, payload: loading }),
    setError: (error: string) => dispatch({ type: DashboardActionType.SET_ERROR, payload: error }),
    setCalendars: (calendars: any[]) => dispatch({ type: DashboardActionType.SET_CALENDARS, payload: calendars }),
    setEvents: (events: any[]) => dispatch({ type: DashboardActionType.SET_EVENTS, payload: events }),
    addEvent: (event: any) => dispatch({ type: DashboardActionType.ADD_EVENT, payload: event }),
    setClients: (clients: any[]) => dispatch({ type: DashboardActionType.SET_CLIENTS, payload: clients }),
    addClient: (client: any) => dispatch({ type: DashboardActionType.ADD_CLIENT, payload: client }),
    setGcalConnected: (connected: boolean) => dispatch({ type: DashboardActionType.SET_GCAL_CONNECTED, payload: connected }),
    setShowTokenInput: (show: boolean) => dispatch({ type: DashboardActionType.SET_SHOW_TOKEN_INPUT, payload: show }),
    setTokensText: (text: string) => dispatch({ type: DashboardActionType.SET_TOKENS_TEXT, payload: text }),
    setViewMode: (mode: 'day' | 'week' | 'month') => dispatch({ type: DashboardActionType.SET_VIEW_MODE, payload: mode }),
    setIsCreateOpen: (open: boolean) => dispatch({ type: DashboardActionType.SET_IS_CREATE_OPEN, payload: open }),
    setActiveSection: (section: 'appointments' | 'clients') => dispatch({ type: DashboardActionType.SET_ACTIVE_SECTION, payload: section }),
    clearError: () => dispatch({ type: DashboardActionType.CLEAR_ERROR }),
    resetTokens: () => dispatch({ type: DashboardActionType.RESET_TOKENS }),
    setSelectedClient: (client: any | null) => dispatch({ type: DashboardActionType.SET_SELECTED_CLIENT, payload: client }),
    setClientDetailOpen: (open: boolean) => dispatch({ type: DashboardActionType.SET_CLIENT_DETAIL_OPEN, payload: open }),
    setSelectedAppointment: (appointment: any | null) => dispatch({ type: DashboardActionType.SET_SELECTED_APPOINTMENT, payload: appointment }),
    setAppointmentDetailsOpen: (open: boolean) => dispatch({ type: DashboardActionType.SET_APPOINTMENT_DETAILS_OPEN, payload: open }),
  }), []);

  return { state, actions };
}
