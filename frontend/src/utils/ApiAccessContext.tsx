import {createContext, ReactNode, useContext} from "react";
import {api} from "../api/api.ts";
import {OrderApi, RestaurantApi} from "../../build/generated-ts/api";

export interface ApiAccessContextType {
  restaurantApi: RestaurantApi;
  orderApi: OrderApi;
}

const ApiAccessContext = createContext<ApiAccessContextType>({
  restaurantApi: api.restaurants,
  orderApi: api.orders,
});

export function useApiAccess() {
  return useContext(ApiAccessContext)
}

export function ApiAccessProvider({children}: { children?: ReactNode }) {
  const ctx: ApiAccessContextType = {
    restaurantApi: api.restaurants,
    orderApi: api.orders,
  };

  return <ApiAccessContext.Provider value={ctx}>
    {children}
  </ApiAccessContext.Provider>
}
