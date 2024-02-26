import { Component, ChangeDetectorRef } from '@angular/core';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { ActivatedRoute, NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'mesh-genai';
  hilite = 'text-blue-700';
  normal = 'text-gray-900';
  liText: any = {
    home: this.hilite, 
    genai: this.normal, 
    services: this.normal, 
    contact: this.normal
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
  }
  ngOnInit(): void {
    initFlowbite();

    this.router.events.subscribe((route: any) => {
      if(route instanceof NavigationEnd) {
        if(route.url.indexOf('/genai') == 0) {
          this.setHiLite('genai');
        } else if(route.url.indexOf('/home') == 0) {
          this.setHiLite('home');
        } else {
          this.setHiLite('home');
        }
      }
    })
  }
  setHiLite(tab: string) {
    this.liText = {
      home: this.normal, 
      genai: this.normal, 
      services: this.normal, 
      contact: this.normal
    };
    this.liText[tab] = this.hilite;
  }
}
