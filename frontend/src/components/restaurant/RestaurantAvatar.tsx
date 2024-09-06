import {Avatar} from "@mui/material";
import {useMemo} from "react";
import {Restaurant} from "../../../build/generated-ts/api/api.ts";

export default function RestaurantAvatar({restaurant, isNew}: { restaurant: Restaurant, isNew: boolean }) {
  const avatar = useMemo(() => {
    if (isNew || !restaurant.name)
      return '?';

    return restaurant.name.split(' ')
      .slice(0, 2)
      .map(w => w.charAt(0))
      .map(c => c.toUpperCase())
      .join('');
  }, [restaurant.name, isNew]);

  return <Avatar sizes="sm" sx={{bgcolor: `${restaurant.color}`}}>
    {avatar}
  </Avatar>
}