import { Directive } from '@angular/core';


@Directive({
  selector: 'ui-dialog-content',
  host: {
    'class': 'DialogContent',
  },
})
export class DialogContentDirective {
}
