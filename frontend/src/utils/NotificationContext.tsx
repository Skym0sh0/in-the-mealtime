import {createContext, ReactNode, useCallback, useContext, useState} from "react";
import {Alert, Snackbar} from "@mui/material";
import {AlertColor} from "@mui/material/Alert/Alert";
import {v4 as uuidv4} from "uuid";

export interface NotificationContext {
  notifyInfo: (message: string) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string, error?: Error) => void;
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

type Notification = {
  id: string;
  text: string;
  type: AlertColor;
}

export function NotificationContextProvider({children}: { children?: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((text: string, type: AlertColor) => {
    setNotifications(prev => [...prev, {
      id: uuidv4(),
      text: text,
      type: type,
    }])
  }, []);

  const notifySuccess = useCallback((message: string) => {
    addNotification(message, "success");
  }, [addNotification]);

  const notifyInfo = useCallback((message: string) => {
    addNotification(message, "info");
  }, [addNotification]);

  const notifyError = useCallback((message: string, error?: Error) => {
    addNotification(`${message} (${error?.message})`, 'error')
  }, [addNotification]);

  const handleClose = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, []);

  return <NotificationContext.Provider value={{
    notifySuccess: notifySuccess,
    notifyInfo: notifyInfo,
    notifyError: notifyError
  }}>
    {children}

    {notifications.length > 0 &&
      <div>
        {notifications.slice(0, 1)
          .map((notification) => (
            <Snackbar open={true}
                      key={notification.id}
                      autoHideDuration={5000}
                      onClose={() => handleClose(notification.id)}>
              <Alert severity={notification.type} variant="filled" onClose={() => handleClose(notification.id)}>
                {notification.text}
              </Alert>
            </Snackbar>
          ))}
      </div>
    }
  </NotificationContext.Provider>
}
