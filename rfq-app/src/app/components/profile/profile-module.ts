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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServiceAreasComponent } from "./service-areas/service-areas.component";

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
    RouterModule.forChild(routes),
    ServiceAreasComponent
]
})
export class ProfileModule { }
