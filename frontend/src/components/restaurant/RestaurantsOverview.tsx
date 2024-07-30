import {Restaurant} from "../../../build/generated-ts/api/api.ts";
import {Box, Stack} from "@mui/material";
import styled from "styled-components";
import {useEffect, useState} from "react";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import RestaurantCard from "./RestaurantCard.tsx";
import {useApiAccess} from "../../utils/ApiAccessContext.tsx";
import {useNotification} from "../../utils/NotificationContext.tsx";

export default function RestaurantsOverview() {
  const {restaurantApi} = useApiAccess();
  const {notifyError} = useNotification();

  const [hasError, setHasError] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);

  useEffect(() => {
    restaurantApi.fetchRestaurants()
      .then(res => setRestaurants(res.data))
      .catch(e => {
        notifyError("Restaurants konnten nicht geladen werden", e);
        setRestaurants([])
        setHasError(true)
      })
  }, [notifyError]);

  return <Box>
    <Stack direction="column" justifyContent="center" alignItems="center">
      <LoadingIndicator isLoading={restaurants === null}>
        <SFlexGrid>
          {!hasError &&
            <RestaurantCard isNew={true}
                            restaurant={{
                              id: 'new-restaurant',
                              name: 'Neues Restaurant',
                              style: 'Neu',
                              shortDescription: 'Erstelle neues Restaurant',
                              address: {},
                              menuPages: [],
                            }}/>
          }

          {restaurants && restaurants.map(r => <RestaurantCard key={r.id} restaurant={r}/>)}
        </SFlexGrid>

      </LoadingIndicator>
    </Stack>
  </Box>;
}

const SFlexGrid = styled(Box)`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-content: baseline;
    align-items: center;
    gap: 1em;
    padding: 2em;
`;
