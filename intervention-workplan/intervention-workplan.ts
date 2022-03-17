import {LitElement, customElement, html, property} from 'lit-element';
import './budget-summary/budget-summary';
import './supply-agreement/supply-agreement';
import './results-structure/results-structure';
import './effective-efficient-programme-mgmt/effective-efficient-programme-mgmt';
import './non-financial-contribution/non-financial-contribution';
import './hq-contribution/hq-contribution';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';

// ----
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons';
// ----

/**
 * @customElement
 */
@customElement('intervention-workplan')
export class InterventionWorkplan extends LitElement {
  render() {
    // language=HTML
    return html`
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
        }
        td {
          border: 1px solid #a4a1a1;
          vertical-align: top;
          padding: 8px;
        }

        td.col-1 {
          width: 50px;
          text-align: center;
          vertical-align: middle;
          padding: 6px;
        }
        td.col-2 {
          width: 50%;
        }
        td.col-g {
          width: 12.5%;
        }
        td.col-6 {
          width: 12.5%;
          vertical-align: top;
          text-align: right;
        }
        tr.edit > td {
          height: 30px;
          border-bottom: none;
        }
        tr.header > td {
          font-weight: 600;
          color: var(--secondary-text-color);
          vertical-align: middle;
          border-bottom: none;
          border-top: none;
        }
        tr.text > td {
          border-bottom: none;
          border-top: none;
        }

        tr.add > td {
          border-top: none;
        }

        td > div {
          padding: 8px;
        }

        paper-icon-button[icon='add-box'] {
          padding-left: 0;
        }
        paper-icon-button[icon='create'] {
          padding-top: 0;
        }

        tr > td:first-of-type {
          border-left: none;
        }
        tr > td:last-of-type {
          border-right: none;
        }

        tr.blue {
          background-color: #b6d5f1;
        }
        tr.gray-1 {
          background-color: aliceblue;
        }
      </style>

      <table>
        <tbody>
          <tr class="edit blue">
            <td class="col-1"></td>
            <td class="col-2"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-6">
              <paper-icon-button icon="create" ?hidden="${this.readonly}"></paper-icon-button>
            </td>
          </tr>
          <tr class="header blue">
            <td>ID</td>
            <td>Country Programme Output</td>
            <td></td>
            <td>CSO Contribution</td>
            <td>UNICEF Cash</td>
            <td>Total</td>
          </tr>
          <tr class="text blue">
            <td>1.</td>
            <td>Capacity of national system to scale upeequality nutrition- sensitive intervention</td>
            <td></td>
            <td>1,234.00</td>
            <td>4,567.00</td>
            <td>5,567.00</td>
          </tr>
          <tr class="add blue">
            <td></td>
            <td><paper-icon-button icon="add-box" ?hidden="${this.readonly}"></paper-icon-button> Add New PD Output</td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-6"></td>
          </tr>
        </tbody>
      </table>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }

  @property({type: Boolean})
  readonly = false;
}
