import { Component } from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'ph-toolbar',
  imports: [ToolbarModule],
  host: {
    class: 'block'
  },
  template: `
    <p-toolbar>
      <ng-template #start>
        <ng-content select="[ph-toolbar-start]" />
      </ng-template>
      <ng-template #center>
        <ng-content select="[ph-toolbar-center]" />
      </ng-template>
      <ng-template #end>
        <ng-content select="[ph-toolbar-end]" />
      </ng-template>
    </p-toolbar>
  `
})
export class PhToolbarComponent {}
