import { Injectable, Inject } from "@nestjs/common";
import { Result } from "@shared/result";
import { CartOutputDto } from "@infra/http/dtos/cart-output.dto";
import { ICartRepository } from "@core/domain/repositories/cart.repository.interface";

@Injectable()
export class RemoveItemFromCartUseCase {
  constructor(
    @Inject("ICartRepository")
    private readonly cartRepository: ICartRepository
  ) {}

  public async execute(
    sessionId: string,
    sku: string
  ): Promise<Result<CartOutputDto>> {
    if (!sessionId || !sku) {
      return Result.fail("Sessão ou SKU inválidos");
    }

    const cart = await this.cartRepository.findBySessionId(sessionId);

    if (!cart) {
      return Result.fail("Carrinho não encontrado");
    }

    try {
      cart.removeItem(sku);

      await this.cartRepository.save(cart);

      const totals = cart.getTotal();

      return Result.ok({
        sessionId: cart.sessionId,
        items: cart.getItems().map((item) => ({
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        totalItems: totals.quantity,
        totalValue: totals.subtotal,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return Result.fail(error.message);
      }

      return Result.fail("Erro desconhecido ao remover item do carrinho");
    }
  }
}
