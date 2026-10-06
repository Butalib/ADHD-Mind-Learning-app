import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  url: string;
  isCustom?: boolean;
  duration?: number;
}

export type LoopMode = 'none' | 'one' | 'all';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  private audio: HTMLAudioElement;

  private defaultTrack: AudioTrack = {
    id: 'default-track-1',
    title: 'TARARARA SONG',
    artist: 'Focus & Study Flow',
    url: 'assets/music/TARARARA SONG.mp3',
    isCustom: false,
  };

  private playlistSubject = new BehaviorSubject<AudioTrack[]>([this.defaultTrack]);
  public playlist$ = this.playlistSubject.asObservable();

  private currentTrackIndexSubject = new BehaviorSubject<number>(0);
  public currentTrackIndex$ = this.currentTrackIndexSubject.asObservable();

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  public isPlaying$ = this.isPlayingSubject.asObservable();

  private currentTimeSubject = new BehaviorSubject<number>(0);
  public currentTime$ = this.currentTimeSubject.asObservable();

  private durationSubject = new BehaviorSubject<number>(0);
  public duration$ = this.durationSubject.asObservable();

  private volumeSubject = new BehaviorSubject<number>(0.7);
  public volume$ = this.volumeSubject.asObservable();

  private loopModeSubject = new BehaviorSubject<LoopMode>('all');
  public loopMode$ = this.loopModeSubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.volume = this.volumeSubject.value;

    this.initAudioListeners();
    this.loadTrack(0, false);
  }

  public get playlist(): AudioTrack[] {
    return this.playlistSubject.value;
  }

  public get currentTrack(): AudioTrack | null {
    const list = this.playlist;
    const idx = this.currentTrackIndexSubject.value;
    return list[idx] || null;
  }

  public get loopMode(): LoopMode {
    return this.loopModeSubject.value;
  }

  private initAudioListeners(): void {
    this.audio.addEventListener('timeupdate', () => {
      this.ngZone.run(() => {
        this.currentTimeSubject.next(this.audio.currentTime || 0);
      });
    });

    this.audio.addEventListener('durationchange', () => {
      this.ngZone.run(() => {
        this.durationSubject.next(this.audio.duration || 0);
      });
    });

    this.audio.addEventListener('ended', () => {
      this.ngZone.run(() => {
        this.handleTrackEnded();
      });
    });

    this.audio.addEventListener('play', () => {
      this.ngZone.run(() => {
        this.isPlayingSubject.next(true);
      });
    });

    this.audio.addEventListener('pause', () => {
      this.ngZone.run(() => {
        this.isPlayingSubject.next(false);
      });
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.ngZone.run(() => {
        this.isPlayingSubject.next(false);
      });
    });
  }

  private loadTrack(index: number, autoPlay: boolean = true): void {
    const list = this.playlist;
    if (index < 0 || index >= list.length) return;

    this.currentTrackIndexSubject.next(index);
    const track = list[index];

    this.audio.src = encodeURI(track.url);
    this.audio.load();

    if (autoPlay) {
      this.audio.play().catch((err) => {
        console.warn('Autoplay prevented or failed:', err);
      });
    }
  }

  private handleTrackEnded(): void {
    const mode = this.loopMode;
    const list = this.playlist;
    const currentIndex = this.currentTrackIndexSubject.value;

    if (mode === 'one') {
      this.audio.currentTime = 0;
      this.audio.play();
    } else if (mode === 'all') {
      const nextIndex = (currentIndex + 1) % list.length;
      this.loadTrack(nextIndex, true);
    } else {
      // mode === 'none'
      if (currentIndex + 1 < list.length) {
        this.loadTrack(currentIndex + 1, true);
      } else {
        this.isPlayingSubject.next(false);
      }
    }
  }

  public togglePlay(): void {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  public play(): void {
    if (!this.audio.src && this.currentTrack) {
      this.loadTrack(this.currentTrackIndexSubject.value, true);
      return;
    }
    this.audio.play().catch((err) => {
      console.warn('Play was prevented:', err);
    });
  }

  public pause(): void {
    this.audio.pause();
  }

  public next(): void {
    const list = this.playlist;
    if (list.length === 0) return;
    const nextIdx = (this.currentTrackIndexSubject.value + 1) % list.length;
    this.loadTrack(nextIdx, true);
  }

  public previous(): void {
    const list = this.playlist;
    if (list.length === 0) return;

    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }

    const prevIdx = (this.currentTrackIndexSubject.value - 1 + list.length) % list.length;
    this.loadTrack(prevIdx, true);
  }

  public seek(seconds: number): void {
    if (!isNaN(seconds) && isFinite(seconds)) {
      this.audio.currentTime = seconds;
      this.currentTimeSubject.next(seconds);
    }
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.audio.volume = clamped;
    this.volumeSubject.next(clamped);
  }

  public toggleLoopMode(): void {
    const current = this.loopMode;
    let nextMode: LoopMode = 'all';
    if (current === 'all') nextMode = 'one';
    else if (current === 'one') nextMode = 'none';
    else nextMode = 'all';

    this.loopModeSubject.next(nextMode);
  }

  public playTrackAtIndex(index: number): void {
    this.loadTrack(index, true);
  }

  public addCustomFiles(files: FileList | File[]): void {
    const newTracks: AudioTrack[] = [];
    const list = Array.from(files);

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      const objectUrl = URL.createObjectURL(file);
      // Clean file name
      const title = file.name.replace(/\.[^/.]+$/, '');
      newTracks.push({
        id: `custom-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        title: title,
        artist: 'ملف محلي',
        url: objectUrl,
        isCustom: true,
      });
    }

    if (newTracks.length > 0) {
      const updated = [...this.playlist, ...newTracks];
      this.playlistSubject.next(updated);
    }
  }

  public removeTrack(index: number): void {
    const list = [...this.playlist];
    if (index < 0 || index >= list.length) return;

    const removed = list.splice(index, 1)[0];
    if (removed.isCustom && removed.url.startsWith('blob:')) {
      URL.revokeObjectURL(removed.url);
    }

    this.playlistSubject.next(list);

    const currentIdx = this.currentTrackIndexSubject.value;
    if (index === currentIdx) {
      if (list.length > 0) {
        const nextIdx = Math.min(index, list.length - 1);
        this.loadTrack(nextIdx, this.isPlayingSubject.value);
      } else {
        this.audio.pause();
        this.audio.src = '';
        this.isPlayingSubject.next(false);
      }
    } else if (index < currentIdx) {
      this.currentTrackIndexSubject.next(currentIdx - 1);
    }
  }

  public moveTrack(fromIndex: number, toIndex: number): void {
    const list = [...this.playlist];
    if (
      fromIndex < 0 ||
      fromIndex >= list.length ||
      toIndex < 0 ||
      toIndex >= list.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const currentIdx = this.currentTrackIndexSubject.value;
    const currentTrackId = list[currentIdx]?.id;

    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);

    this.playlistSubject.next(list);

    // Keep active track index updated
    const newCurrentIdx = list.findIndex((t) => t.id === currentTrackId);
    if (newCurrentIdx !== -1) {
      this.currentTrackIndexSubject.next(newCurrentIdx);
    }
  }
}

