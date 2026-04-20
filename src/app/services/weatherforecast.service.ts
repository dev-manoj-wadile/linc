import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class WeatherForecastService {
  constructor(private http: HttpClient) {}

  getData() {
    // This call will be intercepted by the proxy in server.ts
    return this.http.get<any[]>('/api/WeatherForecast');
    //return this.http.get<any[]>('https://wnts-apim-swa-dev-ci-001.azure-api.net/api/weatherforecast');
  }
}
