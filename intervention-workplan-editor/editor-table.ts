import {customElement, html, LitElement} from 'lit-element';
import {EditorTableStyles} from './editor-table-styles';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons';
import '@polymer/paper-input/paper-textarea';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

@customElement('editor-table')
export class EditorTable extends LitElement {
  static get styles() {
    return [EditorTableStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <table>
      <thead>
          <tr class="edit blue">
            <td class="first-col"></td>
            <td colspan="3"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-g"></td>
            <td class="col-6">
              <paper-icon-button icon="create" ></paper-icon-button>
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
            <td>5,567.00</td>
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
              <paper-icon-button icon="create" ></paper-icon-button>
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
            <td>5,567.00</td>
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
              <paper-icon-button icon="create" ></paper-icon-button>
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
            <td>5,567.00</td>
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
            <td><paper-icon-button icon="add-box" ></paper-icon-button> Add New Item</td>
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
}
