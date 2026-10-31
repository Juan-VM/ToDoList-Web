
using MongoDB.Bson;
using MongoDB.Driver;

namespace To_Dot_API.Endpoint
{
    public static class TasksEndpoint
    {
        public static void MapTasksEndpoint(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/tasks")
                           .WithTags("Tasks");

            // Obtener todas las tareas, con filtros y ordenamiento.
            group.MapGet("/", GetAll);

            // Obtener una tarea por su ID.
            group.MapGet("/{id}", GetById);

            // Crear una tarea.
            group.MapPost("/", Create);

            // Actualizar una tarea.
            group.MapPut("/{id}", Update);

            // Eliminar una tarea.
            group.MapDelete("/{id}", Delete);
        }

        private static IMongoCollection<TaskItem> GetMongoCollection(IMongoClient client)
        {
            return client
                .GetDatabase("To-Do-List_DB")
                .GetCollection<TaskItem>("Tasks");
        }

        // GET /api/tasks
        private static async Task<IResult> GetAll(
            IMongoClient client,
            bool? completed,
            Priority? priority,
            Category? category,
            string? search,
            string? sortBy)
        {
            var collection = GetMongoCollection(client);

            var tasks = await collection
                .Find(FilterDefinition<TaskItem>.Empty)
                .ToListAsync();

            // Filtrar por estado: pendientes o completadas.
            if (completed.HasValue)
            {
                tasks = tasks
                    .Where(t => t.Completed == completed.Value)
                    .ToList();
            }

            // Filtrar por prioridad.
            if (priority.HasValue)
            {
                tasks = tasks
                    .Where(t => t.Priority == priority.Value)
                    .ToList();
            }

            // Filtrar por categoría.
            if (category.HasValue)
            {
                tasks = tasks
                    .Where(t => t.Category == category.Value)
                    .ToList();
            }

            // Buscar por título o descripción.
            if (!string.IsNullOrWhiteSpace(search))
            {
                tasks = tasks
                    .Where(t =>
                        (!string.IsNullOrEmpty(t.Title) &&
                         t.Title.Contains(
                             search,
                             StringComparison.OrdinalIgnoreCase))
                        ||
                        (!string.IsNullOrEmpty(t.Description) &&
                         t.Description.Contains(
                             search,
                             StringComparison.OrdinalIgnoreCase)))
                    .ToList();
            }

            // Ordenar por fecha límite o prioridad.
            tasks = (sortBy?.ToLowerInvariant()) switch
            {
                "fechalimite" => tasks
                    .OrderBy(t => t.DueDate)
                    .ToList(),

                "fechalimitedesc" => tasks
                    .OrderByDescending(t => t.DueDate)
                    .ToList(),

                "prioridad" => tasks
                    .OrderByDescending(t => t.Priority)
                    .ToList(),

                "prioridadasc" => tasks
                    .OrderBy(t => t.Priority)
                    .ToList(),

                "creacion" => tasks
                    .OrderByDescending(t => t.CreatedDate)
                    .ToList(),

                _ => tasks
            };

            return TypedResults.Ok(tasks);
        }

        // GET /api/tasks/{id}
        private static async Task<IResult> GetById(
            string id,
            IMongoClient client)
        {
            if (!ObjectId.TryParse(id, out _))
            {
                return TypedResults.BadRequest(
                    new { message = "El ID proporcionado no es válido." });
            }

            var collection = GetMongoCollection(client);

            var task = await collection
                .Find(t => t.Id == id)
                .FirstOrDefaultAsync();

            if (task is null)
            {
                return TypedResults.NotFound(
                    new { message = "La tarea no fue encontrada." });
            }

            return TypedResults.Ok(task);
        }

        // POST /api/tasks
        private static async Task<IResult> Create(
            TaskItem task,
            IMongoClient client)
        {
            if (string.IsNullOrWhiteSpace(task.Title))
            {
                return TypedResults.BadRequest(
                    new { message = "El título es obligatorio." });
            }

            if (task.DueDate == default)
            {
                return TypedResults.BadRequest(
                    new { message = "La fecha límite es obligatoria." });
            }

            if (!Enum.IsDefined(typeof(Priority), task.Priority))
            {
                return TypedResults.BadRequest(
                    new { message = "La prioridad no es válida." });
            }

            if (!Enum.IsDefined(typeof(Category), task.Category))
            {
                return TypedResults.BadRequest(
                    new { message = "La categoría no es válida." });
            }

            var collection = GetMongoCollection(client);

            // El sistema genera el ID y la fecha de creación.
            task.Id = ObjectId.GenerateNewId().ToString();
            task.CreatedDate = DateTime.UtcNow;

            // Por ahora, el sistema funciona en modo monousuario.
            task.UserId = null;
            task.Completed = false;

            await collection.InsertOneAsync(task);

            return TypedResults.Created(
                $"/api/tasks/{task.Id}",
                task);
        }

        // PUT /api/tasks/{id}
        private static async Task<IResult> Update(
            string id,
            TaskItem updatedTask,
            IMongoClient client)
        {
            if (!ObjectId.TryParse(id, out _))
            {
                return TypedResults.BadRequest(
                    new { message = "El ID proporcionado no es válido." });
            }

            if (string.IsNullOrWhiteSpace(updatedTask.Title))
            {
                return TypedResults.BadRequest(
                    new { message = "El título es obligatorio." });
            }

            if (updatedTask.DueDate == default)
            {
                return TypedResults.BadRequest(
                    new { message = "La fecha límite es obligatoria." });
            }

            if (!Enum.IsDefined(typeof(Priority), updatedTask.Priority))
            {
                return TypedResults.BadRequest(
                    new { message = "La prioridad no es válida." });
            }

            if (!Enum.IsDefined(typeof(Category), updatedTask.Category))
            {
                return TypedResults.BadRequest(
                    new { message = "La categoría no es válida." });
            }

            var collection = GetMongoCollection(client);

            var existingTask = await collection
                .Find(t => t.Id == id)
                .FirstOrDefaultAsync();

            if (existingTask is null)
            {
                return TypedResults.NotFound(
                    new { message = "La tarea no fue encontrada." });
            }

            // Actualizar los campos permitidos.
            existingTask.Title = updatedTask.Title.Trim();
            existingTask.Description = updatedTask.Description;
            existingTask.Completed = updatedTask.Completed;
            existingTask.Priority = updatedTask.Priority;
            existingTask.Category = updatedTask.Category;
            existingTask.DueDate = updatedTask.DueDate;

            // Se conservan el ID, la fecha de creación y el propietario.
            await collection.ReplaceOneAsync(
                t => t.Id == id,
                existingTask);

            return TypedResults.Ok(existingTask);
        }

        // DELETE /api/tasks/{id}
        private static async Task<IResult> Delete(
            string id,
            IMongoClient client)
        {
            if (!ObjectId.TryParse(id, out _))
            {
                return TypedResults.BadRequest(
                    new { message = "El ID proporcionado no es válido." });
            }

            var collection = GetMongoCollection(client);

            var result = await collection.DeleteOneAsync(
                t => t.Id == id);

            if (result.DeletedCount == 0)
            {
                return TypedResults.NotFound(
                    new { message = "La tarea no fue encontrada." });
            }

            return TypedResults.NoContent();
        }
    }
}
