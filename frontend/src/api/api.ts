import {Configuration, OrderApi, RestaurantApi} from "../../build/generated-ts/api";

const restConfig = new Configuration({
  basePath: import.meta.env.VITE_APP_CONFIG_BACKEND_URL || ''
});

const api = {
  restaurants: new RestaurantApi(restConfig),
  orders: new OrderApi(restConfig),
}

export {
  api
}
