
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

/**
  Componente principal de la aplicación.
 
  Se encarga de:
  - Pedir las tareas a la API mediante TaskService.
  - Guardar el estado de la pantalla (lista, filtros, modales, mensajes).
  - Crear, editar, completar y eliminar tareas.
 
  El estado que cambia por una respuesta HTTP se maneja con "signals"
  (tasks, loading, saving, errorMessage, successMessage). Así Angular sabe
  que debe volver a dibujar la pantalla cuando llega la respuesta de la API.
 */
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html'
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);

  tasks = signal<TaskItem[]>([]);      // Lista de tareas recibida de la API
  loading = signal(false);             // true mientras se cargan las tareas
  saving = signal(false);              // true mientras se guarda una tarea
  errorMessage = signal('');           // Mensaje de error visible al usuario
  successMessage = signal('');         // Mensaje de éxito visible al usuario

  // ---- Filtros de la pantalla ----
  // Se aplican localmente en "visibleTasks", sin volver a llamar a la API.
  search = '';
  statusFilter = 'todas';              // 'todas' | 'pendientes' | 'completadas'
  priorityFilter = '';
  categoryFilter = '';
  sortBy = 'fechaLimite';              // Sí se envía a la API para ordenar

  // ---- Control de los modales ----
  showModal = false;                   // Modal de crear/editar
  showDeleteModal = false;             // Modal de confirmación de borrado
  editingId: string | null = null;     // null = crear, con id = editar
  taskToDelete: TaskItem | null = null;

  // Opciones que se muestran en los selects del formulario y de los filtros.
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

  // Al iniciar el componente se cargan las tareas de la API.
  ngOnInit(): void {
    this.loadTasks();
  }

  // ---- Contadores calculados a partir de la lista ----
  get pendingCount(): number {
    return this.tasks().filter(t => !t.completed).length;
  }

  get completedCount(): number {
    return this.tasks().filter(t => t.completed).length;
  }

  get totalCount(): number {
    return this.tasks().length;
  }

  /**
    Lista que realmente se muestra en pantalla.
    Aplica búsqueda y filtros de estado, prioridad y categoría.
  */
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

  /**
    Pide todas las tareas a la API y actualiza el estado.
    Solo se envía "sortBy"; los demás filtros se aplican en visibleTasks().
  */
  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const filters: TaskFilters = {
      sortBy: this.sortBy
    };

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

  // Devuelve un formulario vacío con valores por defecto.
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

  // Abre el modal en modo "crear" con el formulario limpio.
  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyTask();
    this.successMessage.set('');
    this.showModal = true;
  }

  // Abre el modal en modo "editar" precargando los datos de la tarea.
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

  /**
    Guarda el formulario: crea una tarea nueva o actualiza la existente.
    Si editingId tiene valor se hace PUT; si no, POST.
   */
  saveTask(): void {
    if (!this.form.title.trim() || !this.form.dueDate || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    // Se arma el objeto final que se enviará a la API.
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
        this.loadTasks(); // Recarga para reflejar el cambio en la lista
      },
      error: err => {
        console.error(err);
        this.errorMessage.set('No se pudo guardar la tarea.');
        this.saving.set(false);
      }
    });
  }

  // Cambia el estado completada/pendiente y guarda el cambio en la API.
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

  // Guarda la tarea seleccionada y abre el modal de confirmación.
  confirmDelete(task: TaskItem): void {
    this.taskToDelete = task;
    this.showDeleteModal = true;
  }

  // Elimina en la API la tarea confirmada y recarga la lista.
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

  // ---- Esto de aqui es parte de la configuracion de colores de etiquetas y asi ----
  // Lo traia el estilo de tailwind

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

  // Una tarea está vencida si no está completada y su fecha ya pasó.
  isOverdue(task: TaskItem): boolean {
    return !task.completed &&
      new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
  }

  // Restablece todos los filtros y vuelve a pedir la lista ordenada.
  clearFilters(): void {
    this.search = '';
    this.statusFilter = 'todas';
    this.priorityFilter = '';
    this.categoryFilter = '';
    this.sortBy = 'fechaLimite';
    this.loadTasks();
  }
}
