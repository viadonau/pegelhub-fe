import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SupplierApiService } from '../../core/api/supplier-api.service';
import { PhButtonComponent } from '../../ui/button/button.component';
import { PhLoadingComponent } from '../../ui/loading/loading.component';
import { PhMessageComponent } from '../../ui/message/message.component';
import { PhTableColumn, PhTableComponent } from '../../ui/table/table.component';
import { SupplierOverviewRow } from './supplier.dto';

const STATION_COLUMNS: PhTableColumn[] = [
  { field: 'stationName', header: 'Station' },
  { field: 'stationWater', header: 'Water' },
  { field: 'stationNumber', header: 'Station number' }
];

@Component({
  selector: 'app-overview',
  imports: [PhButtonComponent, PhLoadingComponent, PhMessageComponent, PhTableComponent],
  templateUrl: './overview.component.html'
})
export class OverviewComponent {
  private readonly data = inject(SupplierApiService);
  private readonly router = inject(Router);

  protected readonly suppliers = this.data.suppliersResource();
  protected readonly columns = STATION_COLUMNS;
  protected readonly rows = computed<SupplierOverviewRow[]>(() =>
    this.suppliers.value().map((supplier) => ({
      id: supplier.id,
      stationNumber: supplier.stationNumber,
      stationName: supplier.stationName,
      stationWater: supplier.stationWater
    }))
  );
  protected readonly stationCount = computed(() => this.rows().length);
  protected readonly errorMessage = computed(() => {
    if (this.suppliers.status() !== 'error') {
      return null;
    }

    const status = this.suppliers.statusCode() ?? extractStatus(this.suppliers.error());

    if (status === 401) {
      return 'Your session has expired. Please sign in again to continue.';
    }

    if (status === 403) {
      return "You don't have access to station data. Ask an administrator to grant the metadata:read role.";
    }

    return "We couldn't load the stations right now. Try again, or check that the data service is reachable.";
  });

  protected openSupplier(row: object): void {
    const stationNumber = (row as SupplierOverviewRow).stationNumber;

    void this.router.navigate(['/overview', stationNumber]);
  }
}

function extractStatus(error: Error | undefined): number | undefined {
  const status = (error as unknown as { status?: unknown } | undefined)?.status;

  return typeof status === 'number' ? status : undefined;
}
