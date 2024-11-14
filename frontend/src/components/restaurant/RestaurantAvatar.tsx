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

  const color = useMemo(() => {
    return getContrastColor(getRgbValues(restaurant.avatarColor));
  }, [restaurant.avatarColor]);

  return <Avatar sx={{bgcolor: `${restaurant.avatarColor}`, color, ...sizeStruct}}>
    {avatar}
  </Avatar>
}

function getContrastColor(rgb?: Uint8ClampedArray): string {
  if (!rgb) {
    return '#fff';
  }
  // https://stackoverflow.com/a/3943023
  if ((rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > 186) {
    return '#000';
  } else {
    return '#fff';
  }
}

function getRgbValues(cssColor: string | undefined) {
  if (!cssColor) {
    return undefined;
  }
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = cssColor;
    context.fillRect(0, 0, 1, 1);
  }
  return context?.getImageData(0, 0, 1, 1).data;
}