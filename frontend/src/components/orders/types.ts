import {Restaurant} from "../../../build/generated-ts/api";

export type RestaurantOrderable = Restaurant & {
  orderable: boolean,
};
