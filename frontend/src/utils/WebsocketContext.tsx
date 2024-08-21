import {createContext, ReactNode, useContext, useEffect} from "react";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {WebSocketHook} from "react-use-websocket/dist/lib/types";
import {useNotification} from "./NotificationContext.tsx";

export interface WebsocketContextType {
  ws?: WebSocketHook;
}

const WebsocketContext = createContext<WebsocketContextType>({});

export const useWebsocketContext = () => useContext(WebsocketContext);

export function WebsocketContextProvider({children}: { children?: ReactNode }) {
  const ws: WebSocketHook = useWebSocket(`${import.meta.env.VITE_APP_CONFIG_BACKEND_URL}/websocket`);

  const {notifyError} = useNotification();

  useEffect(() => {
    const connectionStatus = {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[ws.readyState];

    if (![ReadyState.OPEN, ReadyState.CONNECTING].includes(ws.readyState))
      notifyError(`Websocket Verbindung konnte nicht hergestellt werden: ${connectionStatus}`);
  }, [ws.readyState, notifyError]);

  return <WebsocketContext.Provider value={{ws: ws}}>
    {children}
  </WebsocketContext.Provider>;
}
