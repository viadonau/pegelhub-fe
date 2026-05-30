import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SupplierApiService } from '../../core/api/supplier-api.service';
import { PhButtonComponent } from '../../ui/button/button.component';
import { PhLoadingComponent } from '../../ui/loading/loading.component';
import { PhMessageComponent } from '../../ui/message/message.component';
import { PhTableColumn, PhTableComponent } from '../../ui/table/table.component';
import { SupplierOverviewRow } from './supplier.dto';

const SUPPLIER_COLUMNS: PhTableColumn[] = [
  { field: 'stationName', header: 'Station' },
  { field: 'stationWater', header: 'Water' },
  { field: 'lastValue', header: 'Last value' },
  { field: 'stationNumber', header: 'Station number' },
  { field: 'id', header: 'ID' }
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
  protected readonly columns = SUPPLIER_COLUMNS;
  protected readonly rows = computed<SupplierOverviewRow[]>(() =>
    this.suppliers.value().map((supplier) => ({
      id: supplier.id,
      stationNumber: supplier.stationNumber,
      stationName: supplier.stationName,
      stationWater: supplier.stationWater,
      lastValue: 'No value yet'
    }))
  );
  protected readonly errorMessage = computed(() => {
    if (this.suppliers.status() !== 'error') {
      return null;
    }

    const status = this.suppliers.statusCode() ?? extractStatus(this.suppliers.error());

    if (status === 401) {
      return 'Core rejected the request as unauthenticated. The bearer token was missing, expired, or invalid.';
    }

    if (status === 403) {
      return 'Core rejected the request as forbidden. The user likely needs metadata:read for pegelhub-core-api.';
    }

    return 'The supplier request failed. Check Core availability and the runtime API base URL.';
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
