import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartSchema } from "@infra/persistence/schemas/cart.schema";
import { CartMongoRepository } from "@infra/persistence/repositories/cart.mongo.repository";
import { ProductMongoRepository } from "@infra/persistence/repositories/product.mongo.repository";
import { CartController } from "@infra/http/controllers/cart.controller";
import { AddItemToCartUseCase } from "@core/use-cases/add-item-to-cart.use-case";
import { GetCartUseCase } from "@core/use-cases/get-cart.use-case.ts";
import { RemoveItemFromCartUseCase } from "@core/use-cases/remove-item-from-cart.use-case";

@Module({
  imports: [TypeOrmModule.forFeature([CartSchema])],
  controllers: [CartController],
  providers: [
    AddItemToCartUseCase,
    GetCartUseCase,
    RemoveItemFromCartUseCase,

    {
      provide: "ICartRepository",
      useClass: CartMongoRepository,
    },
    {
      provide: "IProductRepository",
      useClass: ProductMongoRepository,
    },
  ],
  exports: [AddItemToCartUseCase, GetCartUseCase, RemoveItemFromCartUseCase],
})
export class CartModule {}
