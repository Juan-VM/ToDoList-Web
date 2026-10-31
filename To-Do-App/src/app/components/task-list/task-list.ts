
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TaskService } from '../../services/task';
import {
  TaskItem,
  TaskFilters,
  Priority,
  Category
} from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html'
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);

  tasks = signal<TaskItem[]>([]);
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  search = '';
  statusFilter = 'todas';
  priorityFilter = '';
  categoryFilter = '';
  sortBy = 'fechaLimite';

  showModal = false;
  showDeleteModal = false;
  editingId: string | null = null;
  taskToDelete: TaskItem | null = null;

  readonly priorities = [
    { value: Priority.Baja, label: 'Baja' },
    { value: Priority.Media, label: 'Media' },
    { value: Priority.Alta, label: 'Alta' }
  ];

  readonly categories = [
    { value: Category.Estudio, label: 'Estudio' },
    { value: Category.Trabajo, label: 'Trabajo' },
    { value: Category.Personal, label: 'Personal' },
    { value: Category.Salud, label: 'Salud' },
    { value: Category.Deporte, label: 'Deporte' },
    { value: Category.Finanzas, label: 'Finanzas' }
  ];

  form: TaskItem = this.emptyTask();

  ngOnInit(): void {
    this.loadTasks();
  }

  get pendingCount(): number {
    return this.tasks().filter(t => !t.completed).length;
  }

  get completedCount(): number {
    return this.tasks().filter(t => t.completed).length;
  }

  get totalCount(): number {
    return this.tasks().length;
  }

  get visibleTasks(): TaskItem[] {
    return this.tasks().filter(task => {
      const term = this.search.trim().toLowerCase();

      const matchesSearch =
        !term ||
        task.title.toLowerCase().includes(term) ||
        (task.description ?? '').toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === 'todas' ||
        (this.statusFilter === 'pendientes' && !task.completed) ||
        (this.statusFilter === 'completadas' && task.completed);

      const matchesPriority =
        this.priorityFilter === '' ||
        task.priority === Number(this.priorityFilter);

      const matchesCategory =
        this.categoryFilter === '' ||
        task.category === Number(this.categoryFilter);

      return matchesSearch && matchesStatus &&
        matchesPriority && matchesCategory;
    });
  }

  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filters: TaskFilters = {
      sortBy: this.sortBy
    };

    // Los filtros restantes se aplican en visibleTasks.
    this.taskService.getTasks(filters).subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.errorMessage.set(
          'No se pudieron cargar las tareas. Verifica que la API esté funcionando.'
        );
        this.loading.set(false);
      }
    });
  }

  emptyTask(): TaskItem {
    return {
      title: '',
      description: '',
      completed: false,
      priority: Priority.Media,
      category: Category.Personal,
      dueDate: ''
    };
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyTask();
    this.successMessage.set('');
    this.showModal = true;
  }

  openEdit(task: TaskItem): void {
    this.editingId = task.id ?? null;

    this.form = {
      ...task,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : ''
    };

    this.successMessage.set('');
    this.showModal = true;
  }

  saveTask(): void {
    if (!this.form.title.trim() || !this.form.dueDate || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload: TaskItem = {
      ...this.form,
      title: this.form.title.trim(),
      description: this.form.description?.trim() ?? '',
      dueDate: new Date(
        `${this.form.dueDate}T23:59:59`
      ).toISOString()
    };

    const request = this.editingId
      ? this.taskService.updateTask(this.editingId, payload)
      : this.taskService.createTask(payload);

    request.subscribe({
      next: () => {
        this.showModal = false;
        this.saving.set(false);
        this.successMessage.set(
          this.editingId
            ? 'Tarea actualizada correctamente.'
            : 'Tarea creada correctamente.'
        );
        this.loadTasks();
      },
      error: err => {
        console.error(err);
        this.errorMessage.set('No se pudo guardar la tarea.');
        this.saving.set(false);
      }
    });
  }

  toggleCompleted(task: TaskItem): void {
    if (!task.id) return;

    const updated = { ...task, completed: !task.completed };

    this.successMessage.set('');

    this.taskService.updateTask(task.id, updated).subscribe({
      next: () => {
        this.successMessage.set(
          updated.completed
            ? 'Tarea completada.'
            : 'Tarea marcada como pendiente.'
        );
        this.loadTasks();
      },
      error: err => {
        console.error(err);
        this.errorMessage.set('No se pudo actualizar el estado.');
      }
    });
  }

  confirmDelete(task: TaskItem): void {
    this.taskToDelete = task;
    this.showDeleteModal = true;
  }

  deleteTask(): void {
    const task = this.taskToDelete;

    if (!task?.id) return;

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.taskToDelete = null;
        this.successMessage.set('Tarea eliminada correctamente.');
        this.loadTasks();
      },
      error: err => {
        console.error(err);
        this.errorMessage.set('No se pudo eliminar la tarea.');
        this.showDeleteModal = false;
      }
    });
  }

  priorityLabel(value: Priority): string {
    return this.priorities.find(p => p.value === value)?.label ?? 'Media';
  }

  categoryLabel(value: Category): string {
    return this.categories.find(c => c.value === value)?.label ?? 'Personal';
  }

  priorityClass(value: Priority): string {
    switch (value) {
      case Priority.Alta:
        return 'bg-red-100 text-red-700';
      case Priority.Media:
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  }

  categoryClass(value: Category): string {
    switch (value) {
      case Category.Estudio:
        return 'bg-blue-100 text-blue-700';
      case Category.Trabajo:
        return 'bg-violet-100 text-violet-700';
      case Category.Personal:
        return 'bg-slate-100 text-slate-700';
      case Category.Salud:
        return 'bg-green-100 text-green-700';
      case Category.Deporte:
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-teal-100 text-teal-700';
    }
  }

  isOverdue(task: TaskItem): boolean {
    return !task.completed &&
      new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = 'todas';
    this.priorityFilter = '';
    this.categoryFilter = '';
    this.sortBy = 'fechaLimite';
    this.loadTasks();
  }
}
