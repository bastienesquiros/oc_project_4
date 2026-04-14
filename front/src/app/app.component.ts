import { Component, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SessionService } from './core/service/session.service';
import { CommonModule } from "@angular/common";
import { MaterialModule } from "./shared/material.module";

@Component({
  selector: 'app-root',
  imports: [CommonModule, MaterialModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private router = inject(Router);
  private sessionService = inject(SessionService);

  public isLogged = toSignal(this.sessionService.$isLogged(), { initialValue: false });

  public logout(): void {
    this.sessionService.logOut();
    this.router.navigate(['']);
  }
}
