import {useCallback, useEffect, useMemo, useState} from "react";
import {IconButton, Paper, Stack, TextField, Typography, useTheme} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import UndoIcon from "@mui/icons-material/Undo";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from '@mui/icons-material/Add';
import {OrderPosition, OrderPositionPatch, OrderStateType} from "../../../../build/generated-ts/api";
import MoneyInputField from "./MoneyInputField.tsx";

type OrderPositionEditorProps = {
  orderState: OrderStateType,
  canAddNew: boolean,
  onSave: (pos: OrderPositionPatch) => Promise<void>;
  onUpdate: (id: string, pos: OrderPositionPatch) => Promise<void>;
  onAbort: () => void;
  inputPosition: OrderPosition | null;
};

const NO_ERROR = ' ';

export default function OrderPositionEditor({
                                              orderState,
                                              canAddNew,
                                              onSave,
                                              onUpdate,
                                              onAbort,
                                              inputPosition
                                            }: OrderPositionEditorProps) {
  const [touched, setTouched] = useState(false);

  const [name, setName] = useState('');
  const [meal, setMeal] = useState('');
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [paid, setPaid] = useState<number | undefined>(undefined);
  const [tip, setTip] = useState<number | undefined>(undefined);

  const nameError = useMemo(() => {
    return touched && !name ? "Name fehlt" : NO_ERROR;
  }, [name, touched]);
  const mealError = useMemo(() => {
    return touched && !meal ? "Gericht fehlt" : NO_ERROR;
  }, [meal, touched]);
  const priceError = useMemo(() => {
    if (!touched)
      return NO_ERROR;

    if ((price ?? 0) <= 0)
      return "Preis fehlerhaft";

    return NO_ERROR;
  }, [price, touched]);
  const paidError = useMemo(() => {
    if (!paid && !inputPosition)
      return NO_ERROR

    if ((paid ?? 0) < (price ?? 0))
      return "Zu wenig";

    return NO_ERROR
  }, [inputPosition, paid, price]);
  const tipError = useMemo(() => {
    if (!tip)
      return NO_ERROR

    if (tip < 0)
      return "fehlerhaft"

    if (tip > ((paid ?? 0) - (price ?? 0)))
      return "Zu viel Trinkgeld"

    return NO_ERROR
  }, [tip, paid, price]);

  const isNew = !inputPosition;

  const isInvalid = !touched || [nameError, mealError, priceError, paidError, tipError]
    .some(b => b !== NO_ERROR);

  const reset = useCallback(() => {
    setTouched(false);

    setName(inputPosition?.name ?? '')
    setMeal(inputPosition?.meal ?? '')
    setPrice(inputPosition?.price)
    setPaid(inputPosition?.paid)
    setTip(inputPosition?.tip)
  }, [inputPosition?.name, inputPosition?.meal, inputPosition?.price, inputPosition?.paid, inputPosition?.tip]);

  useEffect(() => {
    reset()
  }, [inputPosition, reset]);

  const onClickSave = () => {
    if (isInvalid)
      return;

    const newPosition = {
      name: name,
      meal: meal,
      price: price,
      paid: paid,
      tip: tip,
    } as OrderPositionPatch;

    if (isNew) {
      if (canAddNew) {
        onSave(newPosition)
          .then(() => reset())
      }
    } else {
      onUpdate(inputPosition.id, newPosition)
        .then()
    }
  };

  const canFullyEdit = (orderState === OrderStateType.New || orderState === OrderStateType.Open) && ((canAddNew && isNew) || !isNew);
  const canOnlyPartlyEdit = canFullyEdit || (inputPosition && (orderState === OrderStateType.Locked || orderState === OrderStateType.Ordered));
  const canSave = !isInvalid;

  const theme = useTheme();
  const color = (isNew
      ? (touched ? theme.palette.info : {main: 'white'})
      : theme.palette.secondary
  ).main;

  return <Paper sx={{
    padding: '1em',
    border: `2px solid ${color}`,
  }}>
    <Stack direction="row"
           spacing={2}
           justifyContent="center"
           alignItems="start">

      <Stack sx={{height: '40px'}} spacing={1}
             direction="row" justifyContent="center" alignItems="center">
        {isNew
          ? <>
            <AddIcon fontSize="large" color={canAddNew ? "primary" : "disabled"}/>
            <Typography color={canAddNew ? "text.primary" : "text.disabled"}>
              Neue Bestellung
            </Typography>
          </>
          : <>
            <EditIcon fontSize="medium" color="info"/>
            <Typography>
              Bestellung ändern
            </Typography>
          </>
        }
      </Stack>

      <TextField id="order-position-editor-name"
                 size="small"
                 label="Name"
                 disabled={!canFullyEdit}
                 placeholder="Dein Name"
                 value={name}
                 onChange={e => {
                   setName(e.target.value);
                   setTouched(true)
                 }}
                 error={!!nameError.trim()}
                 helperText={nameError}
      />
      <TextField id="order-position-editor-meal"
                 size="small"
                 label="Gericht"
                 placeholder="64 mit Tofu"
                 disabled={!canFullyEdit}
                 value={meal}
                 onChange={e => {
                   setMeal(e.target.value);
                   setTouched(true)
                 }}
                 error={!!mealError.trim()}
                 helperText={mealError}
      />
      <MoneyInputField id="order-position-editor-price"
                       size="small"
                       label="Preis"
                       placeholder="Preis"
                       disabled={!canFullyEdit}
                       disableZero={true}
                       disableNegative={true}
                       value={price}
                       onChange={newValue => {
                         setPrice(newValue);
                         setTouched(true)
                       }}
                       error={!!priceError.trim()}
                       helperText={priceError}
                       sx={{width: '15ch'}}
      />
      <MoneyInputField id="order-position-editor-paid"
                       size="small"
                       label="Bezahlt"
                       placeholder="Bezahlt"
                       disabled={!canOnlyPartlyEdit}
                       disableNegative={true}
                       value={paid}
                       onChange={newValue => {
                         setPaid(newValue);
                         setTouched(true)
                       }}
                       error={!!paidError.trim()}
                       helperText={paidError}
                       sx={{width: '15ch'}}
      />
      <MoneyInputField id="order-position-editor-tip"
                       size="small"
                       label="Trinkgeld"
                       placeholder="Trinkgeld"
                       disabled={!canOnlyPartlyEdit}
                       disableNegative={true}
                       value={tip}
                       onChange={newValue => {
                         setTip(newValue);
                         setTouched(true)
                       }}
                       error={!!tipError.trim()}
                       helperText={tipError}
                       sx={{width: '15ch'}}
      />

      <Stack direction="row">
        <IconButton id="order-position-editor-save"
                    color="success"
                    disabled={!canSave}
                    onClick={onClickSave}>
          <DoneIcon fontSize="inherit"/>
        </IconButton>

        {isNew && <IconButton id="order-position-editor-reset"
                              color="secondary"
                              onClick={reset}
                              disabled={!touched}>
          <UndoIcon fontSize="inherit"/>
        </IconButton>}

        {!isNew && <IconButton id="order-position-editor-close"
                               color="error"
                               onClick={onAbort}>
          <CloseIcon fontSize="inherit"/>
        </IconButton>}
      </Stack>
    </Stack>
  </Paper>;
}
