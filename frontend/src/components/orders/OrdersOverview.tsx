import {Outlet} from "react-router-dom";
import {Button, Card} from "@mui/material";
import {useState} from "react";
import fetchOrders from "../../api/api.ts";
import {Order} from "../../../build/generated-ts/api/index.ts";

function OrderCard({order}: { order: Order }) {
  return <Card sx={{width: '14em', height: '10em'}}>
    {order.date}
  </Card>;
}

export default function OrdersOverview() {
  const [orders, setOrders] = useState(() => fetchOrders());

  return <div>
    <p>Orders Overview</p>

    <div style={{
      display: "flex",
      justifyContent: "left",
      flexWrap: "wrap",
      alignContent: "baseline",
      gap: "1em",
      alignItems: "center"
    }}>
      {orders.map(o => <OrderCard key={o.id} order={o}/>)}
    </div>

    <Button onClick={() => setOrders(prev => [...prev, ...fetchOrders()])}>
      Add
    </Button>
    <div>
      <Outlet/>
    </div>
  </div>;
}
