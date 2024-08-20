import useWebSocket from "react-use-websocket";
import {useEffect, useState} from "react";
import {ChangeEvent, ChangeEventEventTypeEnum} from "../../../build/generated-ts/api";

function parseJson(str?: string | null): ChangeEvent | null {
  if (!str)
    return null;

  try {
    return JSON.parse(str) as ChangeEvent;
  } catch (e) {
    console.error("Could not parse JSON as ChangeEvent", str, e)
    return null;
  }
}

export default function useServerEvents(...eventTypes: ChangeEventEventTypeEnum[]) {
  const [url,] = useState(() => {
    return `ws://${location.host}${import.meta.env.VITE_APP_CONFIG_BACKEND_URL}/websocket`;
  });

  const {lastMessage} = useWebSocket<ChangeEvent>(url);

  const [lastEvents, setLastEvents] = useState<ChangeEvent[]>([]);

  const [subjectEvents] = useState(() => eventTypes);

  useEffect(() => {
    if (!lastMessage || !lastMessage?.data)
      return;

    const event = parseJson(lastMessage.data);
    if (!event || !event.eventType)
      return;

    if (subjectEvents.includes(event.eventType)) {
      setLastEvents(prev => [event, ...prev].slice(0, 32))
    }
  }, [subjectEvents, lastMessage]);

  return lastEvents[0];
}
