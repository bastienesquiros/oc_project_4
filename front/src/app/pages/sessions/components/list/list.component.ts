import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';
import { SessionService } from '../../../../core/service/session.service';
import { Session } from '../../../../core/models/session.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { MaterialModule } from "../../../../shared/material.module";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-list',
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {
  private sessionApiService = inject(SessionApiService);
  private sessionService = inject(SessionService);

  public sessions = toSignal(this.sessionApiService.all(), { initialValue: [] as Session[] });

  get user(): SessionInformation | undefined {
    return this.sessionService.sessionInformation;
  }
}
