import {
  Controller,
  Patch,
  Body,
  Headers,
  Res,
  BadRequestException,
  UsePipes,
} from "@nestjs/common";
import { Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiHeader,
  ApiBody,
  ApiResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger";

import { AddItemToCartUseCase } from "@core/use-cases/add-item-to-cart.use-case";
import {
  AddItemToCartDto,
  AddItemToCartSchema,
} from "../dtos/add-item-to-cart.dto";
import { CartOutputDto } from "../dtos/cart-output.dto";
import { CustomZodValidationPipe } from "../pipes/custom-zod-validation.pipe";

@ApiTags("Cart")
@Controller("v1/cart")
export class CartController {
  constructor(private readonly addItemToCartUseCase: AddItemToCartUseCase) {}

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
    console.log(sessionId, "sessionId ====>");
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
}
