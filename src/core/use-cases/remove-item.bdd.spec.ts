import { defineFeature, loadFeature } from "jest-cucumber";
import { Test, TestingModule } from "@nestjs/testing";
import { RemoveItemFromCartUseCase } from "./remove-item-from-cart.use-case";
import { Result } from "../../shared/result";

const feature = loadFeature("./test/bdd/features/remove-item.feature");

defineFeature(feature, (test) => {
  let useCase: RemoveItemFromCartUseCase;
  let response: Result<any>;

  const mockCartRepo = {
    findBySessionId: jest.fn(),
    save: jest.fn(),
  };

  const mockCartEntity = {
    sessionId: "sessao-xyz",
    removeItem: jest.fn(),
    getTotal: jest.fn().mockReturnValue({ quantity: 0, subtotal: 0 }),
    getItems: jest.fn().mockReturnValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveItemFromCartUseCase,
        { provide: "ICartRepository", useValue: mockCartRepo },
      ],
    }).compile();

    useCase = module.get<RemoveItemFromCartUseCase>(RemoveItemFromCartUseCase);
  });

  test("Remover um produto com sucesso", ({ given, when, then, and }) => {
    // Note que as funções agora são minúsculas: given, when, then, and

    given(
      /^que o cliente possui um carrinho com o produto "(.*)"$/,
      (sku: string) => {
        mockCartRepo.findBySessionId.mockResolvedValue(mockCartEntity);
      }
    );

    when(
      /^o cliente solicita a remoção do produto "(.*)"$/,
      async (sku: string) => {
        response = await useCase.execute("sessao-xyz", sku);
      }
    );

    then("o sistema deve processar a remoção com sucesso", () => {
      expect(response.isSuccess).toBe(true);
      expect(mockCartRepo.save).toHaveBeenCalled();
    });

    and(
      /^o carrinho resultante não deve conter o produto "(.*)"$/,
      (sku: string) => {
        const data = response.getValue()!;
        const itemExiste = data.items.some((i: any) => i.sku === sku);
        expect(itemExiste).toBe(false);
      }
    );
  });
});
