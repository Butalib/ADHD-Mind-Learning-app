import { Component, OnInit } from '@angular/core';
import { CanvasCursorService } from './services/canvas-cursor.service';
import { CanvasCursorConfig } from './components/canvas-cursor/canvas-cursor.component';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  cursorConfig: CanvasCursorConfig;

  constructor(private cursorService: CanvasCursorService) {
    this.cursorConfig = this.cursorService.currentConfig;
    this.cursorService.config$.subscribe((cfg) => {
      this.cursorConfig = cfg;
    });
  }

  async ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#090b10' });
      } catch (e) {
        console.warn('StatusBar not available:', e);
      }

      try {
        await SplashScreen.hide();
      } catch (e) {
        console.warn('SplashScreen not available:', e);
      }
    }
  }
}
