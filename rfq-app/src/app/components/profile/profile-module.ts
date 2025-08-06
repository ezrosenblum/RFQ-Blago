import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile';
import { ProfileOverviewComponent } from './profile-overview/profile-overview';
import { ProfileSettingsComponent } from './profile-settings/profile-settings';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Routes } from '@angular/router';
import { MaterialCategoriesSelectionComponent } from './material-categories-selection/material-categories-selection.component';
import { SharedModule } from '../../shared/shared-module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServiceAreasComponent } from "./service-areas/service-areas.component";
import { TranslateModule } from '@ngx-translate/core';
const routes: Routes = [
  {
    path: '',
    component: ProfileComponent
  }
];


@NgModule({
  declarations: [
    ProfileComponent,
    ProfileOverviewComponent,
    ProfileSettingsComponent,
    MaterialCategoriesSelectionComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    SharedModule,
    ServiceAreasComponent,
    TranslateModule,
    RouterModule.forChild(routes),
]
})
export class ProfileModule { }
