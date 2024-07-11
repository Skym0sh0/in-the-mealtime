import {Configuration, OrderApi, RestaurantApi} from "../../build/generated-ts/api";
import axios from "axios";
import {v4 as uuidv4} from "uuid";

const restConfig = new Configuration({
  basePath: import.meta.env.VITE_APP_CONFIG_BACKEND_URL || '',
});

axios.interceptors.request.use((config) => {
  config.headers['X-Correlation-ID'] = uuidv4();
  return config;
});

const api = {
  restaurants: new RestaurantApi(restConfig),
  orders: new OrderApi(restConfig),
}

export {
  api
}
