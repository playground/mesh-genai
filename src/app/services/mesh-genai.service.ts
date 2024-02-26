import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MeshGenaiService {

  constructor(
    private http: HttpClient
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
}
