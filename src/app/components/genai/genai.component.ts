import { Component, OnInit, Renderer2, RendererFactory2 } from '@angular/core';
import { MeshGenaiService } from '../../services/mesh-genai.service';
import { initFlowbite } from 'flowbite';
import { Enum } from 'src/app/models/mesh-model';

@Component({
  selector: 'app-genai',
  templateUrl: './genai.component.html',
  styleUrls: ['./genai.component.css']
})
export class GenaiComponent implements OnInit {
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

  constructor(
    private meshService: MeshGenaiService,
    private rendererFactory: RendererFactory2
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
  query() {
    this.meshService.announcing({type: Enum.QUERY_IN_PROGRESS});
    console.log(this.question)
    this.meshService.post(this.settings.ragUrl, {input: this.question, config: {}})
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
            this.renderer.appendChild(el, div);
            
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
}
