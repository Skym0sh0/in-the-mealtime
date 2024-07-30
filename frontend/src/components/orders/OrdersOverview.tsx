import {Box, Drawer, Paper, Toolbar} from "@mui/material";
import styled from "styled-components";
import {useCallback, useEffect, useState} from "react";
import {Restaurant} from "../../../build/generated-ts/api";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import OrdersCardsList from "./OrdersCardsList.tsx";
import {DRAWER_WIDTH} from "../../utils/utils.ts";
import {Outlet} from "react-router-dom";
import {useApiAccess} from "../../utils/ApiAccessContext.tsx";

export default function OrdersOverview() {const {orderApi, restaurantApi} = useApiAccess();

  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [orderableRestaurantIds, setOrderableRestaurantIds] = useState<string[]>([]);

  const refreshRestaurants = useCallback(() => {
    Promise.all([
      restaurantApi.fetchRestaurants(),
      orderApi.fetchOrderableRestaurants()
    ])
      .then(([rests, ids]) => {
        setRestaurants(rests.data)
        setOrderableRestaurantIds(ids.data)
      });
  }, [restaurantApi, orderApi]);

  useEffect(() => {
    refreshRestaurants();
  }, [refreshRestaurants]);

  return <LoadingIndicator isLoading={restaurants === null}>
    <Box style={{display: "flex", height: '100%'}}>
      <SDrawer variant="permanent">
        <Toolbar/>
        <Paper sx={{height: '100%', maxHeight: '100%'}}>
          {restaurants && <OrdersCardsList restaurants={restaurants}
                                           orderableRestaurantIds={orderableRestaurantIds}
                                           onRefresh={refreshRestaurants}/>}
        </Paper>
      </SDrawer>

      <Box sx={{flexGrow: 1, height: '100%'}}>
        <Outlet/>
      </Box>
    </Box>
  </LoadingIndicator>;
}

const SDrawer = styled(Drawer)`
    width: ${DRAWER_WIDTH}px;
    flex-shrink: 0;

    & .MuiDrawer-paper {
        width: ${DRAWER_WIDTH}px;
        box-sizing: border-box;
    }
`;
