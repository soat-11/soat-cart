import { CartItem } from "./cart-item.entity";

export class Cart {
  private items: CartItem[] = [];

  constructor(public readonly sessionId: string) {}

  public addOrUpdateItem(newItem: CartItem): void {
    const existing = this.items.find((item) => item.sku === newItem.sku);

    if (!existing) {
      if (newItem.unitPrice === 0) {
        throw new Error("Preço obrigatório ao adicionar um novo item");
      }
      this.items.push(newItem);
      return;
    }

    existing.quantity = newItem.quantity;
    if (newItem.unitPrice > 0) {
      existing.unitPrice = newItem.unitPrice;
    }
  }

  public static fromPersistence(
    sessionId: string,
    data: { items: any[] }
  ): Cart {
    const cart = new Cart(sessionId);
    cart.items = data.items.map(
      (i) => new CartItem(i.sku, i.quantity, i.unitPrice)
    );
    return cart;
  }

  public getItems(): CartItem[] {
    return [...this.items];
  }

  public getTotal(): { quantity: number; subtotal: number } {
    const quantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = this.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    return { quantity, subtotal };
  }

  public removeItem(sku: string): void {
    const index = this.items.findIndex((item) => item.sku === sku);
    if (index === -1) {
      throw new Error("Item não encontrado no carrinho");
    }

    this.items.splice(index, 1);
  }
}
