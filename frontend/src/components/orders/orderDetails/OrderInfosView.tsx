import {Order, OrderInfosPatch} from "../../../../build/generated-ts/api";
import {Link, Stack, TextField, Tooltip, Typography} from "@mui/material";
import {debounce} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from "react";
import {DateTime} from "luxon";
import {TimeField} from "@mui/x-date-pickers";
import {OrderMoneyCollectionType, OrderStateType} from "../../../../build/generated-ts/api/api.ts";
import {useApiAccess} from "../../../utils/ApiAccessContext.tsx";
import {useNotification} from "../../../utils/NotificationContext.tsx";
import MoneyInputField from "./MoneyInputField.tsx";
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
export default function OrderInfosView({order, onUpdateInfos}: { order: Order, onUpdateInfos: () => void, }) {
  const {orderApi} = useApiAccess();
  const {notifyError, notifySuccess} = useNotification();

  const [touched, setTouched] = useState(false);

  const [orderer, setOrderer] = useState('');
  const [fetcher, setFetcher] = useState('');
  const [collector, setCollector] = useState('');
  const [orderClosingTime, setOrderClosingTime] = useState<DateTime | null>(DateTime.fromISO('11:30'));
  const [orderText, setOrderText] = useState('');
  const [maximumMeals, setMaximumMeals] = useState('');
  const [orderFee, setOrderFee] = useState<number | undefined>(undefined);

  useEffect(() => {
    setOrderer(order.infos.orderer ?? '')
    setFetcher(order.infos.fetcher ?? '')
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
      orderer: orderer.trim(),
      fetcher: fetcher.trim(),
      moneyCollectionType: collector.toLowerCase().includes("paypal") ? OrderMoneyCollectionType.PayPal : OrderMoneyCollectionType.Bar,
      moneyCollector: collector.trim(),
      orderClosingTime: orderClosingTime?.toISOTime({includeOffset: false, suppressMilliseconds: true}),
      orderText: orderText.trim(),
      maximumMealCount: Number.parseInt(maximumMeals),
      orderFee: orderFee,
    } as OrderInfosPatch)
  }, [isValid, touched, orderer, fetcher, collector, orderClosingTime, orderText, maximumMeals, onUpdate, isEditable, orderFee]);

  const onChange = () => setTouched(true);

  return <Stack direction="column" spacing={2} justifyContent="flex-start" alignItems="center">
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{width: '100%'}}>
      <div/>

      <Typography variant="h6">
        Infos
      </Typography>

      <div style={{width: '3ch'}}>
        {touched &&
          <Tooltip title="Es gibt Änderungen, die gleich gespeichert werden.">
            <TrackChangesIcon fontSize="small" color="warning"/>
          </Tooltip>
        }
      </div>
    </Stack>

    <Stack spacing={2} alignItems="center">
      <TextField id="order-info-orderer"
                 size="small"
                 fullWidth={true}
                 label="Wer bestellt?"
                 title="Diese Person erklärt sich bereit, zur gegebenen Zeit beim Restaurant, Lieferdienst oder Onlineshop die Bestellung aufzugeben."
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
                 title="Diese Person erklärt sich bereit die Bestellung entweder abzuholen oder, bei Lieferung, in Empfang zu nehmen."
                 disabled={!isEditable}
                 value={fetcher}
                 onChange={e => {
                   setFetcher(e.target.value)
                   onChange();
                 }}
                 error={!fetcher}
      />

      <Stack justifyContent="center" alignItems="center">
        <TextField id="order-info-money-collector"
                   size="small"
                   fullWidth={true}
                   label="Geld wohin?"
                   title="Diese Person sammelt das Geld,entweder in Bar oder per Paypal, ein und sorgt dafür, dass die Bestellung bezahlt wird."
                   disabled={!isEditable}
                   value={collector}
                   onChange={e => {
                     setCollector(e.target.value)
                     onChange();
                   }}
                   helperText={<PaypalLink collector={collector}/>}
                   error={!collector}/>
      </Stack>

      <TimeField id="order-info-closing-time"
                 size="small"
                 fullWidth={true}
                 ampm={false}
                 label="Bestellschluss"
                 title="Um diese Uhrzeit wird die bestellende Person die Bestellung aufgeben und somit keine weiteren WÜnsche mehr berücksichtigen."
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
                       title="Das sind die Kosten für die Bestellung. Diese Kosten werden von allen Trinkgeldern bezahlt. Sie müssen zum Bestellen bezahlt worden sein."
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
                 title="Hiermit wird entschieden, wie viele Gerichte in dieser Bestellung sein dürfen. Dies kann zum Beispiel als Grund haben, dass die abholende Person nicht mehr als diese Anzahl tragen kann."
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
                 title="Dies ist eine zusätzliche Information an diese Bestellung wie beispielsweise, dass nur bestimmte Gerichte erlaubt sind"
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

function PaypalLink({collector}: { collector: string }) {
  if (!collector)
    return null;

  if (!collector.toLowerCase().includes("paypal"))
    return "Barzahlung";

  const link = collector.toLowerCase().startsWith("http") ? collector : `http://${collector}`

  return <Link title="Paypal Link"
               target="_blank"
               rel="noopener noreferrer"
               href={link}>
    {collector}
  </Link>
}
