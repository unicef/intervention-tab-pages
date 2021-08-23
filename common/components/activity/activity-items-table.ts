import {
  LitElement,
  html,
  css,
  TemplateResult,
  CSSResultArray,
  customElement,
  property,
  PropertyValues
} from 'lit-element';
import {ActivityItemsTableStyles} from './activity-items-table.styles';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {ActivityItemRow} from './activity-item-row';
import './activity-item-row';
import {AnyObject, InterventionActivityItem} from '@unicef-polymer/etools-types';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {translate} from 'lit-translate';
import {translatesMap} from '../../../utils/intervention-labels-map';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {callClickOnSpacePushListener} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';

@customElement('activity-items-table')
export class ActivityItemsTable extends LitElement {
  static get styles(): CSSResultArray {
    // language=css
    return [
      ActivityItemsTableStyles,
      css`
        iron-icon {
          margin: 11px 25px 11px;
          color: var(--secondary-text-color);
          cursor: pointer;
          padding: 0 0 2px 0;
        }
        :host {
          border-bottom: 1px solid var(--main-border-color);
          margin-bottom: 10px;
        }
      `
    ];
  }

  @property() activityItems: Partial<InterventionActivityItem>[] = [];
  @property() readonly: boolean | undefined = false;
  @property({type: String})
  currency = '';

  protected render(): TemplateResult {
    // language=html
    return html`
      ${sharedStyles}
      <div class="grid-row header border">
        <div class="grid-cell header-cell left">
          <label required>${translate('ITEM_DESCRIPTION')}</label>
        </div>
        <div class="grid-cell header-cell left"><label required>${translate(translatesMap.unit)}</label></div>
        <div class="grid-cell header-cell end"><label required>${translate(translatesMap.no_units)}</label></div>
        <div class="grid-cell header-cell end">${translate('PRICE_UNIT')}</div>
        <div class="grid-cell header-cell end">${translate('TOTAL_COST')}</div>
        <div class="grid-cell header-cell end">${translate('PARTNER_CASH')}</div>
        <div class="grid-cell header-cell end">${translate('UNICEF_CASH')}</div>
        <div class="grid-cell header-cell"></div>
        <div class="grid-cell header-cell end">${translate('TOTAL_CASH')} (${this.currency})</div>
      </div>

      ${this.activityItems.map(
        (item: Partial<InterventionActivityItem>, index: number) =>
          html`<activity-item-row
            .activityItem="${item}"
            @item-changed="${({detail}: CustomEvent) => this.updateActivityItem(index, detail)}"
            @remove-item="${() => this.updateActivityItem(index, null)}"
            .readonly="${this.readonly}"
            .lastItem="${this.isLastItem(index)}"
            .currency="${this.currency}"
          ></activity-item-row>`
      )}
      ${!this.readonly
        ? html`<iron-icon id="btnAddItem" icon="add" tabIndex="0" @click="${() => this.addNew()}"></iron-icon>`
        : html``}
    `;
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    callClickOnSpacePushListener(this.shadowRoot!.querySelector('#btnAddItem'));
  }

  addNew(): void {
    this.activityItems = [
      ...this.activityItems,
      {
        cso_cash: '0',
        unicef_cash: '0',
        name: ''
      }
    ];
    this.setFocusOnFirstActivity();
  }

  setFocusOnFirstActivity() {
    setTimeout(() => {
      const activityRows = this.shadowRoot!.querySelectorAll('activity-item-row');
      if (activityRows.length) {
        const activityNameEl = activityRows[0].shadowRoot!.querySelector('#activityName') as PaperTextareaElement;
        if (activityNameEl) {
          activityNameEl.focus();
        }
      }
    }, 200);
  }

  updateActivityItem(index: number, item: Partial<InterventionActivityItem> | null): void {
    if (item === null) {
      this.activityItems.splice(index, 1);
      this.setFocusOnFirstActivity();
    } else {
      this.activityItems.splice(index, 1, item);
    }
    fireEvent(this, 'activity-items-changed', [...this.activityItems]);
  }

  validate(): AnyObject | undefined {
    const rows: NodeListOf<ActivityItemRow> = this.shadowRoot!.querySelectorAll('activity-item-row');
    let validationData: AnyObject | undefined;
    rows.forEach((row: ActivityItemRow) => {
      if (!validationData) {
        const rowValidationData = row.validate();
        if (rowValidationData.invalidRequired || rowValidationData.invalidSum) {
          validationData = Object.assign({}, rowValidationData);
        }
      }
    });
    return validationData;
  }

  isLastItem(currentIndex: number): boolean {
    if (this.activityItems.length == currentIndex + 1) {
      return true;
    }
    return false;
  }
}
