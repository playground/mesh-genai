import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { MeshGenaiService } from './services/mesh-genai.service';
import { Enum } from './models/mesh-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'mesh-genai';
  hilite = 'text-blue-700';
  normal = 'text-gray-900';
  liText: any = {
    home: this.hilite, 
    genai: this.normal, 
    langchainJS: this.normal, 
    contact: this.normal
  };
  agentListener!: { unsubscribe: () => void };
  queryInProgress = false; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meshService: MeshGenaiService,
    private cd: ChangeDetectorRef
  ) {
  }
  ngOnInit(): void {
    initFlowbite();

    this.router.events.subscribe((route: any) => {
      if(route instanceof NavigationEnd) {
        if(route.url.indexOf('/genai') == 0) {
          this.setHiLite('genai');
        } else if(route.url.indexOf('/langchain-js') == 0) {
          this.setHiLite('langchainJS');
        } else if(route.url.indexOf('/home') == 0) {
          this.setHiLite('home');
        } else {
          this.setHiLite('home');
        }
      }
    })

    this.agentListener = this.meshService.announcingAgent.subscribe((data: any) => {
      if(data.type == Enum.QUERY_IN_PROGRESS) {
        this.queryInProgress = true;
      } else if(data.type == Enum.QUERY_COMPLETE) {
        this.queryInProgress = false;
      }
    })
  }
  ngOnDestroy(): void {
    if(this.agentListener) {
      this.agentListener.unsubscribe();
    }
  }
  setHiLite(tab: string) {
    this.liText = {
      home: this.normal, 
      genai: this.normal, 
      langchainJS: this.normal, 
      contact: this.normal
    };
    this.liText[tab] = this.hilite;
  }
  navigate(path: string) {
    this.router.navigateByUrl(path);
  }
}
