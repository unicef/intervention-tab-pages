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
    private lastFocusedTd: any = null;

    addArrowNavListener() {
      this._navigateWithArrows = this.navigateWithArrows.bind(this);
      this.addEventListener('keydown', this._navigateWithArrows);
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
        td.addEventListener('click', (e) => {
          this.lastFocusedTd = this.determineCurrentTd(e.target);
          this.handleClickOnReadonlyInput(e);
        });
        td.addEventListener('focusin', (e) => {
          // Doesn't trigger when focus id done from js
          this.lastFocusedTd = this.determineCurrentTd(e.target);
        });
      });
    }

    determineCurrentTd(element: any) {
      let currentTd = element;
      while (currentTd.localName !== 'td') {
        currentTd = currentTd.parentElement;
      }
      return currentTd;
    }
    determineCurrentTr(element: any) {
      let currentTr = element;
      while (currentTr.localName !== 'tr') {
        currentTr = currentTr.parentElement;
      }
      return currentTr;
    }
    moveFocusToFirstInput(currentTarget: any) {
      const tr = this.determineCurrentTr(currentTarget);
      const input = tr.querySelector('[input]');
      if (input) {
        setTimeout(() => {
          input.focus();
          this.lastFocusedTd = this.determineCurrentTd(input);
        });
      }
    }

    navigateWithArrows(event: KeyboardEvent) {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) {
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
            if (input.localName == 'etools-currency-amount-input') {
              input.shadowRoot.querySelector('paper-input').focus();
            } else {
              input.focus();
            }
            this.lastFocusedTd = this.determineCurrentTd(input);
          }
          break;
        }
        case 'Escape': {
          this.lastFocusedTd.focus();
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
      while (nextTbody?.hasAttribute('thead')) {
        nextTbody = nextTbody.nextElementSibling;
      }
      if (nextTbody && nextTbody.children.length === 0) {
        nextTbody = nextTbody.nextElementSibling?.nextElementSibling; // double next in order to skip header tbody
      }
      return nextTbody;
    }
    _getPrevTbody(activeTd: HTMLTableCellElement) {
      let prevTbody = activeTd.parentElement?.parentElement?.previousElementSibling;
      while (prevTbody?.hasAttribute('thead')) {
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
      activeEl = activeEl.closest('td')!;
      return activeEl;
    }

    /**
     * To re-enable arrow nav when the focus is in an input field
     */
    handleEsc(event: KeyboardEvent) {
      if (event.key == 'Escape') {
        this.lastFocusedTd.focus();
      }
    }
    /**
     * Clicking on an readonly input moves the focus away from the table cell and arrow nav doesn't work
     * This method moves the focus on the <td>
     */
    handleClickOnReadonlyInput(event: MouseEvent) {
      if ((event.target as HTMLElement)!.hasAttribute('readonly')) {
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
      return this.lastFocusedTd.classList.value.includes('action-btns');
    }
  };
}
