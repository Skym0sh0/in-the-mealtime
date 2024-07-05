import {Outlet} from "react-router-dom";
import {Button} from "@mui/material";

export default function OrdersOverview() {
  return <div>
    <p>Orders Overview</p>
    <Button href="/order/1234">Select</Button>
    <div>
      <Outlet/>
    </div>
  </div>;
}
