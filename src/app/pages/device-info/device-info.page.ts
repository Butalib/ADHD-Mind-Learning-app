import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-device-info',
  templateUrl: './device-info.page.html',
  styleUrls: ['./device-info.page.scss'],
  standalone: false,
})
export class DeviceInfoPage implements OnInit {
  appInfo = {
    name: 'SMind Cursor',
    appId: 'com.smind.canvascursor',
    version: '1.0.0',
    angularVersion: '22.1.7',
    ionicVersion: '9.0.0',
    capacitorVersion: '8.x',
  };

  platformInfo = {
    name: 'Web Browser',
    isNative: false,
    userAgent: '',
    screenResolution: '',
  };

  pluginsStatus = [
    { name: '@capacitor/core', status: 'مثبت ومفعل', ready: true },
    { name: '@capacitor/android', status: 'بيئة الأندرويد مجهزة', ready: true },
    { name: '@capacitor/splash-screen', status: 'شاشة البداية مجهزة', ready: true },
    { name: '@capacitor/status-bar', status: 'شريط الحالة مخصص', ready: true },
    { name: '@capacitor/assets', status: 'أداة توليد المقاسات جاهزة', ready: true },
  ];

  ngOnInit() {
    this.platformInfo.isNative = Capacitor.isNativePlatform();
    this.platformInfo.name = Capacitor.getPlatform().toUpperCase();
    this.platformInfo.userAgent = navigator.userAgent;
    this.platformInfo.screenResolution = `${window.innerWidth} x ${window.innerHeight} (DPR: ${window.devicePixelRatio || 1})`;
  }

  async testSplash() {
    if (this.platformInfo.isNative) {
      await SplashScreen.show({ autoHide: true, showDuration: 2000 });
    } else {
      alert('الـ Splash Screen يعمل تلقائياً عند فتح التطبيق على الموبايل! كما يمكنك تجربة محاكاته من شاشة الإعدادات.');
    }
  }
}

