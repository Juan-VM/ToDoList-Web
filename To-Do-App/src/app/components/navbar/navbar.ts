import { Component } from '@angular/core';

// Barra de navegación superior. Solo controla la apertura del menú de usuario.
@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html'
})
export class NavbarComponent {
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}