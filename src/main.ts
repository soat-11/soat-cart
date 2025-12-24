import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "@infra/http/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validação global (usa class-validator e class-transformer)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle("SOAT Cart Service")
    .setDescription("Microsserviço de Gerenciamento de Carrinho e Pedidos")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Interface Moderna do Scalar
  app.use(
    "/reference",
    apiReference({
      spec: { content: document },
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Service is running on: http://localhost:${port}/reference`);
}

bootstrap();
