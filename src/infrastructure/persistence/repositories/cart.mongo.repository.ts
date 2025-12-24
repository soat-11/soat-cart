import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart } from "@core/domain/entities/cart.entity";
import { CartSchema } from "../schemas/cart.schema";
import { ICartRepository } from "@core/domain/repositories/cart.repository.interface";

@Injectable()
export class CartMongoRepository implements ICartRepository {
  constructor(
    @InjectRepository(CartSchema)
    private readonly repository: Repository<CartSchema>
  ) {}

  public async findBySessionId(sessionId: string): Promise<Cart | null> {
    const data = await this.repository.findOne({ where: { sessionId } });

    if (!data) {
      return null;
    }

    return Cart.fromPersistence(data.sessionId, {
      items: data.items,
    });
  }

  public async save(cart: Cart): Promise<void> {
    const existing = await this.repository.findOne({
      where: { sessionId: cart.sessionId },
    });

    const itemsToSave = cart.getItems().map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    if (existing) {
      await this.repository.update(existing._id, {
        items: itemsToSave,
      });
    } else {
      const newDocument = this.repository.create({
        sessionId: cart.sessionId,
        items: itemsToSave,
      });
      await this.repository.save(newDocument);
    }
  }

  public async delete(sessionId: string): Promise<void> {
    await this.repository.delete({ sessionId });
  }
}
