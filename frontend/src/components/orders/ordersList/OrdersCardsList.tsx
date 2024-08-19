import {useCallback, useEffect, useMemo, useState} from "react";
import {List, ListItem, Stack} from "@mui/material";
import {Restaurant} from "../../../../build/generated-ts/api";
import OrderCard from "./OrderCard.tsx";
import LoadingIndicator from "../../../utils/LoadingIndicator.tsx";
import {useNavigate, useParams} from "react-router-dom";
import NewOrderButton from "./NewOrderButton.tsx";
import useOrderPolling from "../useOrderPolling.ts";
import {RestaurantOrderable} from "../types.ts";

type OrdersCardsListProps = {
  restaurants: RestaurantOrderable[],
  onRefresh: () => void,
};

type RestaurantsById = {
  [key: string]: Restaurant;
}

export default function OrdersCardsList({restaurants, onRefresh}: OrdersCardsListProps) {
  const navigate = useNavigate();
  const params = useParams<{ orderId: string }>();

  const {orders, refresh, hasError} = useOrderPolling( onRefresh);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const restaurantsById: RestaurantsById = useMemo(() => {
    return restaurants.reduce((agg, cur) => ({...agg, [cur.id]: cur}), {});
  }, [restaurants]);

  // initialize and react to selected order
  useEffect(() => {
    setSelectedOrderId(params?.orderId ?? null)
  }, [params?.orderId]);

  const select = useCallback((orderId: string | null) => {
    setSelectedOrderId(orderId)

    if (!orderId)
      navigate({pathname: `/order`});
    else
      navigate({pathname: `/order/${orderId}`});
  }, [navigate]);

  // handle if selected order does not exist anymore or if there is something to auto select
  useEffect(() => {
    if (!orders) {
      return;
    }
    if (!orders || !orders.length) {
      select(null)
      return;
    }

    if (!orders.some(order => order.id === selectedOrderId)) {
      select(null)
    }

    if (!selectedOrderId)
      select(orders[0].id)
  }, [orders, select, selectedOrderId]);

  return <Stack sx={{padding: '0.5em'}}>
    <NewOrderButton restaurants={restaurants}
                    onChange={refresh}/>

    <LoadingIndicator isLoading={orders === null}>
      <List>
        {!hasError && orders &&
          orders.map((order) => {
            return <ListItem key={order.id}>
              <OrderCard onSelect={() => select(order.id)}
                         selected={order.id === selectedOrderId}
                         order={order}
                         restaurant={restaurantsById[order.restaurantId]}/>
            </ListItem>
          })
        }
      </List>
    </LoadingIndicator>
  </Stack>;
}
