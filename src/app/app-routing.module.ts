import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenaiComponent } from './components/genai/genai.component';
import { HomeComponent } from './components/home/home.component';
import { LangchainJsComponent } from './components/langchain-js/langchain-js.component';

const routes: Routes = [
  { path: 'genai', component: GenaiComponent },
  { path: 'home', component: HomeComponent },
  { path: 'langchain-js', component: LangchainJsComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
