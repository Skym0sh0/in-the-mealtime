import useWebSocket from "react-use-websocket";
import {useEffect, useMemo, useState} from "react";

export default function useServerEvents(...eventNames: string[]) {
  const {lastMessage, sendMessage} = useWebSocket("wss://echo.websocket.org");

  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const events = useMemo(() => {
    return eventNames;
  }, [eventNames]);
  
  useEffect(() => {
    // console.log("Received:", lastMessage)
    if (lastMessage?.data && events.includes(lastMessage?.data))
      setLastEvent(lastMessage.timeStamp.toString());
  }, [events, lastMessage]);

  useEffect(() => {
    const handle = setInterval(() => {
      // console.log("Sent event:", events)
      events.forEach(ev => sendMessage(ev))
    }, 3000)

    return () => clearInterval(handle);
  }, [events, sendMessage]);

  return lastEvent;
}
