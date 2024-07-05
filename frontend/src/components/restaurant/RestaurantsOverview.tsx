import {Button} from "@mui/material";
import {Outlet} from "react-router-dom";

export default function RestaurantsOverview() {
  return <div>
    <p>Meine Restraurants</p>
    <Button href="/restaurant/1234">Open Restraurant</Button>
    <div>
      <Outlet/>
    </div>
  </div>;
}