import { httpResource } from '@angular/common/http';
import { computed, inject, Injectable, Injector } from '@angular/core';

import { CoreApiUrlService } from './core-api-url.service';
import { SupplierDto } from './supplier.dto';
import { decorateSupplierWithMockMetadata } from './supplier-metadata.mock';

@Injectable({ providedIn: 'root' })
export class SupplierApiService {
  private readonly apiUrl = inject(CoreApiUrlService);
  private readonly injector = inject(Injector);

  suppliersResource() {
    const resource = httpResource<SupplierDto[]>(() => this.apiUrl.url('/supplier'), {
      defaultValue: [],
      injector: this.injector,
    });

    // TODO(BE): Drop the mock decorator once the supplier endpoint joins
    // operator station metadata (see docs/operator-station-metadata.md and
    // supplier-metadata.mock.ts). Until then, decorate the live response
    // so the UI can render river-km, parameters, owner, and reference IDs.
    const decoratedValue = computed(() =>
      resource.value().map((supplier) => decorateSupplierWithMockMetadata(supplier)),
    );

    return new Proxy(resource, {
      get(target, prop, receiver) {
        if (prop === 'value') return decoratedValue;
        return Reflect.get(target, prop, receiver);
      },
    });
  }
}
