import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

export interface LineChartData {
  date: Date;
  submissionsCount: number;
  completedCount: number;
  completionRate: number;
}

@Component({
  selector: 'app-line-chart',
  standalone: false,
  template: `
    <div class="line-chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .line-chart-container {
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
export class LineChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: LineChartData[] = [];
  @Input() title: string = '';

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

    const labels = this.data.map(item => 
      item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    const config: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'RFQ Submissions',
            data: this.data.map(item => item.submissionsCount),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: false,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Completion Rate (%)',
            data: this.data.map(item => item.completionRate),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
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
            position: 'top',
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
              afterLabel: (context) => {
                const dataIndex = context.dataIndex;
                const dataItem = this.data[dataIndex];
                if (context.datasetIndex === 0) {
                  return `Completed: ${dataItem.completedCount}`;
                }
                return '';
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'RFQ Count'
            },
            beginAtZero: true
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Completion Rate (%)'
            },
            grid: {
              drawOnChartArea: false,
            },
            beginAtZero: true,
            max: 100
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private updateChart(): void {
    if (!this.chart) return;

    const labels = this.data.map(item => 
      item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = this.data.map(item => item.submissionsCount);
    this.chart.data.datasets[1].data = this.data.map(item => item.completionRate);
    this.chart.update();
  }
}