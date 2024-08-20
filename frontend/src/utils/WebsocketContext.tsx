import {createContext, ReactNode, useContext, useState} from "react";
import useWebSocket from "react-use-websocket";
import {WebSocketHook} from "react-use-websocket/dist/lib/types";

export interface WebsocketContextType {
  ws?: WebSocketHook;
}

const WebsocketContext = createContext<WebsocketContextType>({});

export const useWebsocketContext = () => useContext(WebsocketContext);

export function WebsocketContextProvider({children}: { children?: ReactNode }) {
  const [url,] = useState(() => {
    return `ws://${location.host}${import.meta.env.VITE_APP_CONFIG_BACKEND_URL}/websocket`;
  });

  const ws: WebSocketHook = useWebSocket(url);

  return <WebsocketContext.Provider value={{ws: ws}}>
    {children}
  </WebsocketContext.Provider>;
}
