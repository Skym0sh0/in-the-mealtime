import {createContext, ReactNode, useContext, useState} from "react";
import {Configuration, OrderApi, RestaurantApi} from "../../build/generated-ts/api";
import axios from "axios";
import {v4 as uuidv4} from "uuid";

const restConfig = new Configuration({
  basePath: import.meta.env.VITE_APP_CONFIG_BACKEND_URL || '',
});

axios.interceptors.request.use((config) => {
  if (!config.headers.has('X-Correlation-ID'))
    config.headers['X-Correlation-ID'] = uuidv4();

  return config;
});

export interface ApiAccessContextType {
  restaurantApi: RestaurantApi;
  orderApi: OrderApi;
}

const defaultApiAccess: ApiAccessContextType = {
  restaurantApi: new RestaurantApi(restConfig),
  orderApi: new OrderApi(restConfig),
}

const ApiAccessContext = createContext<ApiAccessContextType>(defaultApiAccess);

export function useApiAccess() {
  return useContext(ApiAccessContext)
}

export function ApiAccessProvider({children}: { children?: ReactNode }) {
  const [api, _] = useState(() => defaultApiAccess);

  return <ApiAccessContext.Provider value={api}>
    {children}
  </ApiAccessContext.Provider>
}
