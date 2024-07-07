import {Restaurant} from "../../../build/generated-ts/api/api.ts";
import {Button, Card, CardActions, CardContent, Divider, Fab, Paper, Typography} from "@mui/material";
import styled from "styled-components";
import {api} from "../../api/api.ts";
import AddIcon from '@mui/icons-material/Add';
import {useCallback, useEffect, useState} from "react";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {useNavigate} from "react-router-dom";

function RestaurantCard({restaurant}: { restaurant: Restaurant }) {
  return <Card sx={{minWidth: 500}} elevation={8}>
    <CardContent>
      <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
        Restaurant
      </Typography>

      <Typography variant="h5" component="div">
        {restaurant.name}
      </Typography>

      <Typography sx={{mb: 1.5}} color="text.secondary">
        thailändisch/asiatisch
      </Typography>

      <Typography variant="body2">
        Bemerkung zum Restaurant
      </Typography>
    </CardContent>

    <CardActions>
      <Button size="small" href={`/restaurant/${restaurant.id}`} variant="contained">
        Anschauen
      </Button>
    </CardActions>
  </Card>
}

export default function RestaurantsOverview() {
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);

  useEffect(() => {
    setTimeout(() => {
      api.restaurants.fetchRestaurants()
        .then(res => setRestaurants(res.data))
    }, 500)
  }, []);

  const navigate = useNavigate();

  const onNewRestaurant = useCallback(() => {
    console.log("new restaruant")

    navigate({
      pathname: `./new-restaurant`,
      search: 'is-new=true'
    }, {relative: 'path'});
  }, [navigate]);

  return <Paper elevation={8}>
    <Typography variant="h3">
      Restaurants
    </Typography>

    <Fab color="primary"
         onClick={onNewRestaurant}>
      <AddIcon/>
    </Fab>

    <Divider dir="row"/>

    <LoadingIndicator isLoading={restaurants === null}>
      <SFlexGrid>
        {restaurants && restaurants.map(r => <RestaurantCard key={r.id} restaurant={r}/>)}
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
