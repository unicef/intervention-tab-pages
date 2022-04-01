import {Constructor, LitElement} from 'lit-element';

export function ArrowsNavigationMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ArrowsNavigationClass extends baseClass {
    private _navigateWithArrows!: (event: KeyboardEvent) => void;
    private lastFocusedTd: any = null;

    addArrowNavListener() {
      this._navigateWithArrows = this.navigateWithArrows.bind(this);
      this.addEventListener('keydown', this._navigateWithArrows);
    }

    navigateWithArrows(event: KeyboardEvent) {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Esc'].includes(event.key)) {
        return;
      }

      // @ts-ignore
      const currentTd = this._getActiveTd(event.path[0]);
      if (!currentTd) {
        return;
      }

      const currentTr = currentTd.parentElement;
      const currentItemType = currentTr!.getAttribute('type');
      const tdIndex = Array.from(currentTr!.children).indexOf(currentTd);

      let tdToFocus: any = null;
      switch (event.key) {
        case 'Enter': {
          let actionBtn: any = currentTd.querySelector('paper-icon-button[icon="add-box"]');
          if (!actionBtn) {
            const thead = currentTd.closest('tbody')?.previousElementSibling;
            if (thead) {
              if (currentItemType === 'a-item') {
                actionBtn = thead.previousElementSibling?.previousElementSibling?.querySelector(
                  'paper-icon-button[icon="create"]'
                );
              } else {
                actionBtn = thead.querySelector('paper-icon-button[icon="create"]');
              }
            }
          }
          if (actionBtn && !actionBtn.hasAttribute('hidden')) {
            actionBtn.click();
          }
          const input: any = currentTd.querySelector('[input]');
          if (input) {
            input.focus();
          }
          break;
        }
        case 'Esc': {
          this.lastFocusedTd.focus();
          break;
        }
        case 'ArrowLeft':
          {
            tdToFocus = currentTd.previousElementSibling;
            if (tdToFocus) {
              tdToFocus.focus();
            }
          }

          break;
        case 'ArrowRight':
          {
            tdToFocus = currentTd.nextElementSibling;
            if (tdToFocus) {
              tdToFocus.focus();
            }
          }
          break;
        case 'ArrowUp':
          {
            const prevTr = this._determinePrevTr(currentTd);
            if (!prevTr) {
              return;
            }
            const prevItemType = prevTr!.getAttribute('type');
            tdToFocus = null;
            if (currentItemType === prevItemType) {
              tdToFocus = prevTr.children[tdIndex];
            } else {
              tdToFocus = prevTr.querySelector<HTMLElement>('td[tabindex="0"]');
            }
            if (tdToFocus) {
              tdToFocus.focus();
            }
          }
          break;
        case 'ArrowDown':
          {
            const nextTr = this._determineNextTr(currentTd);
            if (!nextTr) {
              return;
            }
            const nextItemType = nextTr!.getAttribute('type');
            tdToFocus = null;
            if (currentItemType === nextItemType) {
              tdToFocus = nextTr.children[tdIndex];
            } else {
              tdToFocus = nextTr.querySelector<HTMLElement>('td[tabindex="0"]');
            }
            if (tdToFocus) {
              tdToFocus.focus();
            }
          }
          //   Array.from( currentTr.nextElementSibling.children )[index].getElementsByTagName('input')[0].focus();
          break;
      }

      if (tdToFocus) {
        this.lastFocusedTd = tdToFocus;
      }
    }

    _determineNextTr(currentTd: HTMLTableCellElement): HTMLTableRowElement | null | undefined {
      let nextTr = this._getNextTr(currentTd);
      if (!nextTr) {
        const nextTbody = this._getNextTbody(currentTd);

        nextTr = nextTbody?.querySelector<HTMLTableCellElement>('td[tabindex="0"]')?.parentElement as any;
      }
      return nextTr;
    }
    _determinePrevTr(currentTd: HTMLTableCellElement) {
      let prevTr = this._getPrevTr(currentTd);
      if (!prevTr) {
        const prevTbody = this._getPrevTbody(currentTd);
        const tdList = prevTbody?.querySelectorAll<HTMLTableCellElement>('td[tabindex="0"]');
        if (tdList?.length) {
          prevTr = tdList[tdList?.length - 1].parentElement as any;
        }
      }
      return prevTr;
    }
    _getNextTbody(activeTd: HTMLTableCellElement) {
      let nextTbody = activeTd.parentElement?.parentElement?.nextElementSibling;
      while (nextTbody?.localName === 'thead') {
        nextTbody = nextTbody.nextElementSibling;
      }
      if (nextTbody && nextTbody.children.length === 0) {
        nextTbody = nextTbody.nextElementSibling?.nextElementSibling; // double next in order to skip thead
      }
      return nextTbody;
    }
    _getPrevTbody(activeTd: HTMLTableCellElement) {
      let prevTbody = activeTd.parentElement?.parentElement?.previousElementSibling;
      while (prevTbody?.localName === 'thead') {
        prevTbody = prevTbody.previousElementSibling;
      }
      if (prevTbody && prevTbody.children.length === 0) {
        prevTbody = prevTbody.previousElementSibling?.previousElementSibling; // double next in order to skip thead
      }
      return prevTbody;
    }

    _getNextTr(activeTd: HTMLTableCellElement): HTMLTableRowElement | null | undefined {
      let nextTr = activeTd.parentElement?.nextElementSibling as HTMLTableRowElement | null;
      if (nextTr) {
        if (!nextTr.querySelector<HTMLTableCellElement>('td[tabindex="0"]')) {
          nextTr = null;
        }
      }
      return nextTr;
    }
    _getPrevTr(activeTd: HTMLTableCellElement) {
      let prevTr = activeTd.parentElement?.previousElementSibling as HTMLTableRowElement | null;
      if (prevTr) {
        if (!prevTr.querySelector<HTMLTableCellElement>('td[tabindex="0"]')) {
          prevTr = null;
        }
      }
      return prevTr;
    }

    _getActiveTd(activeEl: HTMLTableCellElement) {
      if (activeEl.localName === 'td') {
        return activeEl;
      }
      activeEl = activeEl.closest('td')!;
      return activeEl;
    }
  };
}
