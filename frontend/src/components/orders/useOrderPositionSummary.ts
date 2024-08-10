import {useMemo} from "react";

import {Order, OrderPosition} from "../../../build/generated-ts/api/api.ts";

export interface OrderSummaryType {
  participants: number;

  count: number;
  price: number;
  paid: number;
  tip: number;

  countMissing: number;
  paidMissing: number;
  changeMoney: number;
}

export default function useOrderPositionSummary(order: Order): OrderSummaryType {
  return useMemo(() => {
    const add = (mapper: (pos: OrderPosition) => number, filter: (pos: OrderPosition) => boolean = () => true) => {
      return order.orderPositions.filter(filter)
        .map(mapper)
        .reduce((agg, cur) => agg + cur, 0)
    };

    return {
      participants: new Set(order.orderPositions.map(s => s.name)).size,
      count: order.orderPositions.length,
      price: add(l => l.price),
      paid: add(l => l.paid ?? 0),
      tip: add(l => l.tip ?? 0),

      countMissing: order.orderPositions.filter(pos => !pos.paid).length,
      paidMissing: add(pos => pos.price, pos => !pos.paid),
      changeMoney: add(pos => pos.paid ? pos.paid - pos.price - (pos.tip ?? 0) : 0),
    };
  }, [order.orderPositions])
}
