# Ver Logs del Contenedor

En Coolify, necesitas ver los logs para saber por qué no está iniciando:

## En la Interfaz de Coolify:

1. Ve a tu aplicación
2. Click en la pestaña **"Logs"**
3. Busca errores

## O en terminal (si tienes acceso SSH):

```bash
docker logs xkwo0k88k8oko0gg8gsw4kso-154940211120
```

## Posibles Problemas:

1. El comando `npx prisma db push` puede estar fallando
2. El archivo `server.js` no existe
3. Variables de entorno no están disponibles

## Solución Temporal - Ver Logs:

Por favor, busca en los logs de Coolify y envíame lo que dice.

