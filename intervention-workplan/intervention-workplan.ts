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
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@polymer/paper-input/paper-textarea';
// ----

/**
 * @customElement
 */
@customElement('intervention-workplan')
export class InterventionWorkplan extends LitElement {
  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
        }
        td {
          border: 1px solid #b8b8b8;
          vertical-align: top;
          padding: 8px 10px;
        }

        td.first-col {
          width: 60px;
          text-align: center;
          vertical-align: middle;
          padding: 6px;
        }
        td.col-10 {
          width: 10%;
        }
        td.col-30 {
          width: 30%;
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
          padding: 4px !important;
        }
        tr.header > td {
          color: var(--secondary-text-color);
          vertical-align: middle;
          border-bottom: none;
          border-top: none;
          font-size: smaller;
          font-weight: bold;
        }
        tr.text > td {
          border-bottom: none;
          border-top: none;
        }

        tr.add > td {
          border-top: none;
        }

        tr > td:first-of-type {
          border-left: none;
        }
        tr > td:last-of-type {
          border-right: none;
        }

        tbody.odd tr:nth-child(odd) {
          background-color: #e2e1e1;
        }

        .blue {
          background-color: #b6d5f1;
        }
        .gray-1 {
          background-color: #e2e1e1;
        }
        .b {
          font-weight: 600;
        }
        .border-b {
          border-bottom: 1px solid #b8b8b8;
        }

        paper-icon-button[icon='add-box'] {
          padding-left: 0;
        }
        paper-icon-button[icon='create'] {
          padding-top: 0;
        }

        paper-icon-button {
          color: var(--secondary-text-color);
        }

        paper-textarea {
          --paper-input-container-label-floating: {
            font-weight: 600 !important;
            color: var(--secondary-text-color);
          }
          --paper-input-container-label-floating_-_font-weight: 600;
        }

        .pad-top-8 {
          padding-top: 8px;
        }
      </style>

      <table>
      <thead>
          <tr class="edit blue">
            <td class="first-col"></td>
            <td colspan="3"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-6">
              <paper-icon-button icon="create" ?hidden="${this.readonly}"></paper-icon-button>
            </td>
          </tr>
          <tr class="header blue">
            <td>ID</td>
            <td colspan="3">Country Programme Output</td>
            <td></td>
            <td>CSO Contribution</td>
            <td>UNICEF Cash</td>
            <td>Total</td>
          </tr>
        </thead>
        <tbody>
          <tr class="text blue">
            <td>1</td>
            <td colspan="3" class="b">Capacity of national system to scale upeequality nutrition- sensitive intervention</td>
            <td></td>
            <td>1,234.00</td>
            <td>4,567.00</td>
            <td>USD 5,567.00</td>
          </tr>
          <tr class="add blue">
            <td></td>
            <td colspan="3"><paper-icon-button icon="add-box" ?hidden="${this.readonly}"></paper-icon-button> Add New PD Output</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>

        <thead class="gray-1">
          <tr class="edit">
            <td class="first-col"></td>
            <td colspan="3"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-6">
              <paper-icon-button icon="create" ?hidden="${this.readonly}"></paper-icon-button>
            </td>
          </tr>
          <tr class="header">
            <td></td>
            <td colspan="3">PD Output</td>
            <td></td>
            <td>CSO Contribution</td>
            <td>UNICEF Cash</td>
            <td>Total</td>
          </tr>
        </thead>
        <tbody class="gray-1">
          <tr class="text">
            <td>1.1</td>
            <td colspan="3" class="b">PD Output Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque</td>
            <td></td>
            <td>1,234.00</td>
            <td>4,567.00</td>
            <td>USD 5,567.00</td>
          </tr>
          <tr class="add">
            <td></td>
            <td colspan="3"><paper-icon-button icon="add-box" ?hidden="${this.readonly}"></paper-icon-button> Add New Activity</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>

        <thead>
          <tr class="edit">
            <td class="first-col"></td>
            <td colspan="3"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-6">
              <paper-icon-button icon="create" ?hidden="${this.readonly}"></paper-icon-button>
            </td>
          </tr>
          <tr class="header">
            <td></td>
            <td colspan="3">Activity</td>
            <td>Time Periods</td>
            <td>CSO Contribution</td>
            <td>UNICEF Cash</td>
            <td>Total</td>
          </tr>
        </thead>
        <tbody>
          <tr class="text border-b">
            <td>1.1.1</td>
            <td colspan="3" class="b">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna amet</div>
              <div class="pad-top-8">
                <paper-textarea
                  label="Other Notes"
                  always-float-label
                  readonly
                  value="To define row groups wrap the corresponding rows in tbody elements"
                ></paper-textarea>
              </div>
            </td>
            <td></td>
            <td>1,234.00</td>
            <td>4,567.00</td>
            <td>USD 5,567.00</td>
          </tr>
          
        </tbody>
        <thead>
          <tr class="header border-b">
            <td class="first-col"></td>
            <td class="col-30">Item Description</td>
            <td class="col-10">Unit</td>
            <td class="col-10">Number Of Units</td>
            <td class="col-g">Price/Unit</td>
            <td class="col-g">Partner Cash</td>
            <td class="col-g">UNICEF CASH</td>
            <td class="col-g">Total</td>
          </tr>
          <tr class="border-b">
            <td></td>
            <td><paper-icon-button icon="add-box" ?hidden="${this.readonly}"></paper-icon-button> Add New Item</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </thead>
        <tbody class="odd">
          <tr>
            <td>1.1.1.1</td>
            <td>Venue and Facilities</td>
            <td>Days</td>
            <td>50</td>
            <td>100</td>
            <td>2,500.00</td>
            <td>2,500.00</td>
            <td>5,000.00</td>
          </tr>
          <tr>
            <td>1.1.1.2</td>
            <td>Transportation of goods - Air Fair</td>
            <td>Ticket</td>
            <td>3</td>
            <td>1000</td>
            <td>1,500.00</td>
            <td>1,500.00</td>
            <td>3,000.00</td>
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
