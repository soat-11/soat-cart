import {
  Controller,
  Patch,
  Body,
  Headers,
  Res,
  BadRequestException,
  UsePipes,
  Get,
  NotFoundException,
  Param,
  Delete,
} from "@nestjs/common";
import { Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiBody,
  ApiResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from "@nestjs/swagger";

import { AddItemToCartUseCase } from "@core/use-cases/add-item-to-cart.use-case";
import {
  AddItemToCartDto,
  AddItemToCartSchema,
} from "../dtos/add-item-to-cart.dto";
import { CartOutputDto } from "../dtos/cart-output.dto";
import { CustomZodValidationPipe } from "../pipes/custom-zod-validation.pipe";
import { GetCartUseCase } from "@core/use-cases/get-cart.use-case.ts";
import { RemoveItemFromCartUseCase } from "@core/use-cases/remove-item-from-cart.use-case";

@ApiTags("Cart")
@Controller("v1/cart")
export class CartController {
  constructor(
    private readonly addItemToCartUseCase: AddItemToCartUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly removeItemToCartUseCase: RemoveItemFromCartUseCase
  ) {}

  @Patch("items")
  @ApiOperation({ summary: "Adicionar ou atualizar item no carrinho" })
  @ApiHeader({
    name: "session-id",
    required: true,
    description: "ID da sessão do cliente (UUID)",
  })
  @ApiBody({
    description: "Item a ser adicionado ou atualizado no carrinho",
    schema: {
      example: {
        sku: "SKU-001",
        quantity: 3,
        unitPrice: 10.0,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Item adicionado ou atualizado com sucesso",
    content: {
      "application/json": {
        example: {
          message: "Item adicionado ou editado com sucesso",
          data: {
            sessionId: "abc-123-session",
            items: [
              {
                sku: "SKU-001",
                quantity: 3,
                unitPrice: 10.0,
              },
            ],
            totalItems: 3,
            totalValue: 30.0,
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Erro ao adicionar ou atualizar item",
    content: {
      "application/json": {
        examples: {
          NoSession: {
            summary: "Sessão inválida",
            value: {
              statusCode: 400,
              message: "Sessão inválida ou ausente",
              error: "Bad Request",
            },
          },
          ProductNotFound: {
            summary: "Produto não encontrado",
            value: {
              statusCode: 400,
              message: "Produto SKU-999 não existe",
              error: "Bad Request",
            },
          },
        },
      },
    },
  })
  @UsePipes(new CustomZodValidationPipe(AddItemToCartSchema))
  public async addOrUpdateItem(
    @Headers("x-session-id") sessionId: string,
    @Body() body: AddItemToCartDto,
    @Res() res: Response
  ): Promise<Response<CartOutputDto>> {
    const result = await this.addItemToCartUseCase.execute(sessionId, body);

    if (result.isFailure) {
      throw new BadRequestException({
        statusCode: 400,
        message: result.error,
        error: "Bad Request",
      });
    }

    return res.status(200).json({
      message: "Item adicionado ou editado com sucesso",
      data: result.getValue(),
    });
  }

  @Get()
  @ApiOperation({ summary: "Buscar o carrinho atual do cliente" })
  @ApiHeader({
    name: "session-id",
    required: true,
    description: "ID da sessão do cliente",
  })
  @ApiOkResponse({
    description: "Carrinho recuperado com sucesso",
    type: CartOutputDto,
    content: {
      "application/json": {
        example: {
          message: "Carrinho recuperado com sucesso",
          data: {
            sessionId: "abc-123-session",
            items: [
              {
                sku: "SKU-001",
                quantity: 2,
                unitPrice: 12.5,
              },
            ],
            totalItems: 2,
            totalValue: 25.0,
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Carrinho não encontrado",
    content: {
      "application/json": {
        example: {
          statusCode: 404,
          message: "Carrinho não encontrado",
          error: "Not Found",
        },
      },
    },
  })
  public async getCart(
    @Headers("x-session-id") sessionId: string,
    @Res() res: Response
  ): Promise<Response> {
    const result = await this.getCartUseCase.execute(sessionId);

    if (result.isFailure) {
      throw new NotFoundException({
        statusCode: 404,
        message: result.error,
        error: "Not Found",
      });
    }

    return res.status(200).json({
      message: "Carrinho recuperado com sucesso",
      data: result.getValue(),
    });
  }

  @Delete("items/:sku")
  @ApiOperation({ summary: "Remover item específico do carrinho" })
  @ApiHeader({
    name: "session-id",
    required: true,
    description: "ID da sessão do cliente",
  })
  @ApiParam({ name: "sku", description: "SKU do item a ser removido" })
  @ApiResponse({
    status: 200,
    description: "Item removido com sucesso",
    content: {
      "application/json": {
        example: {
          message: "Item removido com sucesso",
          data: {
            sessionId: "...",
            items: [],
            totalItems: 0,
            totalValue: 0,
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Erro ao remover item",
    content: {
      "application/json": {
        examples: {
          ItemNotFound: {
            summary: "Item ou Carrinho não encontrado",
            value: {
              statusCode: 400,
              message: "Item não encontrado no carrinho",
              error: "Bad Request",
            },
          },
        },
      },
    },
  })
  public async removeItemFromCart(
    @Headers("x-session-id") sessionId: string,
    @Param("sku") sku: string,
    @Res() res: Response
  ): Promise<Response> {
    const result = await this.removeItemToCartUseCase.execute(sessionId, sku);

    if (result.isFailure) {
      throw new BadRequestException({
        statusCode: 400,
        message: result.error,
        error: "Bad Request",
      });
    }

    return res.status(200).json({
      message: "Item removido com sucesso",
      data: result.getValue(),
    });
  }
}
