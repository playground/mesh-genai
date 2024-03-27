import { Component, Renderer2, OnInit, AfterViewInit, RendererFactory2, ChangeDetectorRef } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { Enum, Icon } from 'src/app/models/mesh-model';
import { MeshGenaiService } from 'src/app/services/mesh-genai.service';

declare const webkitSpeechRecognition: new () => any;

@Component({
  selector: 'app-langchain-js',
  templateUrl: './langchain-js.component.html',
  styleUrls: ['./langchain-js.component.css']
})
export class LangchainJsComponent implements OnInit, AfterViewInit {
  collection = '';
  webUrl = '';
  question = '';
  settings = {
    langchainUrl: '',
  };
  formData: FormData = new FormData();
  array: any;
  allLoader = {
    collectionName: '',
    sourceName: '',
    sourceData: '',
    chunkSize: 400,
    chunkOverlap: 50,
    testQuery: ''
  };
  renderer: Renderer2;
  micIcon: HTMLElement | undefined;
  icon = Icon;
  recognizing = false;
  askMe = 'askMe';
  queryUrl: any = {};

  constructor(
    private meshService: MeshGenaiService,
    private rendererFactory: RendererFactory2,
    private cd: ChangeDetectorRef
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  ngOnInit(): void {
    initFlowbite();
    try {
      let settings = localStorage.getItem('langchain-js-settings');
      if(settings) {
        this.settings = JSON.parse(settings);
      }
      this.queryUrl = {
        askMe: `${this.settings.langchainUrl}/askHF`,
        askWeb: `${this.settings.langchainUrl}/askWeb`,
        upload: `${this.settings.langchainUrl}/upload`,
      }      
    } catch(e) {
      console.log(e)
    }
  }
  ngAfterViewInit(): void {
    if(!this.micIcon) {
      this.micIcon = <HTMLElement>document.querySelector('span.mic-icon')
      this.toggleMic(false);
    }      
  }
  toggleMic(on = false) {
    if(this.micIcon) {
      this.micIcon.innerHTML = on ? this.icon.micOn : this.icon.micOff;
      this.recognizing = on;
    }
  }
  query(question = this.question) {
    if(this.askMe == 'askAgent') {
      this.insertContent('Agent not yet available, coming soon...');
    }
    this.meshService.announcing({type: Enum.QUERY_IN_PROGRESS});
    console.log(question)
    const url = this.askMe == 'askMe' ? `${this.queryUrl[this.askMe]}?collection=${this.collection}&query=${this.question}` :
    `${this.queryUrl[this.askMe]}?url=${this.webUrl}&query=${this.question}`
    this.meshService.get(url)
    .subscribe({
      next: (res: any) => {
        console.log(typeof res == 'string')
        try {
          console.log(res)
          const answer = JSON.parse(res);
          console.log(answer)
          this.insertContent(answer);
          //let el = <HTMLElement>document.querySelector('div.genai-response');
          //if(el) {
          //  let div = this.renderer.createElement('div');
          //  div.setAttribute('class', 'block w-full mb-2');
          //  div.innerHTML = `<div class="flex flex-col text-sm"><div class="text-blue-600">Q:  ${this.question}</div><div class="indent-7 class="text-gray-600"">${answer.message.text || answer.message.answer}</div></div>`;
          //  this.renderer.insertBefore(el, div, el.firstChild);
          //}
          this.meshService.announcing({type: Enum.QUERY_COMPLETE});
        } catch(e) {
          console.log(e);
          this.meshService.announcing({type: Enum.QUERY_COMPLETE});
        }
      }
    })
  }
  insertContent(content: any, target = 'div.genai-response', question = this.question) {
    let el = <HTMLElement>document.querySelector(target);
    if(el) {
      let div = this.renderer.createElement('div');
      div.setAttribute('class', 'block w-full mb-2');
      const Q = this.askMe == 'askAgent' || question.length == 0 ? '->' : 'Q:'
      div.innerHTML = `<div class="flex flex-col text-sm"><div class="text-blue-600">${Q}  ${question}</div><div class="indent-7 class="text-gray-600"">${content.message ? content.message.text || content.message.answer : content}</div></div>`;
      this.renderer.insertBefore(el, div, el.firstChild);
    }
  }
  uploadFile(evt: any) {
    const files = evt.target.files;
    const reader = new FileReader();
    this.formData = new FormData();
    Object.keys(files).forEach((key) => {
      this.formData?.append('sourceData', files[key]);
    });
  }
  upload() {
    this.meshService.announcing({type: Enum.QUERY_IN_PROGRESS});
    const input = {
      collectionName: this.allLoader.collectionName,
      sourceName: this.allLoader.sourceName,
      chunkSize: this.allLoader.chunkSize,
      chunkOverlap: this.allLoader.chunkOverlap,
      textQuery: this.allLoader.testQuery,
    }
    this.formData?.append('input', JSON.stringify(input))
    this.meshService.postFormData(this.queryUrl.upload, this.formData)
    .subscribe({
      next: (res: any) => {
        console.log(typeof res == 'string')
        try {
          console.log(res)
          const answer = JSON.parse(res);
          const html = `<div>${answer.message.upload}<br>Test query:  ${input.textQuery}<br>Response:  ${answer.message.text}</div>`;
          this.insertContent(html, 'div.genai-upload-response', '');
          this.meshService.announcing({type: Enum.QUERY_COMPLETE});
        } catch(e) {
          console.log(e);
          this.meshService.announcing({type: Enum.QUERY_COMPLETE});
        }
      }
    })
  }
  update() {
    localStorage.setItem('langchain-js-settings', JSON.stringify(this.settings));
  }
  talkToMe() {
    if(!this.micIcon) {
      this.micIcon = <HTMLElement>document.querySelector('span.mic-icon')
    }
    if (this.recognizing) {
      this.toggleMic(false)
      //this.queryIcon.innerHTML = this.icons.micOff;
      //this.recognizing = false;
      //this.queryIcon.style.setProperty('color', 'gray');
      return;
    }
    if (webkitSpeechRecognition) {
      let recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      let message = '';

      recognition.onstart = () => {
        this.toggleMic(true)
        //this.queryIcon.innerHTML = this.icons.micOn;
        //this.recognizing = true;
        this.micIcon!.style.setProperty('color', 'red');
      };

      recognition.onerror = (event: any) => {
        if (event.error == 'no-speech') {
        }
        if (event.error == 'audio-capture') {
        }
        if (event.error == 'not-allowed') {
        }
      };

      recognition.onend = () => {
        this.toggleMic(false);
        //this.queryIcon.innerHTML = this.icons.micOff;
        //this.recognizing = false;
        this.micIcon!.style.setProperty('color', 'gray');
      };

      recognition.onresult = (event: any) => {
        let interim_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            message += event.results[i][0].transcript;
            this.question = message
            this.cd.detectChanges();
            this.query(message);
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }
      };

      recognition.start();
    }
  }
  onChange(evt: any) {
    this.askMe = evt.currentTarget.value;
    if(this.askMe == 'askAgent') {
      this.insertContent('Agent not yet available, coming soon...');
    }  
  }
}
