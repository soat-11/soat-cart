import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartModule } from "@infra/ioc/cart.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "mongodb",
      url: process.env.MONGO_URL || "mongodb://localhost:27017/soat_cart",
      synchronize: true,
      autoLoadEntities: true,
    }),
    CartModule,
  ],
})
export class AppModule {}
