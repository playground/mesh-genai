import { Component, OnInit, Renderer2, RendererFactory2 } from '@angular/core';
import { MeshGenaiService } from '../../services/mesh-genai.service';

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
    console.log(this.question)
    this.meshService.post(this.settings.ragUrl, {input: this.question, config: {}})
    .subscribe({
      next: (res: any) => {
        console.log(typeof res == 'string')
        try {
          console.log(res)
          let scripts: any[] = [];
          const scriptMarker = "```"
          let str = res.slice(res.indexOf('{"ops":[{"op":"add","path":"/logs/StrOutputParser/final_output"'), res.length)
          const endStr = '"}]}';
          str = str.slice(0, str.indexOf(endStr)+endStr.length)
          console.log(str)
          let str2 = str.replace(/\n/g, '<br>');
          //str = str.replace(/<\/script>\n```/g, '<\/script>\n${/token}');
          //str = str.replace(/```\n<script/g, '${token}\n<script')
          //console.log(str)
          let el = <HTMLElement>document.querySelector('div.genai-response');
          if(el) {
            let div = this.renderer.createElement('div');
            div.setAttribute('class', 'block w-full text-gray-900');
            div.innerText = this.question;
            this.renderer.appendChild(el, div);
            
            div = this.renderer.createElement('div');
            div.setAttribute('class', 'block w-full text-gray-900');
            div.innerHTML = str2;
            this.renderer.appendChild(el, div);
          }
          //let tmpStr = '';
          //let script = '';
          //tmpStr = str.slice(str.indexOf(scriptMarker)+scriptMarker.length, str.length)
          //console.log(str.indexOf(scriptMarker))
          //console.log(tmpStr)
          //if(tmpStr.length > 0) {
          //  do {
          //    console.log(tmpStr)
          //    script = tmpStr.slice(0, tmpStr.indexOf(scriptMarker)+scriptMarker.length)
          //    console.log(script)
          //    scripts.push(script)  
          //    tmpStr = tmpStr.replace(script, '${token}')  
          //  } while(tmpStr.indexOf(scriptMarker) >= 0)
          //}
          console.log(scripts)
        } catch(e) {
          console.log(e);
        }
      }
    })
  }
  upload() {
    console.log('upload')
  }
  update() {
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }
}
