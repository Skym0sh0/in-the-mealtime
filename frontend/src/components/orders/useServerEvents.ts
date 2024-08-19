import useWebSocket from "react-use-websocket";

export default function useServerEvents(...eventNames: string[]) {
  const ws = useWebSocket("wss://echo.websocket.org");

  return null;
}
