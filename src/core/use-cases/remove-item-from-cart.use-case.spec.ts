import { Test, TestingModule } from "@nestjs/testing";
import { RemoveItemFromCartUseCase } from "./remove-item-from-cart.use-case";
import { Result } from "../../shared/result";

describe("RemoveItemFromCartUseCase", () => {
  let useCase: RemoveItemFromCartUseCase;

  // Mock do Repositório
  const mockCartRepo = {
    findBySessionId: jest.fn(),
    save: jest.fn(),
  };

  // Mock da Entidade Cart
  const mockCartEntity = {
    sessionId: "session-123",
    removeItem: jest.fn(),
    getTotal: jest.fn().mockReturnValue({ quantity: 1, subtotal: 10 }),
    getItems: jest
      .fn()
      .mockReturnValue([{ sku: "PROD-1", quantity: 1, unitPrice: 10 }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveItemFromCartUseCase,
        {
          provide: "ICartRepository",
          useValue: mockCartRepo,
        },
      ],
    }).compile();

    useCase = module.get<RemoveItemFromCartUseCase>(RemoveItemFromCartUseCase);
    jest.clearAllMocks();
  });

  it("deve falhar se sessionId ou sku forem ausentes", async () => {
    const result = await useCase.execute("", "SKU-1");
    expect(result.isFailure).toBe(true);
    expect(result.error).toBe("Sessão ou SKU inválidos");
  });

  it("deve falhar se o carrinho não for encontrado", async () => {
    mockCartRepo.findBySessionId.mockResolvedValue(null);

    const result = await useCase.execute("session-123", "SKU-1");

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe("Carrinho não encontrado");
  });

  it("deve remover o item e salvar o carrinho com sucesso", async () => {
    mockCartRepo.findBySessionId.mockResolvedValue(mockCartEntity);
    mockCartRepo.save.mockResolvedValue(true);

    const result = await useCase.execute("session-123", "PROD-1");

    expect(result.isSuccess).toBe(true);
    expect(mockCartEntity.removeItem).toHaveBeenCalledWith("PROD-1");
    expect(mockCartRepo.save).toHaveBeenCalledWith(mockCartEntity);

    const data = result.getValue()!;
    expect(data.sessionId).toBe("session-123");
  });

  it("deve capturar erros genéricos no bloco catch", async () => {
    mockCartRepo.findBySessionId.mockResolvedValue(mockCartEntity);
    // Simula um erro inesperado ao tentar remover
    mockCartEntity.removeItem.mockImplementation(() => {
      throw new Error("Erro ao remover item");
    });

    const result = await useCase.execute("session-123", "PROD-1");

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe("Erro ao remover item");
  });
});
