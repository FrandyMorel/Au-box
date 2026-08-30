import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend en puerto 3000
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(3001);

  console.log('✅ Servidor corriendo en http://localhost:3001');
}

bootstrap().catch((error) => {
  console.error('❌ Error al iniciar el servidor:', error);
});
