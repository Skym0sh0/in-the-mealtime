import {Button, ListItemText, Menu, MenuItem, MenuList} from "@mui/material";
import {Restaurant} from "../../../build/generated-ts/api";
import React, {useCallback, useState} from "react";
import {api} from "../../api/api.ts";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {useNavigate} from "react-router-dom";

type NewOrderButtonProps = {
  restaurants: Restaurant[],
  onChange: () => void;
};

export default function NewOrderButton({restaurants, onChange}: NewOrderButtonProps) {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleRestaurantClick = useCallback((restaurant: Restaurant) => {
    setIsLoading(true);

    handleClose()

    api.orders.createOrder(restaurant.id)
      .then(res => res.data)
      .then(newOrder => {
        onChange()
        console.log("new order", newOrder)
        navigate({pathname: `/order/${newOrder.id}`});
      })
      .finally(() => setIsLoading(false))
  }, [navigate, onChange]);

  return <>
    <Button disabled={isLoading}
            onClick={handleClick}
            variant="contained"
            color="secondary"
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
                             onClick={() => handleRestaurantClick(restaurant)}>
              <ListItemText>
                {restaurant.name}
              </ListItemText>
            </MenuItem>
          })
        }
      </MenuList>
    </Menu>
  </>;
}
