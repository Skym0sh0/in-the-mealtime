import {Button, Card, CardActions, CardContent, Stack, Typography} from "@mui/material";
import {styled as muiStyled} from "@mui/material/styles";
import {Order, Restaurant} from "../../../build/generated-ts/api";

type OrderCardProps = {
  selected: boolean;
  order: Order;
  restaurant?: Restaurant;
  onSelect: () => void;
};

export default function OrderCard({selected, order, restaurant, onSelect}: OrderCardProps) {
  return <SOrderCard elevation={8} isSelected={selected}>
    <CardContent>
      <Typography variant="overline" gutterBottom color="text.secondary">
        {order.date}
      </Typography>

      <Stack direction="row" spacing={2}>
        <Typography gutterBottom variant="h5" component="div">
          {restaurant?.name}
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Teilnehmer: 5
        Gerichte: 7
        Volumen: 74€
      </Typography>
    </CardContent>

    <CardActions sx={{paddingX: '1em', display: "flex", justifyContent: "flex-end"}}>
      <Button size="small" color="primary" onClick={onSelect}>
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
