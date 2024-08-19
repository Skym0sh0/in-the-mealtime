import {createBrowserRouter, redirect, RouterProvider} from "react-router-dom";
import OrdersOverview from "../components/orders/OrdersOverview.tsx";
import OrderView from "../components/orders/orderDetails/OrderView.tsx";
import RestaurantsOverview from "../components/restaurant/RestaurantsOverview.tsx";
import RestaurantView from "../components/restaurant/RestaurantView.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    loader: () => redirect("/order")
  },
  {
    path: "/order",
    element: <OrdersOverview/>,
    children: [
      {
        path: "/order/:orderId",
        element: <OrderView/>,
      },
    ],
  },
  {
    path: "/restaurant",
    element: <RestaurantsOverview/>,
  },
  {
    path: "/restaurant/:restaurantId",
    element: <RestaurantView/>,
  }
]);

export function GlobalRouting() {
  return <RouterProvider router={router}/>;
}
