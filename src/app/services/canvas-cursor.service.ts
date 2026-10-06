import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CanvasCursorConfig } from '../components/canvas-cursor/canvas-cursor.component';

@Injectable({
  providedIn: 'root'
})
export class CanvasCursorService {
  private initialConfig: CanvasCursorConfig = {
    friction: 0.58,
    trails: 18,
    size: 26,
    dampening: 0.35,
    tension: 0.98,
    opacity: 0.22,
    colorMode: 'rainbow'
  };

  private configSubject = new BehaviorSubject<CanvasCursorConfig>(this.initialConfig);
  public config$ = this.configSubject.asObservable();

  public get currentConfig(): CanvasCursorConfig {
    return this.configSubject.value;
  }

  public updateConfig(partial: Partial<CanvasCursorConfig>): void {
    this.configSubject.next({
      ...this.configSubject.value,
      ...partial
    });
  }

  public resetConfig(): void {
    this.configSubject.next({ ...this.initialConfig });
  }
}
