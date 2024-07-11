import {Button, Card, CardActions, CardContent, Stack, Typography} from "@mui/material";
import {styled as muiStyled} from "@mui/material/styles";
import {Order, Restaurant} from "../../../build/generated-ts/api";
import useOrderPositionSummary from "./useOrderPositionSummary.ts";
import {formatMonetaryAmount} from "../../utils/moneyUtils.ts";

type OrderCardProps = {
  selected: boolean;
  order: Order;
  restaurant?: Restaurant;
  onSelect: () => void;
};

export default function OrderCard({selected, order, restaurant, onSelect}: OrderCardProps) {
  const summary = useOrderPositionSummary(order);

  return <SOrderCard elevation={8} isSelected={selected}>
    <CardContent>
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
        <Typography variant="overline" gutterBottom color="text.secondary">
          {order.date}
        </Typography>

        <Typography variant="overline" gutterBottom color="text.secondary">
          {order.orderState}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2}>
        <Typography gutterBottom variant="h5" component="div">
          {restaurant?.name}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="space-between" flexWrap="wrap">
        <Typography variant="caption" color="text.secondary">
          {summary.participants} Teilnehmer
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {summary.count} Gerichte
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Summe: {formatMonetaryAmount(summary.price)}
        </Typography>

        {
          summary.paidMissing !== 0
            ? <Typography variant="caption" color="error">
              Nicht bezahlt: {formatMonetaryAmount(summary.paidMissing)}
            </Typography>
            : <Typography variant="caption" color="success">
              Alles bezahlt
            </Typography>
        }
      </Stack>
    </CardContent>

    <CardActions sx={{paddingX: '1em', display: "flex", justifyContent: "flex-end"}}>
      <Button size="small"
              color="primary"
              disabled={selected}
              onClick={onSelect}>
        Anzeigen
      </Button>
    </CardActions>
  </SOrderCard>
}

const SOrderCard = muiStyled(Card, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})(({theme, isSelected}) => ({
  maxWidth: 345,
  margin: 'auto',
  boxShadow: theme.shadows[8],
  border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
  borderRadius: theme.shape.borderRadius,
}));
