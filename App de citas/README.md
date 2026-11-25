# 💘 Amour & Planes — Aplicativo de Citas y Álbum de Recuerdos con Base de Datos SQL

Aplicativo web completo (Frontend + Backend + Base de Datos Relacional SQL) diseñado para planificar citas en pareja, escoger fecha y hora, explorar **10 sugerencias de planes divertidos y románticos**, y almacenar **de 4 a 5 fotografías como recordatorio** de cada plan.

## ✨ Características Principales

1. **Base de Datos Relacional SQL (`SQLite 3` + `schema.sql`)**:
   - **`planes_sugeridos`**: Contiene las 10 sugerencias de planes divertidos y románticos con su categoría, duración, presupuesto, lugar sugerido y tips románticos.
   - **`citas_programadas`**: Almacena cada cita agendada con su **Fecha (`DATE`)**, **Hora (`TIME`)**, lugar, notas previas, bitácora del recuerdo, calificación (`1 a 5`) y clave foránea (`plan_id`).
   - **`fotos_cita`**: Almacena de **4 a 5 fotos de recordatorio por cada plan/cita** (`slot_numero` del `1` al `5`), protegida con restricción `UNIQUE(cita_id, slot_numero)` y un `TRIGGER` SQL (`trg_limite_5_fotos_por_cita`) que garantiza un máximo de 5 fotos por cita.
2. **10 Planes Divertidos y Románticos incluidos**:
   - 🌅 *Picnic al Atardecer & Estrellas*
   - 🍕 *Noche de Chef: Pizzas Artesanales & Vino*
   - 🎳 *Reto Arcade, Bolos y Malteadas Retro*
   - 🎨 *Taller de Pintura Cruzada & Cócteles*
   - 🕯️ *Cena Sensorial a Ciegas (5 Sentidos)*
   - 🌌 *Ruta de Miradores & Cartas del Futuro*
   - 🍿 *Cine Bajo Fuerte de Sábanas y Luces*
   - 🔐 *Escape Room en Pareja & Bar Secreto*
   - 🧖‍♀️ *Noche de Spa, Aromaterapia y Masajes*
   - 🍨 *Tour de 3 Paradas de Postres y Café*
3. **Selector de Fecha y Hora**:
   - Calendario interactivo (`YYYY-MM-DD`) con accesos rápidos (*Hoy*, *Mañana*, *Próximo Viernes*, *Este Sábado*) y selector de hora (`HH:MM`) con horarios sugeridos (*Brunch 11:00*, *Atardecer 17:30*, *Cena 19:30*, *Noche 21:00*).
4. **Álbum Polaroid de 4 a 5 Fotos por Plan**:
   - Sube de 4 a 5 fotos desde tu computadora o celular (o reemplaza cualquier espacio individual del `#1` al `#5`), edita el pie de foto y ábrelas en el visor Lightbox Polaroid.
5. **Inspector y Exportador SQL Integrado**:
   - Pestaña **"🗄️ Base de Datos SQL"** dentro del aplicativo para ver los registros en tiempo real y descargar un respaldo `.sql` completo.
