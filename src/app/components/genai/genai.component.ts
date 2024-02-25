import { Component } from '@angular/core';

@Component({
  selector: 'app-genai',
  templateUrl: './genai.component.html',
  styleUrls: ['./genai.component.css']
})
export class GenaiComponent {
  question = '';

  constructor() {}

  query() {
    console.log(this.question)
  }
}
