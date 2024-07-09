import {Order, OrderInfos} from "../../../build/generated-ts/api";
import {Divider, Link, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import {debounce} from 'lodash';
import {useCallback, useEffect, useMemo, useState} from "react";
import {DateTime} from "luxon";
import {TimeField} from "@mui/x-date-pickers";
import {api} from "../../api/api.ts";
import {OrderMoneyCollectionType} from "../../../build/generated-ts/api/api.ts";

export default function OrderInfosView({order, onUpdateInfos}: { order: Order, onUpdateInfos: () => void, }) {
  const [touched, setTouched] = useState(false);

  const [orderer, setOrderer] = useState('');
  const [fetcher, setFetcher] = useState('');
  const [collectorType, setCollectorType] = useState<OrderMoneyCollectionType>(OrderMoneyCollectionType.Bar);
  const [collector, setCollector] = useState('');
  const [orderClosingTime, setOrderClosingTime] = useState<DateTime | null>(DateTime.fromISO('11:45'));

  useEffect(() => {
    setOrderer(order.infos.orderer ?? '')
    setFetcher(order.infos.fetcher ?? '')
    setCollectorType(order.infos.moneyCollectionType ?? OrderMoneyCollectionType.Bar)
    setCollector(order.infos.moneyCollector ?? '')
    setOrderClosingTime(order.infos.orderClosingTime ? DateTime.fromISO(order.infos.orderClosingTime) : DateTime.fromISO('11:45'))
  }, [order.infos.orderer, order.infos.fetcher, order.infos.moneyCollectionType, order.infos.moneyCollector, order.infos.orderClosingTime]);

  const onUpdate = useCallback(debounce((infos: OrderInfos) => {
    api.orders.setOrderInfo(order.id, infos)
      .then(() => onUpdateInfos())
  }, 500), [order.id, onUpdateInfos])

  useEffect(() => {
    if (!touched)
      return

    onUpdate({
      orderer: orderer,
      fetcher: fetcher,
      moneyCollectionType: collectorType,
      moneyCollector: collector,
      orderClosingTime: orderClosingTime?.toLocaleString(DateTime.TIME_24_WITH_SECONDS)
    } as OrderInfos)
  }, [touched, orderer, fetcher, collector, orderClosingTime]);

  const onChange = () => setTouched(true);

  const paypalLink = useMemo(() => {
    if (collectorType === OrderMoneyCollectionType.PayPal && !!collector) {
      if (collector.toLowerCase().startsWith("http"))
        return collector;
      else
        return "http://" + collector;
    }
    return null
  }, [collectorType, collector]);

  useEffect(() => {
    if (collector.toLowerCase().includes("paypal"))
      setCollectorType(OrderMoneyCollectionType.PayPal)
  }, [collector]);

  return <Paper elevation={2} sx={{p: 1}}>
    <Typography variant="h6">
      Infos
    </Typography>

    <Divider/>

    <Stack spacing={2} alignItems="center">
      <TextField size="small"
                 label="Wer bestellt?"
                 value={orderer}
                 onChange={e => {
                   setOrderer(e.target.value)
                   onChange();
                 }}
                 error={!orderer}
      />
      <TextField size="small"
                 label="Wer holt ab?"
                 value={fetcher}
                 onChange={e => {
                   setFetcher(e.target.value)
                   onChange();
                 }}
                 error={!fetcher}
      />

      <ToggleButtonGroup size="small"
                         exclusive={true}
                         value={collectorType}
                         onChange={(_, val) => val !== null && setCollectorType(val)}>
        {
          Object.keys(OrderMoneyCollectionType)
            .map(key => {
              return <ToggleButton key={key} value={key}>
                {key}
              </ToggleButton>
            })
        }
      </ToggleButtonGroup>

      <TextField size="small"
                 label="Geld wohin?"
                 value={collector}
                 onChange={e => {
                   setCollector(e.target.value)
                   onChange();
                 }}
                 helperText={
                   paypalLink
                     ? <Link target="_blank"
                             rel="noopener noreferrer"
                             href={paypalLink}>
                       {collector}
                     </Link>
                     : undefined
                 }
                 error={!collector}/>

      <TimeField size="small"
                 ampm={false}
                 label="Bestellschluss"
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
    </Stack>
  </Paper>
}