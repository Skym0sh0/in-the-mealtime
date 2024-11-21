import {Restaurant} from "../../../../build/generated-ts/api";

export default function NewOrder({restaurant}: { restaurant: Restaurant }) {
  return <div>
    New order for {restaurant.name} !!!!
  </div>
}
