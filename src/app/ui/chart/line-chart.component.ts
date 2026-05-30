import { Component, computed, input } from '@angular/core';
import type { ChartData, ChartOptions } from 'chart.js';
import { ChartModule } from 'primeng/chart';

export interface PhChartPoint {
  label: string;
  value: number;
}

export interface PhChartSeries {
  name: string;
  points: PhChartPoint[];
}

@Component({
  selector: 'ph-line-chart',
  imports: [ChartModule],
  host: {
    class: 'block'
  },
  template: `
    @if (series().length === 0 || maxPointCount() === 0) {
      <div class="ph-chart-empty">
        {{ emptyMessage() }}
      </div>
    } @else {
      <p-chart
        type="line"
        height="320"
        [data]="chartData()"
        [options]="chartOptions()"
        [ariaLabel]="ariaLabel()"
      />
    }
  `,
  styleUrl: './line-chart.component.scss'
})
export class PhLineChartComponent {
  readonly series = input<PhChartSeries[]>([]);
  readonly yLabel = input<string>();
  readonly emptyMessage = input('No chart data available.');
  readonly ariaLabel = input('Line chart');

  protected readonly maxPointCount = computed(() =>
    this.series().reduce((max, series) => Math.max(max, series.points.length), 0)
  );

  protected readonly chartData = computed<ChartData<'line'>>(() => {
    const labels = this.longestSeries().points.map((point) => point.label);

    return {
      labels,
      datasets: this.series().map((series, index) => ({
        label: series.name,
        data: series.points.map((point) => point.value),
        borderColor: chartColors[index % chartColors.length],
        backgroundColor: chartColors[index % chartColors.length],
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        tension: 0.25
      }))
    };
  });

  protected readonly chartOptions = computed<ChartOptions<'line'>>(() => ({
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: this.series().length > 1
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      intersect: false
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: Boolean(this.yLabel()),
          text: this.yLabel()
        }
      }
    }
  }));

  private longestSeries(): PhChartSeries {
    return this.series().reduce<PhChartSeries>(
      (longest, series) => (series.points.length > longest.points.length ? series : longest),
      { name: '', points: [] }
    );
  }
}

const chartColors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
