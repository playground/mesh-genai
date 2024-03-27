import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GenaiComponent } from './components/genai/genai.component';
import { HomeComponent } from './components/home/home.component';
import { LangchainJsComponent } from './components/langchain-js/langchain-js.component';

@NgModule({
  declarations: [
    AppComponent,
    GenaiComponent,
    HomeComponent,
    LangchainJsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
