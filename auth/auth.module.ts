import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ConnectComponent } from './connect/connect.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { LiquidityComponent } from './liquidity/liquidity.component';
import { SearchComponent } from './search/search.component';
import { SwapComponent } from './swap/swap.component';
import { ProfileUploadComponent } from './profile-upload/profile-upload.component';
const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      {
        path: 'connect',
        component: ConnectComponent
      },
      {
        path: 'liquidity',
        component: LiquidityComponent
      },
      {
        path: 'search',
        component: SearchComponent
      },
      {
        path: 'swap',
        component: SwapComponent
      },
      {
        path: 'upload',
        component: ProfileUploadComponent
      },
    ]
  }
]

@NgModule({
  declarations: [ConnectComponent,
    HomeComponent,
    LiquidityComponent,
    SearchComponent,
    SwapComponent,
    ProfileUploadComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    HttpClientModule
  ], exports: [RouterModule],
  entryComponents: [HomeComponent]
})
export class AuthModule { }
