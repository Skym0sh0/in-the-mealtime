import {Avatar} from "@mui/material";
import {useMemo} from "react";
import {Restaurant} from "../../../build/generated-ts/api/api.ts";

export type AvatarSize = "small" | "medium" | "large";

export default function RestaurantAvatar({restaurant, size, isNew}: {
  restaurant: Restaurant,
  isNew?: boolean,
  size?: AvatarSize
}) {
  const avatar = useMemo(() => {
    if (isNew || !restaurant.name)
      return '?';

    return restaurant.name.split(' ')
      .slice(0, 2)
      .map(w => w.charAt(0))
      .map(c => c.toUpperCase())
      .join('');
  }, [restaurant.name, isNew]);

  const sizeStruct = useMemo(() => {
    switch (size) {
      case "small":
        return {width: 32, height: 32,};
      case "large":
        return {width: 64, height: 64,};
    }

    return {width: 48, height: 48,};
  }, [size])

  return <Avatar sx={{bgcolor: `${restaurant.avatarColor}`, ...sizeStruct}}>
    {avatar}
  </Avatar>
}