import { ApiProperty } from "@nestjs/swagger";

export class CartItemOutputDto {
  @ApiProperty({ description: "Identificador do produto (SKU)" })
  sku: string;

  @ApiProperty({ description: "Quantidade selecionada" })
  quantity: number;

  @ApiProperty({ description: "Preço unitário do item" })
  unitPrice: number;
}

export class CartOutputDto {
  @ApiProperty({ description: "Identificador da sessão do cliente" })
  sessionId: string;

  @ApiProperty({ description: "Total de itens no carrinho" })
  totalItems: number;

  @ApiProperty({ description: "Valor total do carrinho" })
  totalValue: number;

  @ApiProperty({
    type: [CartItemOutputDto],
    description: "Lista de itens no carrinho",
  })
  items: CartItemOutputDto[];
}
