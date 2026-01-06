import { v4 as uuidv4 } from "uuid";

export class CartItem {
  public readonly id: string;

  constructor(
    public readonly sku: string,
    public quantity: number,
    public unitPrice: number = 0
  ) {
    this.id = uuidv4();
  }
}
