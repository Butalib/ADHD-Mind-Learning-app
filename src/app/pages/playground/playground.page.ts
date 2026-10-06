import { Component, OnInit, OnDestroy } from '@angular/core';
import { CanvasCursorService } from '../../services/canvas-cursor.service';
import { CanvasCursorConfig } from '../../components/canvas-cursor/canvas-cursor.component';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.page.html',
  styleUrls: ['./playground.page.scss'],
  standalone: false,
})
export class PlaygroundPage implements OnInit, OnDestroy {
  pointer = { x: 0, y: 0 };
  isInteracting = false;
  showHud = true;
  currentMode: CanvasCursorConfig['colorMode'] = 'rainbow';

  private modes: CanvasCursorConfig['colorMode'][] = ['rainbow', 'cyan', 'purple', 'gold'];
  private modeIndex = 0;
  private moveListener?: (e: MouseEvent | TouchEvent) => void;

  constructor(private cursorService: CanvasCursorService) {
    this.currentMode = this.cursorService.currentConfig.colorMode;
  }

  ngOnInit(): void {
    this.moveListener = (e: MouseEvent | TouchEvent) => {
      this.isInteracting = true;
      if ('touches' in e && e.touches.length > 0) {
        this.pointer.x = Math.round(e.touches[0].clientX);
        this.pointer.y = Math.round(e.touches[0].clientY);
      } else if ('clientX' in e) {
        this.pointer.x = Math.round(e.clientX);
        this.pointer.y = Math.round(e.clientY);
      }
    };

    window.addEventListener('mousemove', this.moveListener, { passive: true });
    window.addEventListener('touchmove', this.moveListener, { passive: true });
  }

  ngOnDestroy(): void {
    if (this.moveListener) {
      window.removeEventListener('mousemove', this.moveListener);
      window.removeEventListener('touchmove', this.moveListener);
    }
  }

  toggleColorMode(): void {
    this.modeIndex = (this.modeIndex + 1) % this.modes.length;
    this.currentMode = this.modes[this.modeIndex];
    this.cursorService.updateConfig({ colorMode: this.currentMode });
  }

  toggleHud(): void {
    this.showHud = !this.showHud;
  }

  getModeLabel(): string {
    switch (this.currentMode) {
      case 'rainbow': return 'Rainbow Glow 🌈';
      case 'cyan': return 'Neon Cyan ⚡';
      case 'purple': return 'Deep Violet 🔮';
      case 'gold': return 'Golden Amber ✨';
      default: return 'Active';
    }
  }
}

