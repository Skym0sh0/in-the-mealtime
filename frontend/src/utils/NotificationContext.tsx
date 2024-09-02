import {createContext, ReactNode, useCallback, useContext} from "react";
import {AlertColor} from "@mui/material/Alert/Alert";
import {RequestResponseError} from "./ApiAccessContext.tsx";
import {SnackbarProvider, useSnackbar} from 'notistack';

export interface NotificationContext {
  notifyInfo: (message: string) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string, error?: RequestResponseError) => void;
}

const NotificationContext = createContext<NotificationContext>({
  notifySuccess: () => {
  },
  notifyInfo: () => {
  },
  notifyError: () => {
  },
});

export function useNotification() {
  return useContext(NotificationContext);
}

function Wrapper({children}: { children?: ReactNode }) {
  const {enqueueSnackbar} = useSnackbar();

  const addNotification = useCallback((text: string, type: AlertColor) => {
    enqueueSnackbar(text, {variant: type})
  }, [enqueueSnackbar]);

  const notifySuccess = useCallback((message: string) => {
    addNotification(message, "success");
  }, [addNotification]);

  const notifyInfo = useCallback((message: string) => {
    addNotification(message, "info");
  }, [addNotification]);

  const notifyError = useCallback((message: string, error?: RequestResponseError) => {
    const errorMessage = error ? ` (${error.error?.message ?? error.message})` : "";

    addNotification(`${message}${errorMessage}`, 'error')
  }, [addNotification]);

  return <NotificationContext.Provider value={{
    notifySuccess: notifySuccess,
    notifyInfo: notifyInfo,
    notifyError: notifyError
  }}>
    {children}
  </NotificationContext.Provider>
}

export function NotificationContextProvider({children}: { children?: ReactNode }) {
  return <SnackbarProvider maxSnack={4}>
    <Wrapper>
      {children}
    </Wrapper>
  </SnackbarProvider>
}
