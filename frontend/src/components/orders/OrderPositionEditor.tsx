import {useCallback, useEffect, useMemo, useState} from "react";
import {IconButton, InputAdornment, Paper, Stack, TextField, useTheme} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import UndoIcon from "@mui/icons-material/Undo";
import CloseIcon from '@mui/icons-material/Close';
import {OrderPosition, OrderPositionPatch, OrderStateType} from "../../../build/generated-ts/api";

type OrderPositionEditorProps = {
  orderState: OrderStateType,
  onSave: (pos: OrderPositionPatch) => Promise<void>;
  onUpdate: (id: string, pos: OrderPositionPatch) => Promise<void>;
  onAbort: () => void;
  inputPosition: OrderPosition | null;
};

export default function OrderPositionEditor({
                                              orderState,
                                              onSave,
                                              onUpdate,
                                              onAbort,
                                              inputPosition
                                            }: OrderPositionEditorProps) {
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
      name: name,
      meal: meal,
      price: Number.parseFloat(price),
      paid: Number.parseFloat(paid) || undefined,
      tip: Number.parseFloat(tip) || undefined,
    } as OrderPositionPatch;

    if (isNew)
      onSave(newPosition)
        .then(() => reset())
    else
      onUpdate(inputPosition.id, newPosition)
        .then()
  };

  const canFullyEdit = orderState === OrderStateType.New || orderState === OrderStateType.Open;
  const canOnlyPartlyEdit = canFullyEdit || orderState === OrderStateType.Locked || orderState === OrderStateType.Ordered;

  const theme = useTheme();
  const color = (isNew
      ? (touched ? theme.palette.info : {main: 'white'})
      : theme.palette.secondary
  ).main;

  return <Paper sx={{
    p: 1,
    border: `2px solid ${color}`,
  }}>
    <Stack direction="row"
           spacing={2}
           justifyContent="space-between"
           alignItems="baseline">
      <TextField size="small"
                 label="Name"
                 disabled={!canFullyEdit}
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
                 disabled={!canFullyEdit}
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
                 disabled={!canFullyEdit}
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
                 disabled={!canOnlyPartlyEdit}
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
                 disabled={!canOnlyPartlyEdit}
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

        {isNew && <IconButton size="small" color="secondary" onClick={reset} disabled={!touched}>
          <UndoIcon fontSize="inherit"/>
        </IconButton>}

        {!isNew && <IconButton size="small" color="error" onClick={onAbort}>
          <CloseIcon fontSize="inherit"/>
        </IconButton>}
      </Stack>
    </Stack>
  </Paper>;
}
