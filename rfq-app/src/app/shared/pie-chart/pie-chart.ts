import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

export interface PieChartData {
  label: string;
  value: number;
  percentage: number;
}

@Component({
  selector: 'app-pie-chart',
  standalone: false,
  template: `
    <div class="pie-chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .pie-chart-container {
      position: relative;
      height: 400px;
      width: 100%;
    }
    canvas {
      max-width: 100%;
      max-height: 100%;
    }
  `]
})
export class PieChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: PieChartData[] = [];
  @Input() title: string = '';
  @Input() colors: string[] = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'
  ];

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart(): void {
    if (!this.chartCanvas?.nativeElement) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'pie' as ChartType,
      data: {
        labels: this.data.map(item => item.label),
        datasets: [{
          data: this.data.map(item => item.value),
          backgroundColor: this.colors.slice(0, this.data.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!this.title,
            text: this.title,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataItem = this.data[context.dataIndex];
                return `${context.label}: ${dataItem.value} (${dataItem.percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart) return;

    this.chart.data.labels = this.data.map(item => item.label);
    this.chart.data.datasets[0].data = this.data.map(item => item.value);
    this.chart.data.datasets[0].backgroundColor = this.colors.slice(0, this.data.length);
    this.chart.update();
  }
}