import {Box, Drawer, Paper, Toolbar} from "@mui/material";
import styled from "styled-components";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import OrdersCardsList from "./ordersList/OrdersCardsList.tsx";
import {DRAWER_WIDTH} from "../../utils/utils.ts";
import {Outlet} from "react-router-dom";
import useOrderableRestaurants from "./useOrderableRestaurants.ts";

export default function OrdersOverview() {
  const {restaurants, hasError, refreshRestaurants} = useOrderableRestaurants();

  return <LoadingIndicator isLoading={restaurants === null}>
    <Box style={{display: "flex", height: '100%'}}>
      <SDrawer variant="permanent">
        <Toolbar/>
        <Paper sx={{height: '100%', maxHeight: '100%'}}>
          {!hasError && restaurants &&
            <OrdersCardsList restaurants={restaurants}
                             onRefresh={refreshRestaurants}/>
          }
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
