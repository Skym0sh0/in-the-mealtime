import {useCallback, useState} from "react";
import {useNavigate} from "react-router-dom";
import styled from "styled-components";
import {Restaurant, RestaurantPatch, RestaurantReport} from "../../../build/generated-ts/api/index.ts";
import {Button, Divider, Stack, TextField, Typography} from "@mui/material";
import MenuPageEditor from "./MenuPageEditor.tsx";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {useConfirmationDialog} from "../../utils/ConfirmationDialogContext.tsx";
import {useApiAccess} from "../../utils/ApiAccessContext.tsx";
import {useNotification} from "../../utils/NotificationContext.tsx";
import ReportView from "./RestaurantReportView.tsx";
import MoneyInputField from "../orders/orderDetails/MoneyInputField.tsx";

type RestaurantEditorProps = {
  restaurant: Restaurant;
  report: RestaurantReport | null;
  isNew: boolean;
  onRefresh?: () => void;
};

export default function RestaurantEditor({restaurant, isNew, onRefresh, report}: RestaurantEditorProps) {
  const {restaurantApi} = useApiAccess();
  const {notifyError} = useNotification();

  const {confirmDialog} = useConfirmationDialog();

  const [isWorking, setIsWorking] = useState(false);
  const [touched, setTouched] = useState(false);

  const [name, setName] = useState(restaurant.name || '');
  const [style, setStyle] = useState(restaurant.style || '');
  const [kind, setKind] = useState(restaurant.kind || '');
  const [orderFee, setOrderFee] = useState(restaurant.orderFee);
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
  const onDelete = useCallback(async () => {
    if (!restaurant.id)
      return;

    if (await confirmDialog({title: 'Möchtest du das Restaurant wirklich entfernen?'})) {
      restaurantApi.deleteRestaurant(restaurant.id, restaurant.version)
        .then(() => navigate('/restaurant'))
        .catch(e => notifyError("Restaurant konnte nicht gelöscht werden", e))
    }
  }, [navigate, restaurant.id, confirmDialog, restaurantApi, notifyError, restaurant.version]);

  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onSave = useCallback(() => {
    if (!isNew && !restaurant?.id)
      return;

    const newRestaurant: RestaurantPatch = {
      name: name.trim(),
      style: style,
      kind: kind,
      orderFee: orderFee,
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

    setIsWorking(true);

    (isNew
        ? () => restaurantApi.createRestaurant(newRestaurant)
        : () => restaurantApi.updateRestaurant(restaurant.id, restaurant.version, newRestaurant)
    )()
      .then(res => res.data)
      .then(rest => menuPagesOnSave?.(rest)?.then(() => rest) ?? rest)
      .then(rest => {
        setTouched(false)
        navigate({pathname: `/restaurant/${rest.id}`}, {replace: true});
      })
      .then(() => onRefresh?.()) // to explicitly trigger a reload of the parent, to see changes coming from the server
      .catch(e => notifyError("Restaurant konnte nicht gespeichert werden", e))
      .finally(() => setIsWorking(false))
  }, [isNew, restaurant.id, restaurant.version, name, style, kind, orderFee, phone, website, email, shortDescription, description, street, housenumber, postal, city, restaurantApi, menuPagesOnSave, navigate, onRefresh, notifyError]);

  const nameIsValid = !!name && !!name.trim();
  const isValid = nameIsValid;

  return <LoadingIndicator isLoading={isWorking}>
    <Stack spacing={2}>
      <Typography variant="h4">{isNew ? 'Neues' : ''} Restaurant</Typography>

      <Stack spacing={2}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <SStack spacing={2}>
            <STextField size="small"
                        label="Name"
                        value={name}
                        onChange={e => {
                          setName(e.target.value);
                          setTouched(true)
                        }}
                        error={!nameIsValid}
                        helperText={!nameIsValid && "Name muss vorhanden sein"}
            />
            <STextField size="small" label="Style" value={style} onChange={e => {
              setStyle(e.target.value);
              setTouched(true)
            }}/>

            <SStack direction="row" spacing={2} justifyContent="space-between">
              <STextField size="small" label="Typ" value={kind} onChange={e => {
                setKind(e.target.value);
                setTouched(true)
              }}/>

              <MoneyInputField size="small"
                               label="Bestellkosten"
                               placeholder="Kosten"
                               disableNegative={true}
                               sx={{width: '15ch'}}
                               value={orderFee}
                               onChange={newValue => {
                                 setOrderFee(newValue)
                                 setTouched(true)
                               }}
              />
            </SStack>
          </SStack>

          <SStack spacing={2} justifyContent="space-between">
            <STextField size="small" label="Telefon" value={phone} onChange={e => {
              setPhone(e.target.value);
              setTouched(true)
            }}/>
            <STextField size="small" label="Website" value={website} onChange={e => {
              setWebsite(e.target.value);
              setTouched(true)
            }}/>
            <STextField size="small" label="Email" value={email} onChange={e => {
              setEmail(e.target.value);
              setTouched(true)
            }}/>
          </SStack>
        </Stack>

        <Divider/>

        <Stack spacing={2} justifyContent="space-between">
          <SStack direction="row" spacing={2} justifyContent="space-between">
            <STextField size="small" label="Straße" value={street} onChange={e => {
              setStreet(e.target.value);
              setTouched(true)
            }}/>
            <TextField size="small" label="Hausnummer" value={housenumber}
                       onChange={e => {
                         setHousenumber(e.target.value);
                         setTouched(true)
                       }}/>
          </SStack>

          <SStack direction="row" spacing={2} justifyContent="space-between">
            <TextField size="small" label="Postleitzahl" value={postal} onChange={e => {
              setPostal(e.target.value);
              setTouched(true)
            }}/>
            <STextField size="small" label="Stadt" value={city} onChange={e => {
              setCity(e.target.value);
              setTouched(true)
            }}/>
          </SStack>
        </Stack>

        <Divider/>

        <SStack spacing={2}>
          <TextField size="small"
                     label="Kurzbeschreibung"
                     value={shortDescription}
                     onChange={e => {
                       setShortDescription(e.target.value);
                       setTouched(true)
                     }}/>
          <TextField size="small"
                     label="Beschreibung/Kommentar"
                     value={description}
                     onChange={e => {
                       setDescription(e.target.value);
                       setTouched(true)
                     }}
                     multiline={true}
                     rows={5}/>
        </SStack>

        <Divider/>

        <MenuPageEditor restaurant={restaurant}
                        onChange={() => setTouched(true)}
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
                  variant="contained"
                  disabled={!(isValid && touched)}>
            Speichern
          </Button>
        </Stack>
      </SButtonsFloat>

      {report &&
        <ReportView report={report}/>
      }
    </Stack>
  </LoadingIndicator>;
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
