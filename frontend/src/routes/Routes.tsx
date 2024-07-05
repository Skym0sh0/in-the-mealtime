import {createBrowserRouter, redirect, RouterProvider} from "react-router-dom";
import OrdersOverview from "../components/orders/OrdersOverview.tsx";
import Order from "../components/orders/Order.tsx";
import RestaurantsOverview from "../components/restaurant/RestaurantsOverview.tsx";
import Restaurant from "../components/restaurant/Restaurant.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello world!</div>,
    loader: () => redirect("/order")
  },
  {
    path: "/order",
    element: <OrdersOverview/>,
    children: [
      {
        path: "/order/:orderId",
        element: <Order/>,
      },
    ],
  },
  {
    path: "/restaurant",
    element: <RestaurantsOverview/>,
    children: [
      {
        path: "/restaurant/:restaurantId",
        element: <Restaurant/>,
      },
    ],
  },
]);

export function GlobalRouting() {
  return <RouterProvider router={router}/>;
}