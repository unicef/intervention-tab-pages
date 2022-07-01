import {PaperButtonElement} from '@polymer/paper-button';
import {Constructor, LitElement} from 'lit-element';
/**
 * Notes about the functionality:
 * - Only cells that contain editable inputs can be reached through arrows navigation
 * - Once the cell is focused, it can be made editable pressing Enter key
 * - While the focus is in the editable field,
 *  Escape has to be pressed to make the arrow key navigation functional again
 * - Navigating to a row that contains an item of a different type (activity to activity-item for ex.),
 *  will reset the cell index given the differences in cell number betwen rows
 * - Pressing left or right when there is no editable cell in that direction does nothing;
 *  In this case, to get to next line use up/down.
 * @param baseClass
 * @returns
 */
export function ArrowsNavigationMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ArrowsNavigationClass extends baseClass {
    private _navigateWithArrows!: (event: KeyboardEvent) => void;
    private _saveWitCtrlS!: (event: KeyboardEvent) => void;

    // Set to true on Tab key press and to false on Esc.
    // Can't be always true becuase it throws out navigation with arrows,
    // which need the focus to be on the td not the input inside it.
    private easeUpTabNavigation = false;

    private _lastFocusedTd: any = null;
    set lastFocusedTd(td: any) {
      this._lastFocusedTd = td;

      if (this.easeUpTabNavigation) {
        // Avoid the need for 2 TAB clicks to reach the input
        const inputs = td.querySelectorAll('[input]');
        if (inputs.length > 1 && Array.from(inputs).some((i: any) => i.hasAttribute('focused'))) {
          return;
        }

        const input = inputs[0];
        if (input && !this.inputIsFocused(input) && !input.hasAttribute('readonly') && !input.hasAttribute('hidden')) {
          this.focusInput(input);
        }
      }
    }

    get lastFocusedTd() {
      return this._lastFocusedTd;
    }

    addArrowNavListener() {
      this._navigateWithArrows = this.navigateWithArrows.bind(this);
      this.addEventListener('keydown', this._navigateWithArrows);
    }

    addCtrlSListener() {
      this._saveWitCtrlS = this.saveWitCtrlS.bind(this);
      this.addEventListener('keydown', this._saveWitCtrlS);
    }

    removeCtrlSListener() {
      this.removeEventListener('keydown', this._saveWitCtrlS);
    }

    saveWitCtrlS(event: KeyboardEvent) {
      if (event.ctrlKey && event.key == 's') {
        event.preventDefault();
        event.stopImmediatePropagation();
        const saveBtn = this.shadowRoot?.querySelector<PaperButtonElement>('[id^="btnSave"]:not([hidden])');
        if (saveBtn) {
          saveBtn.click();
        }
      }
    }

    focusFirstTd() {
      const focusableTds = Array.from(this.shadowRoot!.querySelectorAll<HTMLTableCellElement>('td[tabindex]'));
      this.setLastFocusedTdOnClick(focusableTds);
      const firstFocusableTd = focusableTds[0];
      if (firstFocusableTd) {
        firstFocusableTd.focus();
        this.lastFocusedTd = firstFocusableTd;
      }
    }

    setLastFocusedTdOnClick(focusableTds: HTMLTableCellElement[]) {
      focusableTds.forEach((td: HTMLTableCellElement) => {
        this.attachListenersToTd(td);
      });
    }

    attachListenersToTd(td: HTMLTableCellElement) {
      td.addEventListener('click', (e) => {
        this.lastFocusedTd = this.determineParentTd(e.target);
      });
      td.addEventListener('focusin', (e) => {
        // Doesn't trigger when focus is done from js
        const currentTd = this.determineParentTd(e.target);
        if (this.lastFocusedTd != currentTd) {
          this.lastFocusedTd = currentTd;
        }
      });
    }

    attachListenersToTr(tr: HTMLTableRowElement) {
      const focusableTds = Array.from(tr.querySelectorAll<HTMLTableCellElement>('td[tabindex="0"]'));
      focusableTds.forEach((td: HTMLTableCellElement) => {
        this.attachListenersToTd(td);
      });
    }

    determineParentTd(element: any) {
      let currentTd = element;
      while (currentTd.localName !== 'td') {
        currentTd = currentTd.parentElement || currentTd.parentNode || currentTd.host;
      }
      return currentTd;
    }
    determineParentTr(element: any) {
      let currentTr = element;
      while (currentTr.localName !== 'tr') {
        currentTr = currentTr.parentElement;
      }
      return currentTr;
    }
    moveFocusToFirstInput(currentTarget: any) {
      const tr = this.determineParentTr(currentTarget);
      const input = tr.querySelector('[input]');
      if (input) {
        setTimeout(() => {
          input.focus();
          this.lastFocusedTd = this.determineParentTd(input);
        });
      }
    }

    navigateWithArrows(event: KeyboardEvent) {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab'].includes(event.key)) {
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
        case 'Tab':
          this.easeUpTabNavigation = true;
          break;
        case 'Enter': {
          // @ts-ignore
          if (['paper-icon-button', 'paper-button'].includes(event.path[0].localName)) {
            return;
          }
          let actionBtn: any = this.searchForActionBtnInCurrentTd(currentTd);
          if (!actionBtn) {
            actionBtn = this.searchForActionBtnInCurrentTr(currentTr);
          }

          if (actionBtn && !actionBtn.hasAttribute('hidden')) {
            actionBtn.click();
          }
          const input: any = currentTd.querySelector('[input]');
          if (input) {
            this.focusInput(input);
            this.lastFocusedTd = this.determineParentTd(input);
          }
          break;
        }
        case 'Escape': {
          this.lastFocusedTd.focus();
          this.easeUpTabNavigation = false;
          break;
        }
        case 'ArrowLeft':
          {
            tdToFocus = currentTd.previousElementSibling;

            if (!tdToFocus) {
              break;
            }

            while (tdToFocus.getAttribute('tabindex') !== '0') {
              tdToFocus = tdToFocus.previousElementSibling;
              if (!tdToFocus) {
                break;
              }
            }
            if (tdToFocus) {
              tdToFocus.focus();
            }
          }

          break;
        case 'ArrowRight':
          {
            tdToFocus = currentTd.nextElementSibling;

            if (!tdToFocus) {
              break;
            }

            while (tdToFocus.getAttribute('tabindex') !== '0') {
              tdToFocus = tdToFocus.nextElementSibling;
              if (!tdToFocus) {
                break;
              }
            }
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
              if (String(tdToFocus.getAttribute('tabindex')) !== '0') {
                // covers going to the row with add, which has just one navigable column
                tdToFocus = nextTr.querySelector('td[tabindex="0"]');
              }
            } else {
              tdToFocus = nextTr.querySelector<HTMLElement>('td[tabindex="0"]');
            }
            if (tdToFocus) {
              tdToFocus.focus();
            }
          }
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
      while (
        nextTbody?.hasAttribute('thead') ||
        nextTbody?.querySelector<HTMLTableCellElement>('td[tabindex="0"]') === null
      ) {
        nextTbody = nextTbody.nextElementSibling;
      }
      if (nextTbody && nextTbody.children.length === 0) {
        nextTbody = nextTbody.nextElementSibling?.nextElementSibling; // double next in order to skip header tbody
      }
      return nextTbody;
    }
    _getPrevTbody(activeTd: HTMLTableCellElement) {
      let prevTbody = activeTd.parentElement?.parentElement?.previousElementSibling;
      while (
        prevTbody?.hasAttribute('thead') ||
        prevTbody?.querySelector<HTMLTableCellElement>('td[tabindex="0"]') === null
      ) {
        prevTbody = prevTbody.previousElementSibling;
      }
      if (prevTbody && prevTbody.children.length === 0) {
        // double next in order to skip header tbody
        prevTbody = prevTbody.previousElementSibling?.previousElementSibling;
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
      let activeTd = activeEl.closest('td')!;
      if (!activeTd) {
        activeTd = this.determineParentTd(activeEl);
      }
      return activeTd;
    }

    /**
     * To re-enable arrow nav when the focus is in an input field
     */
    handleEsc(event: KeyboardEvent) {
      if (event.key == 'Escape') {
        this.lastFocusedTd.focus();
      }
    }

    searchForActionBtnInCurrentTd(currentTd: any) {
      return this.findEditOrAddBtn(currentTd);
    }

    searchForActionBtnInCurrentTr(currentTr: any) {
      return this.findEditOrAddBtn(currentTr);
    }

    findEditOrAddBtn(element: any) {
      return (
        element.querySelector('paper-icon-button[icon="create"]') ||
        element.querySelector('paper-icon-button[icon="add-box"]')
      );
    }
    enterClickedOnActionBtnsTd() {
      return this.lastFocusedTd && this.lastFocusedTd.classList.value.includes('action-btns');
    }

    focusInput(input: any) {
      if (input.localName == 'etools-currency-amount-input') {
        input.shadowRoot.querySelector('paper-input').focus();
      } else {
        input.focus();
      }
    }

    inputIsFocused(input: any) {
      if (input.localName == 'etools-currency-amount-input') {
        return input.shadowRoot.querySelector('paper-input').focused;
      } else {
        return input.focused;
      }
    }
  };
}
