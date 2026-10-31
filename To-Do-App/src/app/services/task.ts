
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

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private http = inject(HttpClient);

    // Cambia el puerto por el que utiliza tu API.
    private readonly apiUrl = 'https://localhost:7000/api/tasks';

    getTasks(filters: TaskFilters = {}): Observable<TaskItem[]> {
        let params = new HttpParams();

        if (filters.completed !== undefined) {
            params = params.set('completed', filters.completed);
        }

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

    getTask(id: string): Observable<TaskItem> {
        return this.http.get<TaskItem>(`${this.apiUrl}/${id}`);
    }

    createTask(task: TaskItem): Observable<TaskItem> {
        return this.http.post<TaskItem>(this.apiUrl, task);
    }

    updateTask(id: string, task: TaskItem): Observable<TaskItem> {
        return this.http.put<TaskItem>(`${this.apiUrl}/${id}`, task);
    }

    deleteTask(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

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
