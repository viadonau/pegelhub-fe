import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { createAppConfig } from './app/app.config';
import { loadRuntimeConfig } from './app/core/config/runtime-config';

loadRuntimeConfig()
  .then((runtimeConfig) => bootstrapApplication(App, createAppConfig(runtimeConfig)))
  .catch((error) => {
    console.error(error);
    document.body.innerHTML =
      '<main class="ph-bootstrap-error flex items-center p-8 font-sans">PegelHub could not start. Runtime config or authentication initialization failed.</main>';
  });
