import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:5000',
    'http://[::1]:5000', // para IPv6
    'http://localhost:5173',
    'https://<tu-usuario>.github.io',
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());

  const port = process.env.PORT ?? 5000;
  const serverUrl = process.env.HEROKU_APP_URL || `http://localhost:${port}`;

  const config = new DocumentBuilder()
    .setTitle('API Backend Nest')
    .setDescription('Documentación automática de la API con Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(serverUrl)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  const url = await app.getUrl();
  console.log(`🚀 Swagger is running on: ${url}/api`);
  console.log(`🚀 Server running on: ${url}`);
}
void bootstrap();
