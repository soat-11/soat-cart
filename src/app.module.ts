import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    // Carrega o .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuração do MongoDB
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "mongodb",
        url: config.get<string>(
          "MONGO_URL",
          "mongodb://localhost:27017/soat_cart"
        ),
        autoLoadEntities: true,
        synchronize: true, // Apenas para Lab/Dev
      }),
    }),
  ],
})
export class AppModule {}
