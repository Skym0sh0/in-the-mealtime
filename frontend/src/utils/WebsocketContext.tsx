import {createContext, ReactNode, useContext} from "react";
import useWebSocket from "react-use-websocket";
import {WebSocketHook} from "react-use-websocket/dist/lib/types";
import {useNotification} from "./NotificationContext.tsx";

export interface WebsocketContextType {
  ws?: WebSocketHook;
}

const WebsocketContext = createContext<WebsocketContextType>({});

export const useWebsocketContext = () => useContext(WebsocketContext);

export function WebsocketContextProvider({children}: { children?: ReactNode }) {
  const {notifyError} = useNotification();

  const ws: WebSocketHook = useWebSocket(`${import.meta.env.VITE_APP_CONFIG_BACKEND_URL}/websocket`, {
    share: true,
    heartbeat: true,
    shouldReconnect: () => true,
    onError: () => notifyError(`Websocket Verbindung konnte nicht hergestellt werden`)
  });

  return <WebsocketContext.Provider value={{ws: ws}}>
    {children}
  </WebsocketContext.Provider>;
}
