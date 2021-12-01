import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { AppRoutingModule } from './app-routing.module';
import { SafePipe } from './pipes/safe.pipe';
import { MintComponent } from './components/mint/mint.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KnightComponent } from './components/knight/knight.component';
import { RaffleComponent } from './components/raffle/raffle.component';
import { ShowComponent } from './components/show/show.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    HeaderComponent,
    SafePipe,
    MintComponent,
    KnightComponent,
    RaffleComponent,
    ShowComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }