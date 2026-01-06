import { Test, TestingModule } from "@nestjs/testing";
import { AddItemToCartUseCase } from "./add-item-to-cart.use-case";

describe("AddItemToCartUseCase", () => {
  let useCase: AddItemToCartUseCase;

  const mockCartRepo = {
    findBySessionId: jest.fn(),
    save: jest.fn(),
  };

  const mockProductRepo = {
    findById: jest.fn(),
  };

  const mockCartEntity = {
    sessionId: "session-123",
    addOrUpdateItem: jest.fn(),
    getTotal: jest.fn().mockReturnValue({ quantity: 1, subtotal: 100 }),
    getItems: jest
      .fn()
      .mockReturnValue([{ sku: "SKU-TEST", quantity: 1, unitPrice: 100 }]),
    removeItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddItemToCartUseCase,
        { provide: "ICartRepository", useValue: mockCartRepo },
        { provide: "IProductRepository", useValue: mockProductRepo },
      ],
    }).compile();

    useCase = module.get<AddItemToCartUseCase>(AddItemToCartUseCase);
    jest.clearAllMocks();
  });

  it("deve estar definido", () => {
    expect(useCase).toBeDefined();
  });

  it("deve falhar se a sessão não for informada", async () => {
    const result = await useCase.execute("", {
      sku: "A",
      quantity: 1,
      unitPrice: 10,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toContain("Sessão inválida");
  });

  it("deve criar um novo carrinho se não existir e adicionar o item", async () => {
    mockCartRepo.findBySessionId.mockResolvedValue(null);
    mockCartRepo.save.mockResolvedValue(true);

    const result = await useCase.execute("session-new", {
      sku: "SKU-1",
      quantity: 1,
      unitPrice: 10,
    });

    expect(result.isSuccess).toBe(true);
    expect(mockCartRepo.findBySessionId).toHaveBeenCalledWith("session-new");
    expect(mockCartRepo.save).toHaveBeenCalled();
  });

  it("deve usar carrinho existente e adicionar o item", async () => {
    mockCartRepo.findBySessionId.mockResolvedValue(mockCartEntity);

    const result = await useCase.execute("session-123", {
      sku: "SKU-TEST",
      quantity: 1,
      unitPrice: 10,
    });

    expect(result.isSuccess).toBe(true);
    expect(mockCartEntity.addOrUpdateItem).toHaveBeenCalled();
    expect(mockCartRepo.save).toHaveBeenCalled();
  });
});
