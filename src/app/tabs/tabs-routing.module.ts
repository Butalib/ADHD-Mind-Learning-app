import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'playground',
        loadChildren: () =>
          import('../pages/playground/playground.module').then((m) => m.PlaygroundPageModule),
      },
      {
        path: 'studio',
        loadChildren: () =>
          import('../pages/studio/studio.module').then((m) => m.StudioPageModule),
      },
      {
        path: 'learning',
        loadChildren: () =>
          import('../pages/learning/learning.module').then((m) => m.LearningPageModule),
      },
      {
        path: 'device-info',
        loadChildren: () =>
          import('../pages/device-info/device-info.module').then((m) => m.DeviceInfoPageModule),
      },
      {
        path: '',
        redirectTo: '/tabs/playground',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/playground',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
