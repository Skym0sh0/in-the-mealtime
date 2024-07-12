import {useCallback, useState} from "react";
import {useNavigate} from "react-router-dom";
import {api} from "../../api/api.ts";
import styled from "styled-components";
import {Restaurant} from "../../../build/generated-ts/api/index.ts";
import {Button, Divider, Stack, TextField, Typography} from "@mui/material";
import MenuPageEditor from "./MenuPageEditor.tsx";

type RestaurantEditorProps = {
  restaurant: Restaurant;
  isNew: boolean;
  onRefresh: () => void;
};

export default function RestaurantEditor({restaurant, isNew, onRefresh}: RestaurantEditorProps) {
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

  const [menuPagesOnSave, setMenuPagesOnSave] = useState<((rest: Restaurant) => Promise<void>) | null>(null);
  const handleInit = useCallback((method: (rest: Restaurant) => Promise<void>) => {
    setMenuPagesOnSave(() => method)
  }, []);

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
      menuPages: [],
    };

    (isNew
        ? () => api.restaurants.createRestaurant(newRestaurant)
        : () => api.restaurants.updateRestaurant(newRestaurant.id, newRestaurant)
    )()
      .then(res => res.data)
      .then(rest => menuPagesOnSave?.(rest)?.then(() => rest) ?? rest)
      .then(rest => {
        navigate({pathname: `/restaurant/${rest.id}`}, {replace: true});
      })
      .then(() => onRefresh())
  }, [restaurant.id, name, style, kind, phone, website, email, shortDescription, description, street, housenumber, postal, city, isNew, menuPagesOnSave, navigate, onRefresh]);

  return <Stack spacing={2}>
    <Typography variant="h4">{isNew ? 'Neues' : ''} Restaurant</Typography>

    <Stack spacing={2}>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <SStack spacing={2}>
          <STextField size="small" label="Name" value={name} onChange={e => setName(e.target.value)}/>
          <STextField size="small" label="Style" value={style} onChange={e => setStyle(e.target.value)}/>
          <STextField size="small" label="Typ" value={kind} onChange={e => setKind(e.target.value)}/>
        </SStack>

        <SStack spacing={2} justifyContent="space-between">
          <STextField size="small" label="Phone" value={phone} onChange={e => setPhone(e.target.value)}/>
          <STextField size="small" label="Website" value={website} onChange={e => setWebsite(e.target.value)}/>
          <STextField size="small" label="Email" value={email} onChange={e => setEmail(e.target.value)}/>
        </SStack>
      </Stack>

      <Divider/>

      <Stack spacing={2} justifyContent="space-between">
        <SStack direction="row" spacing={2} justifyContent="space-between">
          <STextField size="small" label="Street" value={street} onChange={e => setStreet(e.target.value)}/>
          <TextField size="small" label="Housenumber" value={housenumber}
                     onChange={e => setHousenumber(e.target.value)}/>
        </SStack>

        <SStack direction="row" spacing={2} justifyContent="space-between">
          <TextField size="small" label="Postal" value={postal} onChange={e => setPostal(e.target.value)}/>
          <STextField size="small" label="City" value={city} onChange={e => setCity(e.target.value)}/>
        </SStack>
      </Stack>

      <Divider/>

      <SStack spacing={2}>
        <TextField size="small"
                   label="Short Description"
                   value={shortDescription}
                   onChange={e => setShortDescription(e.target.value)}/>
        <TextField size="small"
                   label="Description"
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                   multiline={true}
                   rows={5}/>
      </SStack>

      <Divider/>

      <MenuPageEditor restaurant={restaurant}
                      onInit={handleInit}/>
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