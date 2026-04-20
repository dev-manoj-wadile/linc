import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { WeatherForecastService } from '../services/weatherforecast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Angular Proxy Pattern v1');
  
  data: any[] = [];

  constructor(private http: HttpClient, private weatherForecaster: WeatherForecastService) { }

  // Function to be called on button click
  fetchData() {
    this.weatherForecaster.getData().subscribe({
      next: (response) => {
          this.data = response;
          console.log('Data received:', response);
        },
        error: (err) => console.error('API Error:', err)
    });

    // this.http.get<any[]>('/api/WeatherForecast')
    //   .subscribe({
    //     next: (response) => {
    //       this.data = response;
    //       console.log('Data received:', response);
    //     },
    //     error: (err) => console.error('API Error:', err)
    //   });
  }
}
