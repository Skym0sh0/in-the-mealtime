import {useParams} from "react-router-dom";

export default function OrderView() {
  const params = useParams<{ orderId: string }>();

  return <div>My Specific Order: {params.orderId}</div>
}
