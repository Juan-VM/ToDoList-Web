
// Enums que se usan en los selects y para comparar valores con la API.
export enum Priority {
    Baja = 0,
    Media = 1,
    Alta = 2
}

export enum Category {
    Estudio = 0,
    Trabajo = 1,
    Personal = 2,
    Salud = 3,
    Deporte = 4,
    Finanzas = 5
}

// Forma de una tarea tal como la devuelve la API.
export interface TaskItem {
    id?: string;
    title: string;
    description: string;
    completed: boolean;
    priority: Priority;
    category: Category;
    createdDate?: string;
    dueDate: string;
    userId?: string | null;
}

// Parámetros opcionales para filtrar u ordenar al pedir las tareas.
export interface TaskFilters {
    completed?: boolean;
    priority?: Priority;
    category?: Category;
    search?: string;
    sortBy?: string;
}