import {Button, ListItemText, Menu, MenuItem, MenuList} from "@mui/material";
import {Restaurant} from "../../../build/generated-ts/api";
import React, {useCallback, useState} from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {useNavigate} from "react-router-dom";
import {useApiAccess} from "../../utils/ApiAccessContext.tsx";

type NewOrderButtonProps = {
  restaurants: Restaurant[],
  restaurantsWithOpenOrder: Restaurant[],
  onChange: () => void;
};

export default function NewOrderButton({restaurants, restaurantsWithOpenOrder, onChange}: NewOrderButtonProps) {
  const {orderApi} = useApiAccess();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const hasOpenOrder = useCallback((restaurant: Restaurant) => {
    return restaurantsWithOpenOrder.map(r => r.id).includes(restaurant.id)
  }, [restaurantsWithOpenOrder]);

  const handleRestaurantClick = useCallback((restaurant: Restaurant) => {
    setIsLoading(true);

    handleClose()

    orderApi.createOrder(restaurant.id)
      .then(res => res.data)
      .then(newOrder => {
        onChange()

        navigate({pathname: `/order/${newOrder.id}`});
      })
      .finally(() => setIsLoading(false))
  }, [navigate, onChange, orderApi]);

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
                             disabled={hasOpenOrder(restaurant)}
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
