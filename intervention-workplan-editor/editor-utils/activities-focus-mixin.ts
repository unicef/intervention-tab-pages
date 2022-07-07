import {Constructor} from '@unicef-polymer/etools-types';
import {LitElement} from 'lit-element';

export function ActivitiesFocusMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivitiesFocusClass extends baseClass {
    lastFocusedTd!: any;
    determineParentTr!: (element: any) => any;
    determineParentTd!: (element: any) => any;

    moveFocusToAddedItemAndAttachListeners(target: any, focusClue: string) {
      // @ts-ignore
      const targetTrParent = this.determineParentTr(target);
      setTimeout(() => {
        const itemDescTd = (
          focusClue === 'focusAbove'
            ? targetTrParent?.previousElementSibling
            : targetTrParent?.parentElement.nextElementSibling.nextElementSibling.children[0]
        )?.children[1];
        // @ts-ignore
        itemDescTd?.querySelector('paper-textarea')?.focus();
        // @ts-ignore Defined in arrows-nav-mixin
        this.lastFocusedTd = itemDescTd;
        // @ts-ignore Defined in arrows-nav-mixin
        this.attachListenersToTr(this.determineParentTr(itemDescTd));
      }, 10);
    }

    preserveFocusOnRow(target: any) {
      // @ts-ignore
      const targetTrParent = this.determineParentTr(target);
      setTimeout(() => {
        const itemDescTd = targetTrParent?.children[1];
        // @ts-ignore
        itemDescTd?.querySelector('paper-textarea')?.focus();
        // @ts-ignore
        this.lastFocusedTd = itemDescTd;
      });
    }

    moveFocusToNewllyAdded(element: any) {
      const currTbody = this.determineParentTr(element).parentElement;
      setTimeout(() => {
        const targetTr = currTbody.nextElementSibling.querySelector('tr.text');
        const input = targetTr.querySelector('[input]');

        if (input) {
          this.lastFocusedTd = this.determineParentTd(input);
          if (!input.focused) {
            // Calling focus() when it's already focused it defocuses
            input.focus();
          }
        }

        // @ts-ignore Defined in arrows-nav-mixin
        this.attachListenersToTr(targetTr);
      });
    }
  };
}
