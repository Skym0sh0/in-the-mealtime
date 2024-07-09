import {OrderPosition} from "./OrderPositionsTable.tsx";
import {useCallback, useEffect, useMemo, useState} from "react";
import {v4 as uuidv4} from "uuid";
import {IconButton, InputAdornment, Stack, TextField} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import UndoIcon from "@mui/icons-material/Undo";
import CloseIcon from '@mui/icons-material/Close';

type OrderPositionEditorProps = {
  onSave: (pos: OrderPosition) => Promise<void>;
  onUpdate: (pos: OrderPosition) => Promise<void>;
  inputPosition: OrderPosition | null;
};

export default function OrderPositionEditor({onSave, onUpdate, inputPosition}: OrderPositionEditorProps) {
  const [touched, setTouched] = useState(false);

  const [name, setName] = useState('');
  const [meal, setMeal] = useState('');
  const [price, setPrice] = useState('');
  const [paid, setPaid] = useState('');
  const [tip, setTip] = useState('');

  const nameError = useMemo(() => {
    return touched && !name ? "Name fehlt" : undefined;
  }, [name, touched]);
  const mealError = useMemo(() => {
    return touched && !meal ? "Gericht fehlt" : undefined;
  }, [meal, touched]);
  const priceError = useMemo(() => {
    return touched && (!price || Number.isNaN(Number.parseFloat(price))) ? "Preis fehlerhaft" : undefined;
  }, [price, touched]);
  const paidError = useMemo(() => {
    if (!paid)
      return undefined

    const amount = Number.parseFloat(paid);
    if (Number.isNaN(amount))
      return "Bezahlung fehlerhaft"

    if (amount < Number.parseFloat(price))
      return "Zu wenig bezahlt";

    return undefined
  }, [paid, price]);
  const tipError = useMemo(() => {
    if (!tip)
      return undefined

    const amount = Number.parseFloat(tip);
    if (Number.isNaN(amount))
      return "Tip fehlerhaft"

    if (amount > (Number.parseFloat(paid) - Number.parseFloat(price)))
      return "Zu viel Trinkgeld"

    return undefined
  }, [tip, paid, price]);

  const isNew = !inputPosition;

  const isInvalid = !touched || [nameError, mealError, priceError, paidError, tipError]
    .some(b => b !== undefined);

  const reset = useCallback(() => {
    setTouched(false);

    setName(inputPosition?.name ?? '')
    setMeal(inputPosition?.meal ?? '')
    setPrice(inputPosition?.price?.toString() ?? '')
    setPaid(inputPosition?.paid?.toString() ?? '')
    setTip(inputPosition?.tip?.toString() ?? '')
  }, [inputPosition?.name, inputPosition?.meal, inputPosition?.price, inputPosition?.paid, inputPosition?.tip]);

  useEffect(() => {
    reset()
  }, [inputPosition]);

  const onClickSave = () => {
    if (isInvalid)
      return;

    const newPosition = {
      id: inputPosition?.id ?? uuidv4(),
      name: name,
      meal: meal,
      price: Number.parseFloat(price),
      paid: Number.parseFloat(paid) || undefined,
      tip: Number.parseFloat(tip) || undefined,
    };


    if (isNew)
      onSave(newPosition)
        .then(() => reset())
    else
      onUpdate(newPosition)
        .then()
  };

  return <Stack direction="row"
                spacing={2}
                justifyContent="space-between"
                alignItems="baseline">
    <TextField size="small"
               label="Name"
               placeholder="Dein Name"
               value={name}
               onChange={e => {
                 setName(e.target.value);
                 setTouched(true)
               }}
               error={!!nameError}
               helperText={nameError}
    />
    <TextField size="small"
               label="Gericht"
               placeholder="64 mit Tofu"
               value={meal}
               onChange={e => {
                 setMeal(e.target.value);
                 setTouched(true)
               }}
               error={!!mealError}
               helperText={mealError}
    />
    <TextField size="small"
               type="number"
               label="Preis"
               placeholder="Preis"
               value={price}
               onChange={e => {
                 setPrice(e.target.value);
                 setTouched(true)
               }}
               error={!!priceError}
               helperText={priceError}
               sx={{width: '15ch'}}
               InputProps={{
                 startAdornment: <InputAdornment position="start">€</InputAdornment>
               }}
    />
    <TextField size="small"
               type="number"
               label="Bezahlt"
               placeholder="Bezahlt"
               value={paid}
               onChange={e => {
                 setPaid(e.target.value);
                 setTouched(true)
               }}
               error={!!paidError}
               helperText={paidError}
               sx={{width: '15ch'}}
               InputProps={{
                 startAdornment: <InputAdornment position="start">€</InputAdornment>
               }}
    />
    <TextField size="small"
               type="number"
               label="Trinkgeld"
               placeholder="Trinkgeld"
               value={tip}
               onChange={e => {
                 setTip(e.target.value);
                 setTouched(true)
               }}
               error={!!tipError}
               helperText={tipError}
               sx={{width: '15ch'}}
               InputProps={{
                 startAdornment: <InputAdornment position="start">€</InputAdornment>
               }}
    />

    <Stack direction="row">
      <IconButton size="small"
                  color="success"
                  disabled={isInvalid}
                  onClick={onClickSave}>
        <DoneIcon fontSize="inherit"/>
      </IconButton>

      {isNew && <IconButton size="small" color="secondary" onClick={reset}>
        <UndoIcon fontSize="inherit"/>
      </IconButton>}

      {!isNew && <IconButton size="small" color="error">
        <CloseIcon fontSize="inherit"/>
      </IconButton>}
    </Stack>
  </Stack>;
}
