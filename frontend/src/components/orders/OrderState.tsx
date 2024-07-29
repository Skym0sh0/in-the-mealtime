import {Typography} from "@mui/material";
import {Order} from "../../../build/generated-ts/api";

export default function ({order}: { order: Order }) {
  return <Typography variant="caption">
    {order.orderState}
  </Typography>
}
