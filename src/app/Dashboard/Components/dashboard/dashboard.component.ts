import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule, provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardResponseDto, DashboardFilterDto } from '../../Models/dashboard.models';
import { DashboardService } from '../../Services/dashboard.service';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartType, ChartData, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'ar-EG' }, provideCharts(withDefaultRegisterables())
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatOptionModule,
    MatTooltipModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dashboardService = inject(DashboardService);

  filterForm!: FormGroup;
  dashboardData: DashboardResponseDto | null = null;
  isLoading = false;


  // 1. Doughnut Chart (نسبة الاكتمال)
  doughnutChartType: ChartType = 'doughnut';
  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['مكتمل', 'معلق (نواقص)'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#A3CFC3', '#F6C4B4'],
      hoverBackgroundColor: ['#86bcaf', '#f4ad9a'],
      borderWidth: 2,
      borderColor: '#FFFDF9'
    }]
  };
  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: 'inherit', weight: 'bold' } } }
    }
  };

  // 2. Line Chart (المحاضر اليومية)
  lineChartType: ChartType = 'line';
  lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'الإجمالي اليومي',
        backgroundColor: 'rgba(163, 207, 195, 0.25)',
        borderColor: '#446860',
        fill: 'origin',
        tension: 0.35,
        pointBackgroundColor: '#446860',
        pointRadius: 5
      },
      {
        data: [],
        label: 'المكتمل',
        borderColor: '#15803d',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.35,
        pointRadius: 4
      }
    ],
    labels: []
  };
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'inherit', weight: 'bold' } } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  // 3. Bar Chart (المراكز)
  barChartType: ChartType = 'bar';
  barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'مكتمل', backgroundColor: '#A3CFC3', borderRadius: 8 },
      { data: [], label: 'معلق', backgroundColor: '#F6C4B4', borderRadius: 8 }
    ]
  };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'inherit', weight: 'bold' } } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };



  ngOnInit(): void {
    this.initForm();
    this.fetchDashboardData();
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      fromDate: [null],
      toDate: [null],
      governorateID: [null],
      regionID: [{ value: null, disabled: true }],
      areaID: [{ value: null, disabled: true }]
    });
  }



  applyFilters(): void {
    const val = this.filterForm.getRawValue();
    const filterDto: DashboardFilterDto = {
      fromDate: val.fromDate ? this.toDateString(val.fromDate) : undefined,
      toDate: val.toDate ? this.toDateString(val.toDate) : undefined,
      governorateID: val.governorateID || undefined,
      regionID: val.regionID || undefined,
      areaID: val.areaID || undefined
    };

    this.fetchDashboardData(filterDto);
  }

  fetchDashboardData(filters?: DashboardFilterDto): void {
    this.isLoading = true;
    this.dashboardService.getDashboardStatistics(filters).subscribe({
      next: (res) => {
        this.dashboardData = res;
        this.updateCharts(res);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching statistics:', err);
        this.isLoading = false;
      }
    });
  }

  private updateCharts(data: DashboardResponseDto): void {
    // تحديث Doughnut
    this.doughnutChartData = {
      labels: ['مكتمل', 'معلق'],
      datasets: [{
        data: [data.summary.completedRequests, data.summary.incompleteRequests],
        backgroundColor: ['#A3CFC3', '#F6C4B4'],
        hoverBackgroundColor: ['#86bcaf', '#f4ad9a'],
        borderWidth: 2,
        borderColor: '#FFFDF9'
      }]
    };

    // تحديث Line Chart
    const dates = data.byDate.map(d => d.date ? d.date.split('T')[0] : '');
    const totals = data.byDate.map(d => d.totalRequests);
    const completed = data.byDate.map(d => d.completedRequests);

    this.lineChartData = {
      labels: dates,
      datasets: [
        {
          data: totals,
          label: 'الإجمالي اليومي',
          backgroundColor: 'rgba(163, 207, 195, 0.25)',
          borderColor: '#446860',
          fill: 'origin',
          tension: 0.35,
          pointBackgroundColor: '#446860',
          pointRadius: 5
        },
        {
          data: completed,
          label: 'المكتمل',
          borderColor: '#15803d',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.35,
          pointRadius: 4
        }
      ]
    };

    // تحديث Bar Chart (أعلى 6 مراكز)
    const regions = data.byRegion.slice(0, 6);
    this.barChartData = {
      labels: regions.map(r => r.name),
      datasets: [
        { data: regions.map(r => r.completedRequests), label: 'مكتمل', backgroundColor: '#A3CFC3', borderRadius: 8 },
        { data: regions.map(r => r.incompleteRequests), label: 'معلق', backgroundColor: '#F6C4B4', borderRadius: 8 }
      ]
    };
  }


  private toDateString(val: any): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
