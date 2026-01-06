import { Test, TestingModule } from "@nestjs/testing";
import { CartController } from "./cart.controller";
import { AddItemToCartUseCase } from "@core/use-cases/add-item-to-cart.use-case";
import { GetCartUseCase } from "@core/use-cases/get-cart.use-case.ts";
import { RemoveItemFromCartUseCase } from "@core/use-cases/remove-item-from-cart.use-case";
import { Result } from "@shared/result";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("CartController", () => {
  let controller: CartController;

  // Mocks dos Use Cases
  const mockAddUseCase = { execute: jest.fn() };
  const mockGetUseCase = { execute: jest.fn() };
  const mockRemoveUseCase = { execute: jest.fn() };

  // Mock do Response do Express
  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        { provide: AddItemToCartUseCase, useValue: mockAddUseCase },
        { provide: GetCartUseCase, useValue: mockGetUseCase },
        { provide: RemoveItemFromCartUseCase, useValue: mockRemoveUseCase },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    jest.clearAllMocks();
  });

  describe("addOrUpdateItem", () => {
    it("deve retornar 200 ao adicionar item com sucesso", async () => {
      const res = mockResponse();
      mockAddUseCase.execute.mockResolvedValue(Result.ok({ sessionId: "123" }));

      await controller.addOrUpdateItem(
        "123",
        { sku: "A", quantity: 1, unitPrice: 10 },
        res
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Item adicionado ou editado com sucesso",
        })
      );
    });

    it("deve lançar BadRequestException em caso de falha no use case", async () => {
      const res = mockResponse();
      mockAddUseCase.execute.mockResolvedValue(Result.fail("Erro no produto"));

      await expect(
        controller.addOrUpdateItem(
          "123",
          { sku: "A", quantity: 1, unitPrice: 10 },
          res
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getCart", () => {
    it("deve retornar 200 ao buscar carrinho com sucesso", async () => {
      const res = mockResponse();
      mockGetUseCase.execute.mockResolvedValue(Result.ok({ items: [] }));

      await controller.getCart("123", res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("deve lançar NotFoundException quando o carrinho não existir", async () => {
      const res = mockResponse();
      mockGetUseCase.execute.mockResolvedValue(Result.fail("Não encontrado"));

      await expect(controller.getCart("123", res)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("removeItemFromCart", () => {
    it("deve retornar 200 ao remover item com sucesso", async () => {
      const res = mockResponse();
      mockRemoveUseCase.execute.mockResolvedValue(Result.ok({ items: [] }));

      await controller.removeItemFromCart("123", "SKU-A", res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Item removido com sucesso" })
      );
    });

    it("deve lançar BadRequestException ao falhar remoção", async () => {
      const res = mockResponse();
      mockRemoveUseCase.execute.mockResolvedValue(
        Result.fail("Erro ao remover")
      );

      await expect(
        controller.removeItemFromCart("123", "SKU-A", res)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
