import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(3000);

  console.log('✅ Servidor corriendo en http://localhost:3000');
}

bootstrap().catch((error) => {
  console.error('❌ Error al iniciar el servidor:', error);
});
