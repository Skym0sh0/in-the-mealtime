import {useEffect, useState} from "react";
import {ChangeEvent, ChangeEventEventTypeEnum} from "../../../build/generated-ts/api";
import {useWebsocketContext} from "../../utils/WebsocketContext.tsx";

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
  const {ws} = useWebsocketContext();

  const [lastEvents, setLastEvents] = useState<ChangeEvent[]>([]);

  const [subjectEvents] = useState(() => eventTypes);

  useEffect(() => {
    if (!ws)
      return;

    if (!ws.lastMessage || !ws.lastMessage?.data)
      return;

    const event = parseJson(ws.lastMessage.data);
    if (!event || !event.eventType)
      return;

    if (subjectEvents.includes(event.eventType)) {
      setLastEvents(prev => [event, ...prev].slice(0, 32))
    }
  }, [subjectEvents, ws, ws?.lastMessage]);

  return lastEvents[0];
}
