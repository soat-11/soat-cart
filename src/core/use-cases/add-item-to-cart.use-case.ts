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

    // 1. Valida se o produto existe no catálogo (Mock ou DB)
    const productValidation = await this.productRepository.findById(dto.sku);

    if (productValidation.isFailure || !productValidation.getValue()) {
      return Result.fail(`Produto ${dto.sku} não existe`);
    }

    // 2. Busca o carrinho no Mongo ou inicia um novo se não existir
    let cart = await this.cartRepository.findBySessionId(sessionId);

    if (!cart) {
      cart = new Cart(sessionId);
    }

    try {
      // 3. Adiciona ou atualiza o item usando a lógica da Entidade
      const item = new CartItem(dto.sku, dto.quantity, dto.unitPrice || 0);
      cart.addOrUpdateItem(item);

      // 4. Persiste no MongoDB (o método save lida com insert/update)
      await this.cartRepository.save(cart);

      const totals = cart.getTotal();

      // 5. Retorna o DTO de saída mapeado
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
