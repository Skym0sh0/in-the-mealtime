import {Order, Restaurant} from "../../../build/generated-ts/api";
import {Box, Paper, Stack, Typography} from "@mui/material";
import {v4 as uuidv4} from 'uuid';
import OrderPositionsTable, {OrderPosition} from "./OrderPositionsTable.tsx";
import {useCallback, useState} from "react";
import OrderPositionEditor from "./OrderPositionEditor.tsx";
import OrderSummary from "./OrderSummary.tsx";

type OrderEditorProps = {
  restaurant: Restaurant;
  order: Order;
}

function generateOrderPositions(): OrderPosition[] {
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

  return Array(random(1, 5)).fill(null)
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
}

export default function OrderEditor({restaurant}: OrderEditorProps) {
  const [orderPositions, setOrderPositions] = useState<OrderPosition[]>(() => generateOrderPositions());

  const [selectedPosition, setSelectedPosition] = useState<OrderPosition | null>(null);

  const onCreatePosition: (position: OrderPosition) => Promise<void> = useCallback((position: OrderPosition) => {
    setOrderPositions(prev => [...prev, position])
    return new Promise(resolve => resolve())
  }, []);
  const onUpdatePosition: (position: OrderPosition) => Promise<void> = useCallback((position: OrderPosition) => {
    setOrderPositions(prev => [...prev.filter(p => p.id !== position.id), position])
    setSelectedPosition(null)
    return new Promise(resolve => resolve())
  }, []);

  const onDeletePosition = useCallback((position: OrderPosition) => {
    setOrderPositions(prev => [...prev.filter(p => p.id !== position.id)])
  }, []);

  const onSelectToEditPosition = useCallback((position: OrderPosition) => {
    setSelectedPosition(position)
  }, []);

  return <Box sx={{minWidth: '860px'}}>
    <Stack spacing={2}>
      <Typography variant="h6">
        Bestellung bei {restaurant.name}
      </Typography>

      <Paper elevation={8} sx={{padding: 1}}>
        <Stack spacing={2}>
          <OrderSummary orderPositions={orderPositions}/>

          <OrderPositionsTable orderPositions={orderPositions}
                               selectedPosition={selectedPosition}
                               onSelect={onSelectToEditPosition}
                               onDelete={onDeletePosition}/>

          <OrderPositionEditor
            onSave={onCreatePosition}
            onUpdate={onUpdatePosition}
            inputPosition={selectedPosition}/>
        </Stack>
      </Paper>
    </Stack>
  </Box>
}
