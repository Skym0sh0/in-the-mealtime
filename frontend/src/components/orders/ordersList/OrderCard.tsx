import {Button, Card, CardActionArea, CardActions, CardContent, Stack, Typography} from "@mui/material";
import {styled as muiStyled} from "@mui/material/styles";
import {Order, Restaurant} from "../../../../build/generated-ts/api";
import useOrderPositionSummary, {OrderSummaryType} from "../useOrderPositionSummary.ts";
import {formatMonetaryAmount} from "../../../utils/moneyUtils.ts";
import OrderState from "../OrderState.tsx";
import RestaurantAvatar from "../../restaurant/RestaurantAvatar.tsx";

type OrderCardProps = {
  selected: boolean;
  order: Order;
  restaurant?: Restaurant;
  onSelect: () => void;
};

function SummaryDescription({summary}: { summary: OrderSummaryType }) {
  if (!summary.count)
    return null;

  if (!summary.paidMissing)
    return <Typography variant="caption" color="success">
      Alles bezahlt
    </Typography>

  return <Typography variant="caption" color="error">
    Nicht bezahlt: {formatMonetaryAmount(summary.paidMissing)}
  </Typography>
}

export default function OrderCard({selected, order, restaurant, onSelect}: OrderCardProps) {
  const summary = useOrderPositionSummary(order);

  return <SOrderCard elevation={8} isSelected={selected}>
    <CardActionArea component="div" onClick={onSelect} disabled={selected}>
      <CardContent sx={{paddingBottom: 0}}>
        <Stack direction="column">
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Typography variant="overline" gutterBottom color="text.secondary">
              {order.date}
            </Typography>

            <OrderState order={order}/>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Typography gutterBottom variant="h5" component="div">
              {restaurant?.name}
            </Typography>

            {restaurant && <RestaurantAvatar restaurant={restaurant} size="small"/>}
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
          </Stack>

          <SummaryDescription summary={summary}/>
        </Stack>
      </CardContent>

      <CardActions sx={{paddingX: '1em', paddingTop: 0, display: "flex", justifyContent: "flex-end"}}>
        <Button size="small"
                color="primary"
                disabled={selected}
                onClick={onSelect}>
          Anzeigen
        </Button>
      </CardActions>
    </CardActionArea>
  </SOrderCard>
}

const SOrderCard = muiStyled(Card, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})(({theme, isSelected}) => ({
  width: '100%',
  margin: 'auto',
  boxShadow: theme.shadows[8],
  border: isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
  borderRadius: theme.shape.borderRadius,
}));
