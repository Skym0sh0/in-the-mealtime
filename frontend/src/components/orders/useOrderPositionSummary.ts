import {useMemo} from "react";

import {Order, OrderPosition} from "../../../build/generated-ts/api/api.ts";

export default function useOrderPositionSummary(order: Order) {
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
    };
  }, [order.orderPositions])
}
