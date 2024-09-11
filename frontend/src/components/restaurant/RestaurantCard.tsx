import {useMemo} from "react";
import {Button, Card, CardActions, CardContent, Link, Stack, Typography} from "@mui/material";
import {Restaurant} from "../../../build/generated-ts/api/api.ts";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RestaurantAvatar from "./RestaurantAvatar.tsx";

type RestaurantCardProps = {
  restaurant: Restaurant;
  isNew?: boolean;
};

export default function RestaurantCard({restaurant, isNew}: RestaurantCardProps) {
  const phone = useMemo(() => {
    if (!restaurant.phone)
      return null;
    return "tel:" + restaurant.phone.replace(/\D/g, '');
  }, [restaurant.phone]);

  const link = useMemo(() => {
    if (!restaurant.website)
      return null;
    if (restaurant.website.toLowerCase().startsWith("http"))
      return restaurant.website
    return "https://" + restaurant.website;
  }, [restaurant.website]);

  return <Card style={{width: 350}} elevation={8}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <RestaurantAvatar restaurant={restaurant} isNew={isNew ?? false}/>

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

      <Typography variant="body2" color="text.secondary" title={restaurant.description}>
        {restaurant.shortDescription ? restaurant.shortDescription : <>&nbsp;</>}
      </Typography>
    </CardContent>

    <CardActions>
      <Stack sx={{width: '100%'}} direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1}>
          {link &&
            <Link fontSize="small" href={link} target="_blank" rel="noopener noreferrer">
              <OpenInNewIcon fontSize="small"/>
            </Link>
          }

          {phone &&
            <Link fontSize="small" href={phone} target="_top" rel="noopener noreferrer">
              {restaurant.phone}
            </Link>
          }
        </Stack>

        <Button size="small" href={`/restaurant/${restaurant.id}`} variant="contained">
          {isNew ? 'Neu anlegen' : 'Bearbeiten'}
        </Button>
      </Stack>
    </CardActions>
  </Card>
}
