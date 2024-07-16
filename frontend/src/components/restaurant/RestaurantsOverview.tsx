import {Restaurant} from "../../../build/generated-ts/api/api.ts";
import {Box, Stack} from "@mui/material";
import styled from "styled-components";
import {api} from "../../api/api.ts";
import {useEffect, useState} from "react";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import RestaurantCard from "./RestaurantCard.tsx";

export default function RestaurantsOverview() {
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);

  useEffect(() => {
    api.restaurants.fetchRestaurants()
      .then(res => setRestaurants(res.data))
  }, []);

  return <Box>
    <Stack direction="column" justifyContent="center" alignItems="center">
      <LoadingIndicator isLoading={restaurants === null}>
        <SFlexGrid>
          <RestaurantCard isNew={true}
                          restaurant={{
                            id: 'new-restaurant',
                            name: 'Neues Restaurant',
                            style: 'Neu',
                            shortDescription: 'Erstelle neues Restaurant',
                            address: {},
                            menuPages: [],
                          }}/>

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
