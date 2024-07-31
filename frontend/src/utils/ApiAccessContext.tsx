import {createContext, ReactNode, useContext, useState} from "react";
import {Configuration, OrderApi, RestaurantApi} from "../../build/generated-ts/api";
import axios from "axios";
import {v4 as uuidv4} from "uuid";
import {ErrorObject} from "../../build/generated-ts/api/api.ts";

export interface RequestResponseError {
  code?: string;
  message?: string;
  request?: Request;
  response?: Response;
  error?: ErrorObject;
}

const restConfig = new Configuration({
  basePath: import.meta.env.VITE_APP_CONFIG_BACKEND_URL || '',
});

axios.interceptors.request.use((config) => {
  if (!config.headers.has('X-Correlation-ID'))
    config.headers['X-Correlation-ID'] = uuidv4();

  return config;
});

axios.interceptors.response.use(
  response => response,
  error => {
    const failure: RequestResponseError = {
      code: error.code,
      message: error.message,
      request: error.request,
      response: error.response,
      error: error.response.data,
    };

    return Promise.reject<RequestResponseError>(failure);
  }
)

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
