import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MintComponent } from './components/mint/mint.component';
import { RaffleComponent } from './components/raffle/raffle.component';
import { ShowComponent } from './components/show/show.component';

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'mint', component: MintComponent},
  { path: 'raffle', component: RaffleComponent},
  { path: 'k/:tokenId', component: ShowComponent},
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }