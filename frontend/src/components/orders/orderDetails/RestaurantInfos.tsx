import {Box, Link, Stack, Typography} from "@mui/material";
import {Restaurant} from "../../../../build/generated-ts/api";
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {assertNever} from "../../../utils/utils.ts";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuPages from "./MenuPages.tsx";
import {useEffect, useMemo, useRef, useState} from "react";
import useWindowSizing from "../../../utils/useWindowSizing.ts";

enum InfoLineStyle {
  Normal,
  Link,
  Phone,
  Email,
  Address,
}

function SingleInfoLine({line, style}: { line?: string, style: InfoLineStyle }) {
  const phone = useMemo(() => {
    return (line ?? '').replace(/\D/g, '')
  }, [line]);

  const link = useMemo(() => {
    return (line ?? '').trim().toLowerCase().startsWith('http')
      ? line
      : "http://" + line
  }, [line]);

  if (!line || !line.trim())
    return null;

  const trimmed = line.trim()

  switch (style) {
    case InfoLineStyle.Normal:
      return <Typography variant="caption">
        {trimmed}
      </Typography>

    case InfoLineStyle.Link:
      return <Link sx={{display: 'flex', alignItems: 'center'}}
                   href={link}
                   target="_blank"
                   rel="noopener noreferrer">
        <OpenInNewIcon fontSize="small" sx={{mr: 1}}/>
        <Typography variant="caption">
          {trimmed}
        </Typography>
      </Link>

    case InfoLineStyle.Phone:
      return <Link sx={{display: 'flex', alignItems: 'center'}}
                   underline="hover"
                   href={"tel:" + phone}>
        <PhoneIcon fontSize="small" sx={{mr: 1}}/>
        <Typography variant="caption">
          {line}
        </Typography>
      </Link>

    case InfoLineStyle.Email:
      return <Link sx={{display: 'flex', alignItems: 'center'}}
                   underline="hover"
                   href={"mailto:" + trimmed}>
        <EmailIcon fontSize="small" sx={{mr: 1}}/>
        <Typography variant="caption">
          {trimmed}
        </Typography>
      </Link>

    case InfoLineStyle.Address: {
      const encodedAddress = encodeURIComponent(trimmed);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

      return <Link sx={{display: 'flex', alignItems: 'center'}}
                   underline="hover"
                   target="_blank"
                   rel="noopener noreferrer"
                   href={mapsUrl}>
        <LocationOnIcon fontSize="small" sx={{mr: 1}}/>
        <Typography variant="caption">{trimmed}</Typography>
      </Link>;
    }

    default:
      throw assertNever(style);
  }
}

export default function RestaurantInfos({restaurant}: { restaurant: Restaurant }) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(10);

  const [, windowheight] = useWindowSizing();

  useEffect(() => {
    if (elementRef.current)
      setHeight(elementRef.current.clientHeight);
  }, [windowheight]);

  const address = useMemo(() => {
    if (!restaurant.address)
      return undefined;

    const add = restaurant.address;
    return `${add.street} ${add.housenumber} ${add.postal} ${add.city}`
  }, [restaurant.address]);

  return <Stack direction="column"
                justifyContent="center" alignItems="center"
                spacing={1} sx={{height: '100%', padding: '0.5em'}}>
    <Typography variant="h6">
      Restaurant
    </Typography>

    <Stack spacing={1}>
      <SingleInfoLine style={InfoLineStyle.Normal} line={restaurant.name}/>
      <SingleInfoLine style={InfoLineStyle.Phone} line={restaurant.phone}/>
      <SingleInfoLine style={InfoLineStyle.Email} line={restaurant.email}/>
      <SingleInfoLine style={InfoLineStyle.Link} line={restaurant.website}/>
      <SingleInfoLine style={InfoLineStyle.Address} line={address}/>
    </Stack>

    <Box sx={{flexGrow: 1, height: '100%', width: '100%'}}>
      <div style={{height: '100%', width: '100%'}} ref={elementRef}>
        <MenuPages height={`${height}px`} restaurant={restaurant}/>
      </div>
    </Box>
  </Stack>;
}
