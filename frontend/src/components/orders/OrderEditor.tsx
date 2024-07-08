import {Order, Restaurant} from "../../../build/generated-ts/api";
import {Box, Paper, Stack, Typography} from "@mui/material";
import {v4 as uuidv4} from 'uuid';
import OrderPositionsTable, {OrderPosition} from "./OrderPositionsTable.tsx";

type OrderEditorProps = {
  restaurant: Restaurant;
  order: Order;
}


export default function OrderEditor({restaurant, order}: OrderEditorProps) {
  const random = (lower: number = 0, upper: number = 1 << 31) => {
    return Math.floor(lower + Math.random() * (upper - lower));
  };

  const randomName = () => {
    const arr = [
      "Anna", "Max", "Erik", "Lisa", "Ben", "Nina", "Paul", "Sophie", "Lukas", "Marie",
      "Julia", "Tim", "Laura", "Tom", "Sarah", "Jan", "Lea", "Jonas", "Mia", "Felix",
      "Emma", "Leon", "Hannah", "Finn", "Clara", "Noah", "Lena", "Elias", "Mila", "Lara",
      "Johannes", "Hanna", "Oscar", "Amy", "David", "Emily", "Leo", "Hanne", "Nick",
      "Ella", "Alex", "Greta", "Markus", "Isabel", "Anton", "Nico", "Jana", "Matthias",
      "Charlotte", "Fabian", "Tina", "Henri", "Leonard", "Kira", "Marlene", "Julius",
      "Lilly", "Kai", "Alina", "Linus", "Dana", "Cedric", "Rosa", "Henry", "Fiona",
      "Tobias", "Teresa", "Viktor", "Zoey", "Marco", "Nele", "Carl", "Romy", "Philipp",
      "Valerie", "Sebastian", "Melina", "Emil", "Felicitas", "Samuel", "Ida", "Marius",
      "Ronja", "Simon", "Katharina", "Bastian", "Helena", "Matthias", "Victoria", "Basti",
      "Stefan", "Miriam", "Dominik", "Lina", "Daniel", "Carla"
    ];

    let n = random(0, arr.length);
    const name = arr[n];
    if (!name)
      console.log("Not name: ", n)
    return name;
  };
  const randomExt = () => {
    const arr = [
      "",
      " mit Tofu",
      " mit Ente",
      " mit Hähnchen",
      " mit Rind",
    ];

    return arr[random(0, arr.length)];
  };

  const orderlines = Array(random(5, 15)).fill(null)
    .map((_, idx) => idx)
    .sort(() => 0.5 - Math.random())
    .map((idx) => {
      const price = random(5, 15);
      const tip = random(0, 5) / 2.0;
      const hasPaid = !!random(0, 2);

      return ({
        id: uuidv4(),
        index: idx,
        name: randomName(),
        meal: random(30, 70) + randomExt(),
        price: price,
        paid: hasPaid ? price + tip : null,
        tip: hasPaid ? tip : null,
      }) as OrderPosition;
    });

  return <Box sx={{minWidth: '860px'}}>
    <Stack spacing={2}>
      <Typography variant="h6">
        Bestellung bei {restaurant.name}
      </Typography>

      <Paper elevation={8} sx={{padding: 1}}>
        <OrderPositionsTable orderPositions={orderlines}/>
      </Paper>
    </Stack>
  </Box>
}
