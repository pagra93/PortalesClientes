# 📘 Cómo compartir bases de datos de Notion con tu portal

## ✅ Tu token ya está configurado

El token `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` ya está funcionando.

Ahora solo necesitas **compartir las bases de datos** que quieras mostrar en el portal.

---

## 🔗 Paso a paso para compartir una base de datos

### 1. **Ve a la página de Notion que contiene tu base de datos**

Puede ser una página con una tabla/board/calendario.

### 2. **Abre el menú de la página**

Click en los **3 puntos (•••)** en la esquina superior derecha de la página.

### 3. **Busca "Connections" o "Conexiones"**

En el menú desplegable, busca la opción que dice:
- **"Connections"** (en inglés)
- **"Conexiones"** (en español)
- **"Add connections"** / **"Añadir conexiones"**

### 4. **Selecciona tu integración**

Deberías ver una integración llamada algo como:
- **"Portal web clientes"** (el nombre que pusiste en Notion)
- O el nombre que le diste a tu integración interna

### 5. **Confirma**

Click en la integración y confirma que quieres compartirla.

### 6. **¡Listo!**

Ahora esa base de datos estará disponible en tu portal.

---

## 🔍 Verificar que funciona

1. **Abre el portal**: http://localhost:3006/portals
2. **Click en "Crear Portal"**
3. **En el Paso 1** deberías ver "✅ Conectado a Notion"
4. **En el Paso 3** deberías ver tus bases de datos disponibles

---

## ⚠️ Si no aparecen las bases de datos:

### Revisa estos puntos:

1. **¿Compartiste la página correcta?**
   - Debes compartir la página que **contiene** la base de datos
   - No solo la base de datos en sí

2. **¿La integración está activa?**
   - Ve a https://www.notion.so/my-integrations
   - Verifica que tu integración "Portal web clientes" esté activa

3. **¿Es una base de datos o una página?**
   - Solo las **databases** (tablas, boards, calendarios) aparecerán
   - Las páginas normales de texto NO aparecen

4. **¿Tiene el formato correcto?**
   - Debe ser una "Database" de Notion
   - Puede ser: Table, Board, Gallery, List, Calendar, Timeline

---

## 📸 Ejemplo visual

```
Página de Notion
├── 📄 Título de la página
├── 📝 Algún texto
└── 📊 Base de datos de Tareas  ← ¡Compartir ESTA página!
    ├── Tarea 1
    ├── Tarea 2
    └── Tarea 3
```

**Importante**: Comparte la **página padre** que contiene la base de datos, no solo la base de datos.

---

## 🎯 Bases de datos recomendadas para el portal

Para crear un portal completo, comparte estas bases de datos:

### 1. **Tareas / Tasks**
- Lista de tareas del proyecto
- Con columnas: Nombre, Estado, Responsable, Fecha

### 2. **Hitos / Milestones**  
- Entregables importantes
- Con columnas: Hito, Fecha, Estado

### 3. **Historial / Updates** (opcional)
- Log de cambios o actualizaciones
- Con columnas: Fecha, Descripción, Autor

---

## 🚀 Siguiente paso

Una vez que hayas compartido al menos una base de datos:

1. Recarga http://localhost:3006/portals
2. Click en "Crear Portal"
3. Sigue el wizard de 4 pasos
4. ¡Crea tu primer portal!

---

## ❓ ¿Dudas?

Si algo no funciona:
1. Verifica que el servidor esté corriendo: http://localhost:3006
2. Revisa la consola por errores
3. Intenta recargar la página en Notion y volver a compartir


