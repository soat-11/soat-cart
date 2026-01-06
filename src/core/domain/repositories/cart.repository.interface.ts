import { Cart } from "../entities/cart.entity";

export interface ICartRepository {
  findBySessionId(sessionId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
  delete(sessionId: string): Promise<void>;
}
