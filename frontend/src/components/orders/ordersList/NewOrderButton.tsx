import {Button, ListItemAvatar, ListItemText, Menu, MenuItem, MenuList} from "@mui/material";
import {Restaurant} from "../../../../build/generated-ts/api";
import React, {useCallback, useState} from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {RestaurantOrderable} from "../types.ts";
import RestaurantAvatar from "../../restaurant/RestaurantAvatar.tsx";
import NewOrderDialog from "./NewOrderDialog.tsx";

type NewOrderButtonProps = {
  restaurants: RestaurantOrderable[],
  onChange: () => void;
};

export default function NewOrderButton({restaurants, onChange}: NewOrderButtonProps) {
  const [restaurantToOpen, setRestaurantToOpen] = useState<Restaurant | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleRestaurantClick = useCallback((restaurant: Restaurant) => {
    handleClose()
    setRestaurantToOpen(restaurant);
  }, []);

  const onOrderOpened = useCallback(() => {
    setRestaurantToOpen(null)
    onChange()
  }, [onChange])

  const onOrderOpenAborted = useCallback(() => {
    setRestaurantToOpen(null)
  }, [])

  return <>
    <Button onClick={handleClick}
            variant="contained"
            color="secondary"
            title="Öffnet eine neue Bestellung bei einem gewählten Restaurant."
            endIcon={<KeyboardArrowDownIcon/>}>
      Neue Bestellung
    </Button>

    <Menu anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={handleClose}>
      <MenuList>
        {
          restaurants.map(restaurant => {
            return <MenuItem key={restaurant.id}
                             disabled={!restaurant.orderable}
                             title={restaurant.description}
                             onClick={() => handleRestaurantClick(restaurant)}>
              <ListItemAvatar>
                <RestaurantAvatar restaurant={restaurant} size="small"/>
              </ListItemAvatar>

              <ListItemText secondary={restaurant.shortDescription?.substring(0, 48)}>
                {restaurant.name}
              </ListItemText>
            </MenuItem>
          })
        }
      </MenuList>
    </Menu>

    {restaurantToOpen &&
      <NewOrderDialog restaurant={restaurantToOpen}
                      onOrderOpened={onOrderOpened}
                      onAbort={onOrderOpenAborted}
      />
    }
  </>;
}
