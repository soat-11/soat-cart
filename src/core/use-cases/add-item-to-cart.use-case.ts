import { Injectable, Inject } from "@nestjs/common";
import { Result } from "@shared/result";
import { CartOutputDto } from "@infra/http/dtos/cart-output.dto";
import { AddItemToCartDto } from "@infra/http/dtos/add-item-to-cart.dto";
import { ICartRepository } from "@core/domain/repositories/cart.repository.interface";
import { IProductRepository } from "@infra/persistence/repositories/product.mongo.repository";
import { Cart } from "@core/domain/entities/cart.entity";
import { CartItem } from "@core/domain/entities/cart-item.entity";

@Injectable()
export class AddItemToCartUseCase {
  constructor(
    @Inject("ICartRepository")
    private readonly cartRepository: ICartRepository,
    @Inject("IProductRepository")
    private readonly productRepository: IProductRepository
  ) {}

  public async execute(
    sessionId: string,
    dto: AddItemToCartDto
  ): Promise<Result<CartOutputDto>> {
    if (!sessionId) {
      return Result.fail("Sessão inválida ou ausente");
    }

    const productValidation = await this.productRepository.findById(dto.sku);

    if (productValidation.isFailure || !productValidation.getValue()) {
      return Result.fail(`Produto ${dto.sku} não existe`);
    }

    let cart = await this.cartRepository.findBySessionId(sessionId);

    if (!cart) {
      cart = new Cart(sessionId);
    }

    try {
      const item = new CartItem(dto.sku, dto.quantity, dto.unitPrice || 0);
      cart.addOrUpdateItem(item);

      await this.cartRepository.save(cart);

      const totals = cart.getTotal();

      return Result.ok({
        sessionId: cart.sessionId,
        items: cart.getItems().map((i) => ({
          sku: i.sku,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        totalItems: totals.quantity,
        totalValue: totals.subtotal,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return Result.fail(error.message);
      }

      return Result.fail("Erro desconhecido ao adicionar item ao carrinho");
    }
  }
}
