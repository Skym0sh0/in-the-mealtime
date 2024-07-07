import {api} from "../../api/api.ts";
import {useNavigate, useParams} from "react-router-dom";
import {Restaurant} from "../../../build/generated-ts/api/index.ts";
import {Button, Paper, Stack, TextField, Typography} from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import styled from "styled-components";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {v4 as uuidv4, validate as uuidValidate} from 'uuid';

type RestaurantEditorProps = {
  restaurant: Restaurant;
  isNew: boolean;
};

function RestaurantEditor({restaurant, isNew}: RestaurantEditorProps) {
  const [name, setName] = useState(restaurant.name || '');
  const [style, setStyle] = useState(restaurant.style || '');
  const [kind, setKind] = useState(restaurant.kind || '');
  const [phone, setPhone] = useState(restaurant.phone || '');
  const [website, setWebsite] = useState(restaurant.website || '');
  const [email, setEmail] = useState(restaurant.email || '');
  const [street, setStreet] = useState(restaurant.address?.street || '');
  const [housenumber, setHousenumber] = useState(restaurant.address?.housenumber || '');
  const [postal, setPostal] = useState(restaurant.address?.postal || '');
  const [city, setCity] = useState(restaurant.address?.city || '');
  const [shortDescription, setShortDescription] = useState(restaurant.shortDescription || '');
  const [description, setDescription] = useState(restaurant.description || '');

  const navigate = useNavigate();
  const onDelete = useCallback(() => {
    if (!restaurant.id)
      return;

    api.restaurants.deleteRestaurant(restaurant.id)
      .then(() => navigate(-1))
  }, [navigate, restaurant.id]);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onSave = useCallback(() => {
    if (!restaurant?.id)
      return;

    const newRestaurant: Restaurant = {
      id: restaurant.id,
      name: name,
      style: style,
      kind: kind,
      phone: phone,
      website: website,
      email: email,
      shortDescription: shortDescription,
      description: description,
      address: {
        street: street,
        housenumber: housenumber,
        postal: postal,
        city: city,
      },
    };

    const creator = isNew
      ? () => api.restaurants.createRestaurant(newRestaurant)
      : () => api.restaurants.updateRestaurant(newRestaurant.id, newRestaurant)

    creator()
      .then(() => {
        navigate({pathname: `/restaurant/${newRestaurant.id}`}, {replace: true});
      })
  }, [name, style, kind, phone, website, email, shortDescription, description, street, housenumber, postal, city, navigate, restaurant.id, isNew]);

  return <Stack spacing={2}>
    <Typography variant="h4">{isNew ? 'Neues' : ''} Restaurant</Typography>

    <Stack spacing={2}>
      <TextField label="Name" value={name} onChange={e => setName(e.target.value)}/>
      <TextField label="Style" value={style} onChange={e => setStyle(e.target.value)}/>
      <TextField label="Typ" value={kind} onChange={e => setKind(e.target.value)}/>
      <TextField label="Phone" value={phone} onChange={e => setPhone(e.target.value)}/>
      <TextField label="Website" value={website} onChange={e => setWebsite(e.target.value)}/>
      <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)}/>

      <Stack direction="row" spacing={2}>
        <TextField label="Street" value={street} onChange={e => setStreet(e.target.value)}/>
        <TextField label="Housenumber" value={housenumber} onChange={e => setHousenumber(e.target.value)}/>
      </Stack>

      <Stack direction="row" spacing={2}>
        <TextField label="Postal" value={postal} onChange={e => setPostal(e.target.value)}/>
        <TextField label="City" value={city} onChange={e => setCity(e.target.value)}/>
      </Stack>

      <TextField label="Shortdescription"
                 value={shortDescription}
                 onChange={e => setShortDescription(e.target.value)}/>
      <TextField label="description"
                 value={description}
                 onChange={e => setDescription(e.target.value)}
                 multiline={true}
                 rows={5}/>
    </Stack>

    <SButtonsFloat>
      <Button onClick={onDelete}
              color="error"
              variant="contained">
        Löschen
      </Button>

      <Stack direction="row" spacing={2}>
        <Button onClick={onBack}
                href="/restaurant"
                color="warning"
                variant="contained">
          Zurück
        </Button>

        <Button onClick={onSave}
                color="primary"
                variant="contained">
          Speichern
        </Button>
      </Stack>
    </SButtonsFloat>
  </Stack>;
}


export default function RestaurantView() {
  const params = useParams<{ restaurantId: string }>();

  const [isNew, setIsNew] = useState<boolean>(true);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    if (!params.restaurantId)
      return;

    if (uuidValidate(params.restaurantId)) {
      setIsNew(false);
      api.restaurants.fetchRestaurant(params.restaurantId)
        .then(res => setRestaurant(res.data))
    } else {
      setIsNew(true);
      setRestaurant({
        id: uuidv4(),
      } as Restaurant)
    }
  }, []);

  return <SPaper>
    <LoadingIndicator isLoading={!restaurant}>
      {restaurant &&
        <RestaurantEditor restaurant={restaurant} isNew={isNew}/>
      }
    </LoadingIndicator>
  </SPaper>
}

const SButtonsFloat = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 1em;
`;

const SPaper = styled(Paper)`
    padding: 2em;
`;
