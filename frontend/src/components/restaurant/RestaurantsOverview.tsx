import {Restaurant} from "../../../build/generated-ts/api/api.ts";
import {Avatar, Button, Card, CardActions, CardContent, Paper, Stack, Typography} from "@mui/material";
import styled from "styled-components";
import {api} from "../../api/api.ts";
import {useEffect, useMemo, useState} from "react";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";

type RestaurantCardProps = {
  restaurant: Restaurant;
  isNew?: boolean;
};

function RestaurantCard({restaurant, isNew}: RestaurantCardProps) {
  const avatar = useMemo(() => {
    if (isNew)
      return null;

    return restaurant.name.split(' ')
      .slice(0, 2)
      .map(w => w.charAt(0))
      .map(c => c.toUpperCase())
      .join('');
  }, [restaurant.name, isNew]);

  const color = useMemo(() => {
    if (isNew)
      return null;

    let hash = 0;
    for (let i = 0; i < restaurant.name.length; i++) {
      const c = restaurant.name.charCodeAt(i);
      hash = (hash << 5) - hash + c;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }, [restaurant.name, isNew]);

  return <Card sx={{minWidth: 500}} elevation={8}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Avatar sizes="sm" sx={{bgcolor: `#${color}`}}>
          {avatar}
        </Avatar>

        {
          [restaurant.kind, restaurant.style]
            .map((text, idx) => {
                return <Typography key={text || idx} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                  {text}
                </Typography>;
              }
            )
        }
      </Stack>

      <Typography variant="h5" component="div">
        {restaurant.name}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {restaurant.shortDescription}
      </Typography>
    </CardContent>

    <CardActions>
      <Stack sx={{width: '100%'}} direction="row" justifyContent="space-between">
        <Button>
          {restaurant.phone}
        </Button>

        <Button size="small" href={`/restaurant/${restaurant.id}`} variant="contained">
          {isNew ? 'Neu anlegen' : 'Bearbeiten'}
        </Button>
      </Stack>
    </CardActions>
  </Card>
}

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
                          shortDescription: 'Erstelle neues Restaurant'
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
