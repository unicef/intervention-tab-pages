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
import {ActivityItemsTableStyles} from './acivity-items-table.styles';
import {fireEvent} from '../../utils/fire-custom-event';
import {ActivityItemRow} from './activity-item-row';
import './activity-item-row';
import {AnyObject, InterventionActivityItem} from '@unicef-polymer/etools-types';
import {callClickOnSpacePushListener} from '../../utils/common-methods';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {translate} from 'lit-translate';
import {sharedStyles} from '../../common/styles/shared-styles-lit';

@customElement('ef-activity-items-table')
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

  protected render(): TemplateResult {
    // language=html
    return html`
      <style>
        ${sharedStyles}
      </style>
      <div class="grid-row header border">
        <div class="grid-cell header-cell left">
          <label required>${translate('ITEM_DESCRIPTION')}</label>
        </div>
        <div class="grid-cell header-cell end">${translate('PARTNER_CASH')}</div>
        <div class="grid-cell header-cell end">${translate('UNICEF_CASH')}</div>
        <div class="grid-cell header-cell"></div>
        <div class="grid-cell header-cell end">${translate('TOTAL_CASH')}</div>
      </div>

      ${this.activityItems.map(
        (item: Partial<InterventionActivityItem>, index: number) =>
          html`<ef-activity-item-row
            .activityItem="${item}"
            @item-changed="${({detail}: CustomEvent) => this.updateActivityItem(index, detail)}"
            @remove-item="${() => this.updateActivityItem(index, null)}"
            .readonly="${this.readonly}"
            .lastItem="${this.isLastItem(index)}"
          ></ef-activity-item-row>`
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