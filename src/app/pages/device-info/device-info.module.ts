import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';

import { DeviceInfoPageRoutingModule } from './device-info-routing.module';
import { DeviceInfoPage } from './device-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeviceInfoPageRoutingModule,
  ],
  declarations: [DeviceInfoPage],
})
export class DeviceInfoPageModule {}

