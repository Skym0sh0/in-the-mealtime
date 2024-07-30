import {useParams} from "react-router-dom";
import {Restaurant} from "../../../build/generated-ts/api/index.ts";
import {Paper} from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import styled from "styled-components";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {validate as uuidValidate} from 'uuid';
import RestaurantEditor from "./RestaurantEditor.tsx";
import {useApiAccess} from "../../utils/ApiAccessContext.tsx";

export default function RestaurantView() {
  const {restaurantApi} = useApiAccess();

  const params = useParams<{ restaurantId: string }>();

  const [isNew, setIsNew] = useState<boolean>(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const refresh = useCallback(() => {
    if (!params.restaurantId)
      return;

    restaurantApi.fetchRestaurant(params.restaurantId)
      .then(res => setRestaurant(res.data))
  }, [params.restaurantId, restaurantApi]);

  useEffect(() => {
    if (!params.restaurantId)
      return;

    if (uuidValidate(params.restaurantId)) {
      setIsNew(false);
      refresh();
    } else {
      setIsNew(true);
      setRestaurant({} as Restaurant)
    }
  }, [params.restaurantId, refresh]);

  return <SPaper elevation={8}>
    <LoadingIndicator isLoading={!restaurant}>
      {restaurant &&
        <RestaurantEditor restaurant={restaurant}
                          isNew={isNew}
                          onRefresh={isNew ? undefined : refresh}/>
      }
    </LoadingIndicator>
  </SPaper>
}

const SPaper = styled(Paper)`
    padding: 2em;
    min-width: 960px;
    min-height: 600px;
`;
