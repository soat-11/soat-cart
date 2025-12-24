import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartSchema } from "@infra/persistence/schemas/cart.schema";
import { CartMongoRepository } from "@infra/persistence/repositories/cart.mongo.repository";
import { ProductMongoRepository } from "@infra/persistence/repositories/product.mongo.repository";
import { CartController } from "@infra/http/controllers/cart.controller";
import { AddItemToCartUseCase } from "@core/use-cases/add-item-to-cart.use-case";

@Module({
  imports: [TypeOrmModule.forFeature([CartSchema])],
  controllers: [CartController],
  providers: [
    AddItemToCartUseCase,

    {
      provide: "ICartRepository",
      useClass: CartMongoRepository,
    },
    {
      provide: "IProductRepository",
      useClass: ProductMongoRepository,
    },
  ],
  exports: [AddItemToCartUseCase],
})
export class CartModule {}
