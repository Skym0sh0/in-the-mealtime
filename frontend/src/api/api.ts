import {Configuration, Order, OrderApi, RestaurantApi} from "../../build/generated-ts/api";

const restConfig = new Configuration({
  basePath: import.meta.env.VITE_APP_CONFIG_BACKEND_URL || ''
});

const api = {
  restaurants: new RestaurantApi(restConfig),
  orders: new OrderApi(restConfig),
}

export default function fetchOrders(): Order[] {
  return Array(1)
    .fill(null)
    .map((_, idx) => ({
      id: `${Math.round(Math.random() * 10_000)}`,
      restaurantId: `restaurant-${idx}`,
      date: `2024-07-0${idx}`,
    }));
}

export {
  api
}
