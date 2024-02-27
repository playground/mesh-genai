import { Component, OnInit, OnDestroy, AfterViewInit, Renderer2, RendererFactory2, ChangeDetectorRef } from '@angular/core';
import { MeshGenaiService } from '../../services/mesh-genai.service';
import { initFlowbite } from 'flowbite';
import { Enum, Icon } from 'src/app/models/mesh-model';

declare const webkitSpeechRecognition: new () => any;

@Component({
  selector: 'app-genai',
  templateUrl: './genai.component.html',
  styleUrls: ['./genai.component.css']
})
export class GenaiComponent implements OnInit, OnDestroy, AfterViewInit {
  question = '';
  settings = {
    ragUrl: '',
    pdfUrl: ''
  };
  array: any;
  pdfLoader = {
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
      let settings = localStorage.getItem('settings');
      if(settings) {
        this.settings = JSON.parse(settings);
      }      
    } catch(e) {
      console.log(e)
    }
  }
  ngOnDestroy(): void {
    
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
    this.meshService.announcing({type: Enum.QUERY_IN_PROGRESS});
    console.log(question)
    this.meshService.post(this.settings.ragUrl, {input: question, config: {}})
    .subscribe({
      next: (res: any) => {
        console.log(typeof res == 'string')
        try {
          console.log(res)
          const scriptMarker = "```"
          let str = res.slice(res.indexOf('{"ops":[{"op":"add","path":"/logs/StrOutputParser/final_output"'), res.length)
          const endStr = '"}]}';
          str = str.slice(0, str.indexOf(endStr)+endStr.length)
          console.log(str)
          let str2 = str.replace(/```/g, '');
          str2 = str2.replace(/\\n/g, '<br>');
          let json = JSON.parse(str2);
          let output = json.ops[0].value.output;
          output = output.replace(/&/g, '&amp');
          output = output.replace(/<script/g, '&ltscript');
          output = output.replace(/<\/script>/g, '&lt/script&gt');
          if(output.indexOf('&ltscript') > 0) {
            output = output.replace(/&lt\/script&gt/g, '&lt\/script&gt</div>');
            output = output.replace(/&ltscript/g, '<div class="rounded-xl bg-slate-200">&ltscript')              
          }
          console.log(output)
          let el = <HTMLElement>document.querySelector('div.genai-response');
          if(el) {
            let div = this.renderer.createElement('div');
            div.setAttribute('class', 'block w-full mb-2');
            div.innerHTML = `<div class="flex flex-col text-sm"><div class="text-blue-600">Q:  ${this.question}</div><div class="indent-7 class="text-gray-600"">${output}</div></div>`;
            this.renderer.insertBefore(el, div, el.firstChild);
            
          }
          this.meshService.announcing({type: Enum.QUERY_COMPLETE});
        } catch(e) {
          console.log(e);
          this.meshService.announcing({type: Enum.QUERY_COMPLETE});
        }
      }
    })
  }
  uploadFile(evt: any) {
    const files = evt.target.files;
    const reader = new FileReader();
    reader.readAsArrayBuffer(files[0])
    reader.onload = (data:any) => {
      this.array =  this.meshService.arrayBufferToBase64(data.srcElement.result);
    }
  }
  upload() {
    this.meshService.announcing({type: Enum.QUERY_IN_PROGRESS});
    const input = {
      collection_name: this.pdfLoader.collectionName,
      source_name: this.pdfLoader.sourceName,
      chunk_size: this.pdfLoader.chunkSize,
      chunk_overlap: this.pdfLoader.chunkOverlap,
      text_query: this.pdfLoader.testQuery,
      source_data: this.array
    }
    this.meshService.post(this.settings.pdfUrl, {input: input, config: {}})
    .subscribe({
      next: (res: any) => {
        console.log(typeof res == 'string')
        try {
          console.log(res)
          this.meshService.announcing({type: Enum.QUERY_COMPLETE});
        } catch(e) {
          console.log(e);
          this.meshService.announcing({type: Enum.QUERY_COMPLETE});
        }
      }
    })
  }
  update() {
    localStorage.setItem('settings', JSON.stringify(this.settings));
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
}
