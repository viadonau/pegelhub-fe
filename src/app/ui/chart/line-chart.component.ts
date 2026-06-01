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
      <div class="ph-chart-empty" role="status">
        <i class="pi pi-chart-line" aria-hidden="true"></i>
        <p>{{ emptyMessage() }}</p>
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
  readonly unit = input<string | null>();
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
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHitRadius: 12,
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
        intersect: false,
        callbacks: {
          label: (ctx) => {
            const base = ctx.dataset.label ? `${ctx.dataset.label}: ` : '';
            const unit = this.unit();
            return base + ctx.parsed.y + (unit ? ` ${unit}` : '');
          }
        }
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
          autoSkip: true,
          maxTicksLimit: 8,
          autoSkipPadding: 24,
          padding: 4,
          color: chartTokens.textMuted,
          font: { size: 11 }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: false,
        title: {
          display: Boolean(this.yLabel()),
          text: this.yLabel(),
          color: chartTokens.textMuted,
          font: { size: 12, weight: 500 }
        },
        ticks: {
          color: chartTokens.textMuted,
          font: { size: 11 },
          precision: 0
        },
        grid: {
          color: chartTokens.grid
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

const chartTokens = {
  textMuted: '#5b6b75',
  grid: '#dbe3e9'
} as const;

const chartColors = ['#003c50', '#4691af', '#00a0e1', '#007d69', '#6e463c'];
