import { Component, OnInit } from '@angular/core';
import { CanvasCursorService } from '../../services/canvas-cursor.service';
import { CanvasCursorConfig } from '../../components/canvas-cursor/canvas-cursor.component';
import { AudioPlayerService, AudioTrack, LoopMode } from '../../services/audio-player.service';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-studio',
  templateUrl: './studio.page.html',
  styleUrls: ['./studio.page.scss'],
  standalone: false,
})
export class StudioPage implements OnInit {
  config: CanvasCursorConfig;
  platformName: string = 'Web Browser';
  isNative: boolean = false;
  pointerPos = { x: 0, y: 0 };
  showSimulatorSplash = false;

  // Audio observables
  playlist$: Observable<AudioTrack[]>;
  currentTrackIndex$: Observable<number>;
  isPlaying$: Observable<boolean>;
  currentTime$: Observable<number>;
  duration$: Observable<number>;
  volume$: Observable<number>;
  loopMode$: Observable<LoopMode>;

  colorModes: Array<{ label: string; value: CanvasCursorConfig['colorMode']; color: string }> = [
    { label: 'قوس قزح (Rainbow)', value: 'rainbow', color: 'linear-gradient(90deg, #ff007f, #00f0ff)' },
    { label: 'نيون سماوي (Cyan)', value: 'cyan', color: '#00f0ff' },
    { label: 'بنفسجي متوهج (Purple)', value: 'purple', color: '#a855f7' },
    { label: 'ذهبي ناري (Gold)', value: 'gold', color: '#eab308' },
  ];

  constructor(
    private cursorService: CanvasCursorService,
    public audioService: AudioPlayerService
  ) {
    this.config = this.cursorService.currentConfig;
    this.playlist$ = this.audioService.playlist$;
    this.currentTrackIndex$ = this.audioService.currentTrackIndex$;
    this.isPlaying$ = this.audioService.isPlaying$;
    this.currentTime$ = this.audioService.currentTime$;
    this.duration$ = this.audioService.duration$;
    this.volume$ = this.audioService.volume$;
    this.loopMode$ = this.audioService.loopMode$;
  }

  ngOnInit() {
    this.isNative = Capacitor.isNativePlatform();
    this.platformName = Capacitor.getPlatform().toUpperCase();

    window.addEventListener('mousemove', (e) => {
      this.pointerPos.x = Math.round(e.clientX);
      this.pointerPos.y = Math.round(e.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.pointerPos.x = Math.round(e.touches[0].clientX);
        this.pointerPos.y = Math.round(e.touches[0].clientY);
      }
    }, { passive: true });
  }

  // Canvas Settings
  onTrailsChange(event: any) {
    const trails = parseInt(event.detail.value, 10);
    this.cursorService.updateConfig({ trails });
    this.config = this.cursorService.currentConfig;
  }

  onFrictionChange(event: any) {
    const friction = parseFloat(event.detail.value);
    this.cursorService.updateConfig({ friction });
    this.config = this.cursorService.currentConfig;
  }

  onTensionChange(event: any) {
    const tension = parseFloat(event.detail.value);
    this.cursorService.updateConfig({ tension });
    this.config = this.cursorService.currentConfig;
  }

  onOpacityChange(event: any) {
    const opacity = parseFloat(event.detail.value);
    this.cursorService.updateConfig({ opacity });
    this.config = this.cursorService.currentConfig;
  }

  setColorMode(mode: CanvasCursorConfig['colorMode']) {
    this.cursorService.updateConfig({ colorMode: mode });
    this.config = this.cursorService.currentConfig;
  }

  resetSettings() {
    this.cursorService.resetConfig();
    this.config = this.cursorService.currentConfig;
  }

  async triggerSplash() {
    if (this.isNative) {
      await SplashScreen.show({
        autoHide: true,
        showDuration: 2500,
      });
    } else {
      this.showSimulatorSplash = true;
      setTimeout(() => {
        this.showSimulatorSplash = false;
      }, 2500);
    }
  }

  // Audio Controls
  toggleAudio() {
    this.audioService.togglePlay();
  }

  nextTrack() {
    this.audioService.next();
  }

  prevTrack() {
    this.audioService.previous();
  }

  onSeek(event: any) {
    const val = parseFloat(event.detail.value);
    this.audioService.seek(val);
  }

  onVolumeChange(event: any) {
    const val = parseFloat(event.detail.value);
    this.audioService.setVolume(val);
  }

  toggleLoop() {
    this.audioService.toggleLoopMode();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.audioService.addCustomFiles(input.files);
      // Reset input value so same files can be selected again if needed
      input.value = '';
    }
  }

  playTrackAt(index: number) {
    this.audioService.playTrackAtIndex(index);
  }

  moveTrackUp(event: Event, index: number) {
    event.stopPropagation();
    if (index > 0) {
      this.audioService.moveTrack(index, index - 1);
    }
  }

  moveTrackDown(event: Event, index: number, total: number) {
    event.stopPropagation();
    if (index < total - 1) {
      this.audioService.moveTrack(index, index + 1);
    }
  }

  removeTrack(event: Event, index: number) {
    event.stopPropagation();
    this.audioService.removeTrack(index);
  }

  formatTime(seconds: number | null): string {
    if (seconds == null || isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
