import {Order, OrderInfosPatch} from "../../../../build/generated-ts/api";
import {Link, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import {debounce} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from "react";
import {DateTime} from "luxon";
import {TimeField} from "@mui/x-date-pickers";
import {OrderMoneyCollectionType, OrderStateType} from "../../../../build/generated-ts/api/api.ts";
import {useApiAccess} from "../../../utils/ApiAccessContext.tsx";
import {assertNever} from "../../../utils/utils.ts";
import {useNotification} from "../../../utils/NotificationContext.tsx";
import MoneyInputField from "./MoneyInputField.tsx";

export default function OrderInfosView({order, onUpdateInfos}: { order: Order, onUpdateInfos: () => void, }) {
  const {orderApi} = useApiAccess();
  const {notifyError, notifySuccess} = useNotification();

  const [touched, setTouched] = useState(false);

  const [orderer, setOrderer] = useState('');
  const [fetcher, setFetcher] = useState('');
  const [collectorType, setCollectorType] = useState<OrderMoneyCollectionType>(OrderMoneyCollectionType.Bar);
  const [collector, setCollector] = useState('');
  const [orderClosingTime, setOrderClosingTime] = useState<DateTime | null>(DateTime.fromISO('11:30'));
  const [orderText, setOrderText] = useState('');
  const [maximumMeals, setMaximumMeals] = useState('');
  const [orderFee, setOrderFee] = useState<number | undefined>(undefined);

  useEffect(() => {
    setOrderer(order.infos.orderer ?? '')
    setFetcher(order.infos.fetcher ?? '')
    setCollectorType(order.infos.moneyCollectionType ?? OrderMoneyCollectionType.Bar)
    setCollector(order.infos.moneyCollector ?? '')
    setOrderClosingTime(order.infos.orderClosingTime ? DateTime.fromISO(order.infos.orderClosingTime) : DateTime.fromISO('11:30'))
    setOrderText(order.infos.orderText ?? '')
    setMaximumMeals(order.infos.maximumMealCount?.toString() ?? '')
    setOrderFee(order.infos.orderFee)
  }, [order.infos.orderer, order.infos.fetcher, order.infos.moneyCollectionType, order.infos.moneyCollector, order.infos.orderClosingTime, order.infos.orderText, order.infos.maximumMealCount, order.infos.orderFee]);

  const isMaximumMealsValid = useMemo(() => {
    if (!maximumMeals)
      return true;

    const parsed = Number.parseInt(maximumMeals)
    if (Number.isNaN(parsed))
      return false

    return 1 < parsed && order.orderPositions.length <= parsed;
  }, [maximumMeals, order.orderPositions.length]);

  const isFeeValid = useMemo(() => {
    if (!orderFee)
      return true;

    return 0 <= orderFee;
  }, [orderFee]);

  const isValid = useMemo(() => {
    return isMaximumMealsValid && isFeeValid;
  }, [isFeeValid, isMaximumMealsValid])

  const isEditable = order.orderState === OrderStateType.New || order.orderState === OrderStateType.Open;

  const onUpdate = useCallback(debounce((infos: OrderInfosPatch) => {
    orderApi.setOrderInfo(order.id, order.version, infos)
      .then(() => notifySuccess("Infos erfolgreich gespeichert"))
      .then(() => onUpdateInfos())
      .then(() => setTouched(false))
      .catch(e => notifyError("Infos konnten nicht gespeichert werden", e))
  }, 2000), [order.id, order.version, onUpdateInfos, orderApi, notifyError, notifySuccess])

  useEffect(() => {
    if (!touched || !isValid || !isEditable)
      return

    onUpdate({
      orderer: orderer,
      fetcher: fetcher,
      moneyCollectionType: collectorType,
      moneyCollector: collector,
      orderClosingTime: orderClosingTime?.toISOTime({includeOffset: false, suppressMilliseconds: true}),
      orderText: orderText,
      maximumMealCount: Number.parseInt(maximumMeals),
      orderFee: orderFee,
    } as OrderInfosPatch)
  }, [isValid, touched, orderer, fetcher, collector, collectorType, orderClosingTime, orderText, maximumMeals, onUpdate, isEditable, orderFee]);

  useEffect(() => {
    if (collector.toLowerCase().includes("paypal"))
      setCollectorType(OrderMoneyCollectionType.PayPal)
  }, [collector]);

  const onChange = () => setTouched(true);

  return <Stack direction="column" spacing={2} justifyContent="flex-start" alignItems="center">
    <Typography variant="h6">
      Infos {touched && '*'}
    </Typography>

    <Stack spacing={2} alignItems="center">
      <TextField id="order-info-orderer"
                 size="small"
                 fullWidth={true}
                 label="Wer bestellt?"
                 disabled={!isEditable}
                 value={orderer}
                 onChange={e => {
                   setOrderer(e.target.value)
                   onChange();
                 }}
                 error={!orderer}
      />
      <TextField id="order-info-fetcher"
                 size="small"
                 fullWidth={true}
                 label="Wer holt ab?"
                 disabled={!isEditable}
                 value={fetcher}
                 onChange={e => {
                   setFetcher(e.target.value)
                   onChange();
                 }}
                 error={!fetcher}
      />

      <TextField id="order-info-money-collector"
                 size="small"
                 fullWidth={true}
                 label="Geld wohin?"
                 disabled={!isEditable}
                 value={collector}
                 onChange={e => {
                   setCollector(e.target.value)
                   onChange();
                 }}
                 helperText={<PaypalLink collector={collector} type={collectorType}/>}
                 error={!collector}/>

      <ToggleButtonGroup id="order-info-money-collection-type"
                         size="small"
                         disabled={!isEditable}
                         exclusive={true}
                         value={collectorType}
                         onChange={(_, val) => val !== null && setCollectorType(val)}>
        {
          Object.keys(OrderMoneyCollectionType)
            .map(key => {
              return <ToggleButton key={key}
                                   value={key}
                                   id={`order-info-money-collection-type-${key}`}>
                {key}
              </ToggleButton>
            })
        }
      </ToggleButtonGroup>

      <TimeField id="order-info-closing-time"
                 size="small"
                 fullWidth={true}
                 ampm={false}
                 label="Bestellschluss"
                 disabled={!isEditable}
                 value={orderClosingTime}
                 slotProps={{
                   textField: {
                     error: !orderClosingTime || !orderClosingTime.isValid
                   }
                 }}
                 onChange={e => {
                   setOrderClosingTime(e)
                   onChange();
                 }}/>

      <MoneyInputField id="order-info-order-fee"
                       size="small"
                       fullWidth={true}
                       label="Bestellkosten"
                       disabled={!isEditable}
                       disableNegative={true}
                       value={orderFee}
                       onChange={newValue => {
                         setOrderFee(newValue)
                         onChange();
                       }}
                       error={!isFeeValid}/>

      <TextField id="order-info-maximum-meals"
                 size="small"
                 fullWidth={true}
                 type="number"
                 label="Limitierung Gerichte"
                 disabled={!isEditable}
                 value={maximumMeals}
                 onChange={e => {
                   setMaximumMeals(e.target.value)
                   onChange();
                 }}
                 error={!isMaximumMealsValid}/>

      <TextField id="order-info-additional-text"
                 size="small"
                 fullWidth={true}
                 sx={{width: '100%'}}
                 label="Zusatztext"
                 disabled={!isEditable}
                 multiline={true}
                 maxRows={3}
                 value={orderText}
                 onChange={e => {
                   setOrderText(e.target.value)
                   onChange();
                 }}/>
    </Stack>
  </Stack>;
}

function PaypalLink({type, collector}: { type: OrderMoneyCollectionType, collector: string }) {
  if (!type || type === OrderMoneyCollectionType.Bar)
    return null;

  if (type !== OrderMoneyCollectionType.PayPal)
    throw assertNever(type);

  const link = collector.toLowerCase().startsWith("http") ? collector : `http://${collector}`

  return <Link target="_blank"
               rel="noopener noreferrer"
               href={link}>
    {collector}
  </Link>
}
