import {LitElement, html, css, TemplateResult, CSSResultArray, customElement, property} from 'lit-element';
import {ActivityItemsTableStyles} from './acivity-items-table.styles';
import {InterventionActivityItem} from '../../../../common/models/intervention.types';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {ActivityItemRow} from './activity-item-row';
import './activity-item-row';

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
        }
        :host {
          border-bottom: 1px solid var(--main-border-color);
          margin-bottom: 10px;
        }
      `
    ];
  }

  @property() activityItems: Partial<InterventionActivityItem>[] = [];

  protected render(): TemplateResult {
    // language=html
    return html`
      <div class="grid-row header border">
        <div class="grid-cell header-cell">Item Description</div>
        <div class="grid-cell header-cell center">CSO Contrib</div>
        <div class="grid-cell header-cell center">Unicef Cash</div>
        <div class="grid-cell header-cell"></div>
        <div class="grid-cell header-cell end">Total Cash</div>
      </div>

      ${this.activityItems.map(
        (item: Partial<InterventionActivityItem>, index: number) =>
          html`<activity-item-row
            .activityItem="${item}"
            @item-changed="${({detail}: CustomEvent) => this.updateActivityItem(index, detail)}"
            @remove-item="${() => this.updateActivityItem(index, null)}"
          ></activity-item-row>`
      )}

      <iron-icon icon="add-box" @click="${() => this.addNew()}"></iron-icon>
    `;
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
  }

  updateActivityItem(index: number, item: Partial<InterventionActivityItem> | null): void {
    if (item === null) {
      this.activityItems.splice(index, 1);
    } else {
      this.activityItems.splice(index, 1, item);
    }
    fireEvent(this, 'activity-items-changed', [...this.activityItems]);
  }

  validate(): boolean {
    const rows: NodeListOf<ActivityItemRow> = this.shadowRoot!.querySelectorAll('activity-item-row');
    let valid = true;
    rows.forEach((row: ActivityItemRow) => {
      valid = valid && row.validate();
    });
    return valid;
  }
}
