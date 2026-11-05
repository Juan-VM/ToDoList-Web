
import { Injectable, inject } from '@angular/core';
import {
    HttpClient,
    HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

import {
    TaskItem,
    TaskFilters
} from '../models/task.model';

/**
  Servicio de tareas: centraliza todas las peticiones HTTP a la API.
  Los componentes solo llaman a estos métodos y no construyen URLs.
*/
@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private http = inject(HttpClient);

    // Cambia el puerto por el que utiliza tu API.
    private readonly apiUrl = 'https://localhost:7049/api/tasks';

    /**
      GET /api/tasks
      Convierte los filtros a query params (?completed=..., &sortBy=...).
    */
    getTasks(filters: TaskFilters = {}): Observable<TaskItem[]> {
        let params = new HttpParams();

        if (filters.completed !== undefined) {
            params = params.set('completed', filters.completed);
        }

        // La API espera el nombre del enum como texto ("Alta", "Estudio"...).
        if (filters.priority !== undefined) {
            params = params.set('priority', PriorityName(filters.priority));
        }

        if (filters.category !== undefined) {
            params = params.set('category', CategoryName(filters.category));
        }

        if (filters.search?.trim()) {
            params = params.set('search', filters.search.trim());
        }

        if (filters.sortBy) {
            params = params.set('sortBy', filters.sortBy);
        }

        return this.http.get<TaskItem[]>(this.apiUrl, { params });
    }

    // GET /api/tasks/{id}
    getTask(id: string): Observable<TaskItem> {
        return this.http.get<TaskItem>(`${this.apiUrl}/${id}`);
    }

    // POST /api/tasks
    createTask(task: TaskItem): Observable<TaskItem> {
        return this.http.post<TaskItem>(this.apiUrl, task);
    }

    // PUT /api/tasks/{id}
    updateTask(id: string, task: TaskItem): Observable<TaskItem> {
        return this.http.put<TaskItem>(`${this.apiUrl}/${id}`, task);
    }

    // DELETE /api/tasks/{id}
    deleteTask(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

// ---- Conversión de números (enums del frontend) a texto (API/MongoDB) ----

function PriorityName(priority: number): string {
    return ['Baja', 'Media', 'Alta'][priority];
}

function CategoryName(category: number): string {
    return [
        'Estudio',
        'Trabajo',
        'Personal',
        'Salud',
        'Deporte',
        'Finanzas'
    ][category];
}
