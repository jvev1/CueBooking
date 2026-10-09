# Iteración 04 - Propuestas

## SPEC

### Objetivo

Que los DJs puedan enviar propuestas de sesión a los eventos, retirarlas, y que se puedan ver las propuestas de un evento.

### Requisitos

- Enviar una propuesta a un evento con precio, duración en minutos y descripción. La propuesta queda asociada al DJ que la envía y empieza en estado "pendiente".
- Validar los datos de la propuesta:
  - precio obligatorio, número y no negativo
  - duración obligatoria, entero entre 1 y 720 minutos
  - descripción opcional, como mucho 1000 caracteres
- Solo los usuarios con rol DJ pueden enviar propuestas. Un organizador no puede.
- Solo se pueden enviar propuestas a eventos en estado "abierto". Si el evento no existe sale "Evento no encontrado".
- Un DJ solo puede enviar una propuesta a cada evento.
- Listar las propuestas de un evento, ordenadas de la más antigua a la más reciente.
- Ver las propuestas:
  - el organizador del evento ve todas las propuestas de su evento
  - un DJ solo ve las suyas
  - sin sesión no se ve ninguna
- Ver un evento devuelve el evento con sus propuestas (las que el usuario puede ver según el punto anterior).
- Retirar una propuesta propia. La propuesta se borra.
- Nadie puede retirar la propuesta de otro DJ, tampoco accediendo directamente a la base de datos.
- Si se borra un evento se borran sus propuestas.

### Requisitos técnicos

- El control de acceso se hace con políticas RLS en la tabla propuestas.

### Fuera de alcance

- Modificar una propuesta.
- Aceptar o rechazar propuestas (cambiar el estado).
- Paginación de las propuestas.
- Reseñas.


