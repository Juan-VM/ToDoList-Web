
import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar';
import { TaskListComponent } from './components/task-list/task-list';
import { FooterComponent } from './components/footer/footer';

/**
  Componente raíz: solo arma la estructura de la página.
  El contenido y la lógica de las tareas viven en TaskListComponent.
*/
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    TaskListComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
