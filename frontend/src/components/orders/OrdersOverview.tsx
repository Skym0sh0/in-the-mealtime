import {Drawer, Paper, Toolbar} from "@mui/material";
import styled from "styled-components";
import {useCallback, useEffect, useState} from "react";
import {Restaurant} from "../../../build/generated-ts/api";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {api} from "../../api/api.ts";
import OrdersCardsList from "./OrdersCardsList.tsx";

export default function OrdersOverview() {
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);

  const refreshRestaurants = useCallback(() => {
    api.restaurants.fetchRestaurants()
      .then(res => setRestaurants(res.data))
  }, []);

  useEffect(() => {
    refreshRestaurants();
  }, []);

  return <LoadingIndicator isLoading={restaurants === null}>
    <SDrawer variant="permanent">
      <Toolbar/>
      <Paper sx={{height: '100%', maxHeight: '100%'}}>
        {restaurants && <OrdersCardsList restaurants={restaurants} onRefresh={refreshRestaurants}/>}
      </Paper>
    </SDrawer>

    <Paper elevation={8}>
      <p>One selected order</p>
    </Paper>
  </LoadingIndicator>;
}

const drawerWidth = 360;

const SDrawer = styled(Drawer)`
    width: ${drawerWidth}px;
    flex-shrink: 0;

    & .MuiDrawer-paper {
        width: ${drawerWidth}px;
        box-sizing: border-box;
    }
`;
