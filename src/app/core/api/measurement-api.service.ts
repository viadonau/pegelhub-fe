import { httpResource } from '@angular/common/http';
import { inject, Injectable, Injector, Signal } from '@angular/core';

import { CoreApiUrlService } from './core-api-url.service';
import { MeasurementDto } from './measurement.dto';

@Injectable({ providedIn: 'root' })
export class MeasurementApiService {
  private readonly apiUrl = inject(CoreApiUrlService);
  private readonly injector = inject(Injector);

  measurementsBySupplierResource(stationNumber: Signal<string>, range: Signal<string>) {
    return httpResource<MeasurementDto[]>(
      () => {
        const currentStationNumber = stationNumber();

        if (!currentStationNumber) {
          return undefined;
        }

        return {
          url: this.apiUrl.url(`/measurement/supplier/${range()}`),
          params: {
            stationNumber: currentStationNumber,
          },
        };
      },
      {
        defaultValue: [],
        injector: this.injector,
      },
    );
  }
}
