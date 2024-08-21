import {Button, ListItemText, Menu, MenuItem, MenuList} from "@mui/material";
import {Restaurant} from "../../../../build/generated-ts/api";
import React, {useCallback, useState} from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {useNavigate} from "react-router-dom";
import {useApiAccess} from "../../../utils/ApiAccessContext.tsx";
import {useNotification} from "../../../utils/NotificationContext.tsx";
import {RestaurantOrderable} from "../types.ts";

type NewOrderButtonProps = {
  restaurants: RestaurantOrderable[],
  onChange: () => void;
};

export default function NewOrderButton({restaurants, onChange}: NewOrderButtonProps) {
  const {orderApi} = useApiAccess();
  const {notifyError, notifySuccess} = useNotification();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleRestaurantClick = useCallback((restaurant: Restaurant) => {
    setIsLoading(true);

    handleClose()

    orderApi.createOrder(restaurant.id)
      .then(res => res.data)
      .then(newOrder => {
        notifySuccess("Neue Bestellung eröffnet")
        onChange()
        navigate({pathname: `/order/${newOrder.id}`});
      })
      .catch(e => notifyError("Konnte keine neue Order erstellen", e))
      .finally(() => setIsLoading(false))
  }, [navigate, onChange, orderApi, notifyError, notifySuccess]);

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
                             disabled={!restaurant.orderable}
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
