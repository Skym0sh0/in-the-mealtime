import {Restaurant} from "../../../build/generated-ts/api/api.ts";
import {Paper, Typography} from "@mui/material";
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

  return <Paper elevation={8}>
    <Typography variant="h3">
      Restaurants
    </Typography>

    <LoadingIndicator isLoading={restaurants === null}>
      <SFlexGrid>
        {restaurants && restaurants.map(r => <RestaurantCard key={r.id} restaurant={r}/>)}

        <RestaurantCard isNew={true}
                        restaurant={{
                          id: 'new-restaurant',
                          name: 'Neues Restaurant',
                          style: 'Neu',
                          shortDescription: 'Erstelle neues Restaurant',
                          address: {},
                          menuPages: [],
                        }}/>
      </SFlexGrid>
    </LoadingIndicator>
  </Paper>;
}

const SFlexGrid = styled(Paper)`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-content: baseline;
    align-items: center;
    gap: 1em;
    padding: 2em;
`;
