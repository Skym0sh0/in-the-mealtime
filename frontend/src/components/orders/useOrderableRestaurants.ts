import {useApiAccess} from "../../utils/ApiAccessContext.tsx";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useNotification} from "../../utils/NotificationContext.tsx";
import {Restaurant} from "../../../build/generated-ts/api";
import {RestaurantOrderable} from "./types.ts";

export type RestaurantPollingResultType = {
  hasError: boolean,
  restaurants: RestaurantOrderable[] | null,
  refreshRestaurants: () => void,
};

export default function useOrderableRestaurants(): RestaurantPollingResultType {
  const {orderApi, restaurantApi} = useApiAccess();

  const {notifyError} = useNotification();

  const [hasError, setHasError] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [orderableRestaurantIds, setOrderableRestaurantIds] = useState<string[]>([]);

  const refreshRestaurants = useCallback(() => {
    Promise.all([
      restaurantApi.fetchRestaurants(),
      orderApi.fetchOrderableRestaurants()
    ])
      .then(([rests, ids]) => {
        setHasError(false)
        setRestaurants(rests.data)
        setOrderableRestaurantIds(ids.data)
      })
      .catch(e => {
        setHasError(true)
        setRestaurants([]);
        setOrderableRestaurantIds([]);
        notifyError("Restaurants konnten nicht geladen werden", e)
      });
  }, [restaurantApi, orderApi, notifyError]);

  useEffect(() => {
    refreshRestaurants();
  }, [refreshRestaurants]);

  const orderableRestaurants: RestaurantOrderable[] | null = useMemo(() => {
    if (!restaurants)
      return null

    return restaurants.map(res => ({
      ...res,
      orderable: orderableRestaurantIds.includes(res.id)
    }));
  }, [orderableRestaurantIds, restaurants]);

  return useMemo(() => {
    return {
      hasError: hasError,
      restaurants: orderableRestaurants,
      refreshRestaurants: refreshRestaurants,
    }
  }, [hasError, refreshRestaurants, orderableRestaurants]);
}
