import {useParams} from "react-router-dom";
import LoadingIndicator from "../../../utils/LoadingIndicator.tsx";
import {Box} from "@mui/material";
import OrderEditor from "./OrderEditor.tsx";
import useOrderRefreshPolling from "./useOrderRefreshPolling.ts";

export default function OrderView() {
  const params = useParams<{ orderId: string }>();

  const {order, restaurant, refresh} = useOrderRefreshPolling(params.orderId);

  return <Box sx={{padding: '2em', height: '100%'}}>
    <LoadingIndicator isLoading={order === null || restaurant === null}>
      {restaurant && order &&
        <OrderEditor restaurant={restaurant}
                     order={order}
                     onChange={refresh}/>
      }
    </LoadingIndicator>
  </Box>
}
