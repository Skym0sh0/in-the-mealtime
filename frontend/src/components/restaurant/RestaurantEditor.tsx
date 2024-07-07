import {useCallback, useState} from "react";
import {useNavigate} from "react-router-dom";
import {api} from "../../api/api.ts";
import {Button, Divider, Stack, TextField, Typography} from "@mui/material";
import styled from "styled-components";
import {Restaurant} from "../../../build/generated-ts/api/index.ts";

type RestaurantEditorProps = {
  restaurant: Restaurant;
  isNew: boolean;
};

export default function RestaurantEditor({restaurant, isNew}: RestaurantEditorProps) {
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
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <SStack spacing={2}>
          <STextField label="Name" value={name} onChange={e => setName(e.target.value)}/>
          <STextField label="Style" value={style} onChange={e => setStyle(e.target.value)}/>
          <STextField label="Typ" value={kind} onChange={e => setKind(e.target.value)}/>
        </SStack>

        <SStack spacing={2} justifyContent="space-between">
          <STextField label="Phone" value={phone} onChange={e => setPhone(e.target.value)}/>
          <STextField label="Website" value={website} onChange={e => setWebsite(e.target.value)}/>
          <STextField label="Email" value={email} onChange={e => setEmail(e.target.value)}/>
        </SStack>
      </Stack>

      <Divider/>

      <Stack spacing={2} justifyContent="space-between">
        <SStack direction="row" spacing={2} justifyContent="space-between">
          <STextField label="Street" value={street} onChange={e => setStreet(e.target.value)}/>
          <TextField label="Housenumber" value={housenumber} onChange={e => setHousenumber(e.target.value)}/>
        </SStack>

        <SStack direction="row" spacing={2} justifyContent="space-between">
          <TextField label="Postal" value={postal} onChange={e => setPostal(e.target.value)}/>
          <STextField label="City" value={city} onChange={e => setCity(e.target.value)}/>
        </SStack>
      </Stack>

      <Divider/>

      <SStack spacing={2}>
        <TextField label="Short Description"
                   value={shortDescription}
                   onChange={e => setShortDescription(e.target.value)}/>
        <TextField label="Description"
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                   multiline={true}
                   rows={5}/>
      </SStack>
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
const STextField = styled(TextField)`
    width: 100%;
`;

const SStack = styled(Stack)`
    width: 100%;
`;

const SButtonsFloat = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 1em;
`;
