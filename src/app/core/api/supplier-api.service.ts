import { httpResource } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';

import { CoreApiUrlService } from './core-api-url.service';
import { SupplierDto } from './supplier.dto';

@Injectable({ providedIn: 'root' })
export class SupplierApiService {
  private readonly apiUrl = inject(CoreApiUrlService);
  private readonly injector = inject(Injector);

  suppliersResource() {
    return httpResource<SupplierDto[]>(() => this.apiUrl.url('/supplier'), {
      defaultValue: [],
      injector: this.injector
    });
  }
}
