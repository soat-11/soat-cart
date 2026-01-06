import { defineFeature, loadFeature } from "jest-cucumber";
import { Test, TestingModule } from "@nestjs/testing";
import { AddItemToCartUseCase } from "./add-item-to-cart.use-case";
import { GetCartUseCase } from "./get-cart.use-case.ts";
import { Result } from "../../shared/result";

const feature = loadFeature("./test/bdd/features/cart-operations.feature");

defineFeature(feature, (test) => {
  let addUseCase: AddItemToCartUseCase;
  let getUseCase: GetCartUseCase;
  let response: any;

  const mockCartRepo = {
    findBySessionId: jest.fn(),
    save: jest.fn(),
  };

  const mockProductRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddItemToCartUseCase,
        GetCartUseCase,
        { provide: "ICartRepository", useValue: mockCartRepo },
        { provide: "IProductRepository", useValue: mockProductRepo },
      ],
    }).compile();

    addUseCase = module.get<AddItemToCartUseCase>(AddItemToCartUseCase);
    getUseCase = module.get<GetCartUseCase>(GetCartUseCase);
  });

  // CENÁRIO: Adicionar um novo item
  test("Adicionar um novo item ao carrinho", ({ given, and, when, then }) => {
    given(
      /^que o produto "(.*)" existe com preço (.*)$/,
      (sku: string, preco: string) => {
        mockProductRepo.findById.mockResolvedValue(
          Result.ok({ sku, price: Number(preco) })
        );
      }
    );

    and(/^o cliente inicia uma sessão "(.*)"$/, (sessionId: string) => {
      mockCartRepo.findBySessionId.mockResolvedValue(null); // Carrinho novo
    });

    when(
      /^o cliente adiciona (.*) unidades do produto "(.*)" ao carrinho$/,
      async (qtd: string, sku: string) => {
        response = await addUseCase.execute("sessao-123", {
          sku,
          quantity: Number(qtd),
          unitPrice: 50,
        });
      }
    );

    then(/^o carrinho deve ter o valor total de (.*)$/, (total: string) => {
      expect(response.isSuccess).toBe(true);
      expect(response.getValue().totalValue).toBe(Number(total));
    });
  });

  // CENÁRIO: Buscar um carrinho
  test("Buscar um carrinho existente", ({ given, when, then }) => {
    given(
      /^que existe um carrinho para a sessão "(.*)" com 1 item$/,
      (sessionId: string) => {
        const mockCart = {
          sessionId,
          getTotal: () => ({ quantity: 1, subtotal: 50 }),
          getItems: () => [{ sku: "PROD-1", quantity: 1, unitPrice: 50 }],
        };
        mockCartRepo.findBySessionId.mockResolvedValue(mockCart);
      }
    );

    when(
      /^o cliente solicita os detalhes do carrinho "(.*)"$/,
      async (sessionId: string) => {
        response = await getUseCase.execute(sessionId);
      }
    );

    then(/^o sistema retorna o carrinho com (.*) item$/, (qtd: string) => {
      expect(response.isSuccess).toBe(true);
      expect(response.getValue().items).toHaveLength(Number(qtd));
    });
  });
});
