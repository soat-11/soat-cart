import { Test, TestingModule } from "@nestjs/testing";
import { GetCartUseCase } from "./get-cart.use-case.ts";

describe("GetCartUseCase", () => {
  let useCase: GetCartUseCase;

  // Mock do Repositório
  const mockCartRepo = {
    findBySessionId: jest.fn(),
  };

  // Mock da Entidade Cart que retorna os dados necessários
  const mockCartEntity = {
    sessionId: "session-123",
    getTotal: jest.fn().mockReturnValue({ quantity: 2, subtotal: 50.5 }),
    getItems: jest
      .fn()
      .mockReturnValue([{ sku: "PROD-1", quantity: 2, unitPrice: 25.25 }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCartUseCase,
        {
          provide: "ICartRepository",
          useValue: mockCartRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetCartUseCase>(GetCartUseCase);
    jest.clearAllMocks();
  });

  it("deve falhar se a sessão não for informada", async () => {
    const result = await useCase.execute("");

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe("Sessão inválida ou ausente");
  });

  it("deve falhar se o carrinho não for encontrado no banco", async () => {
    // Simula que o repositório retornou null
    mockCartRepo.findBySessionId.mockResolvedValue(null);

    const result = await useCase.execute("sessao-inexistente");

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe("Carrinho não encontrado");
    expect(mockCartRepo.findBySessionId).toHaveBeenCalledWith(
      "sessao-inexistente"
    );
  });

  it("deve retornar o carrinho formatado em caso de sucesso", async () => {
    // Simula que achou o carrinho
    mockCartRepo.findBySessionId.mockResolvedValue(mockCartEntity);

    const result = await useCase.execute("session-123");

    expect(result.isSuccess).toBe(true);

    // O '!' resolve o erro do TypeScript
    const data = result.getValue()!;

    expect(data.sessionId).toBe("session-123");
    expect(data.totalItems).toBe(2);
    expect(data.totalValue).toBe(50.5);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].sku).toBe("PROD-1");
  });
});
