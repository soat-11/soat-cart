import { Injectable, Inject } from "@nestjs/common";
import { Result } from "@shared/result";
import { CartOutputDto } from "@infra/http/dtos/cart-output.dto";
import { ICartRepository } from "@core/domain/repositories/cart.repository.interface";

@Injectable()
export class GetCartUseCase {
  constructor(
    @Inject("ICartRepository")
    private readonly cartRepository: ICartRepository
  ) {}

  public async execute(sessionId: string): Promise<Result<CartOutputDto>> {
    if (!sessionId) {
      return Result.fail("Sessão inválida ou ausente");
    }

    const cart = await this.cartRepository.findBySessionId(sessionId);

    if (!cart) {
      return Result.fail("Carrinho não encontrado");
    }

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
  }
}
