import { defineFeature, loadFeature } from "jest-cucumber";
import { Test, TestingModule } from "@nestjs/testing";
import { GetCartUseCase } from "./get-cart.use-case.ts";

const feature = loadFeature("./test/bdd/features/get-cart.feature");

defineFeature(feature, (test) => {
  let useCase: GetCartUseCase;
  let response: any;

  const mockCartRepo = {
    findBySessionId: jest.fn(),
  };

  // Mock da entidade que simula o comportamento do carrinho no domínio
  const mockCartEntity = {
    sessionId: "sessao-consulta-123",
    getTotal: jest.fn().mockReturnValue({ quantity: 2, subtotal: 100 }),
    getItems: jest.fn().mockReturnValue([
      { sku: "ITEM-1", quantity: 1, unitPrice: 50 },
      { sku: "ITEM-2", quantity: 1, unitPrice: 50 },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCartUseCase,
        { provide: "ICartRepository", useValue: mockCartRepo },
      ],
    }).compile();

    useCase = module.get<GetCartUseCase>(GetCartUseCase);
  });

  test("Buscar um carrinho existente com itens", ({
    given,
    and,
    when,
    then,
  }) => {
    given(
      /^que existe um carrinho ativo para a sessão "(.*)"$/,
      (sessionId: string) => {
        mockCartRepo.findBySessionId.mockResolvedValue(mockCartEntity);
      }
    );

    and(/^este carrinho contém (.*) itens$/, (qtd: string) => {
      // O mock já está configurado para retornar 2 itens
      expect(mockCartEntity.getItems().length).toBe(Number(qtd));
    });

    when(
      /^o cliente solicita a visualização do carrinho "(.*)"$/,
      async (sessionId: string) => {
        response = await useCase.execute(sessionId);
      }
    );

    then("o sistema deve retornar os dados do carrinho com sucesso", () => {
      expect(response.isSuccess).toBe(true);
      const data = response.getValue();
      expect(data.sessionId).toBe("sessao-consulta-123");
    });

    and(/^o total de itens deve ser (.*)$/, (total: string) => {
      const data = response.getValue();
      expect(data.totalItems).toBe(Number(total));
    });
  });
});
