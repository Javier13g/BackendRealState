import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:5173',
    'https://<tu-usuario>.github.io', // cambia esto por tu dominio real cuando lo tengas
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, // Permitir cookies o encabezados de autenticación
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('API Backend Nest')
    .setDescription('Documentación automática de la API con Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(process.env.HEROKU_APP_URL || 'http://localhost:5000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 5000);
  const url = await app.getUrl();
  console.log(`🚀 Swagger is running on: ${url}/api`);
  console.log(`🚀 Server running on: ${url}`);
}
void bootstrap();
