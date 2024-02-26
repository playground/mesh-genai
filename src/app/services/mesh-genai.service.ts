import { Injectable, EventEmitter, Output } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

export interface Announcing {
  type: string;
  payload?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MeshGenaiService {
  @Output() announcingAgent = new EventEmitter<Announcing>();
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }

  post2(url: string, body: any) {
    return new Observable((observer) => {
      const options = { headers: new HttpHeaders({ 'Content-Type':
  'application/json', 'Access-Control-Allow-Headers': 'Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'})};
      this.http.post(url, body, options)
      .pipe(catchError((error: any, caught: Observable<any>): Observable<any> => {
        console.error(error)
        return of();
      }))
      .subscribe((response) => {
        observer.next(response);
        observer.complete();
      })        
    })
  }
  post(url: string, body: any) {
    return new Observable((observer) => {
      const raw = JSON.stringify(body);
      const headers = new Headers({
        'Content-Type': 'application/json'
      });
      const options: any = {
        method: 'POST',
        headers: headers,
        body: raw,
        redirect: 'follow'
      }
      fetch(url, options)
      .then((response) => response.text())
      .then((result) => {
        observer.next((result));
        observer.complete();
      })
      .catch((e) => {
        console.log(e);
        observer.error(e);
      })
    })
  }
  sanitizeHTML(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  announcing(data: any) {
    this.announcingAgent.emit(data);
  }
}
