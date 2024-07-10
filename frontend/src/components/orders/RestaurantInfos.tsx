import {Box, Link, Paper, Stack, Typography} from "@mui/material";
import {Restaurant} from "../../../build/generated-ts/api";
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {assertNever} from "../../utils/utils.ts";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuPages from "./MenuPages.tsx";

enum InfoLineStyle {
  Normal,
  Link,
  Phone,
  Email,
  Address,
}

function SingleInfoLine({line, style}: { line?: string, style: InfoLineStyle }) {
  if (!line || !line.trim())
    return null;

  const trimmed = line.trim();

  switch (style) {
    case InfoLineStyle.Normal:
      return <Typography variant="caption">
        {trimmed}
      </Typography>

    case InfoLineStyle.Link:
      return <Link sx={{display: 'flex', alignItems: 'center'}}
                   href={trimmed}
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
                   href={"tel:" + trimmed}>
        <PhoneIcon fontSize="small" sx={{mr: 1}}/>
        <Typography variant="caption">
          {trimmed}
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
  return <Paper elevation={2} sx={{p: 1, minWidth: '176px'}}>
    <Stack spacing={1} sx={{height: '100%'}}>
      <Typography variant="h6">
        Restaurant
      </Typography>

      <Stack>
        <SingleInfoLine style={InfoLineStyle.Phone}
                        line={restaurant.phone}/>
        <SingleInfoLine style={InfoLineStyle.Email}
                        line={restaurant.email}/>
        <SingleInfoLine style={InfoLineStyle.Link}
                        line={restaurant.website}/>
        <SingleInfoLine style={InfoLineStyle.Address}
                        line={`${restaurant.address?.street} ${restaurant.address?.housenumber} ${restaurant.address?.postal} ${restaurant.address?.city}`}/>
      </Stack>

      <Box sx={{flexGrow: 1}}>
        <MenuPages restaurant={restaurant}/>
      </Box>
    </Stack>
  </Paper>
}
