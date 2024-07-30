import {createContext, ReactNode, useCallback, useContext} from "react";

export interface NotificationContext {
  notify: (message: string) => void;
  notifyError: (message: string, error?: Error) => void;
}

const NotificationContext = createContext<NotificationContext>({
  notify: () => {
  },
  notifyError: () => {
  },
});

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationContextProvider({children}: { children?: ReactNode }) {
  const notify = useCallback((message: string) => {
    console.log("notification", message)
  }, []);

  const notifyError = useCallback((message: string, error?: Error) => {
    console.error("notification", message, error)
  }, []);

  return <NotificationContext.Provider value={{
    notify: notify,
    notifyError: notifyError
  }}>
    {children}
  </NotificationContext.Provider>
}
