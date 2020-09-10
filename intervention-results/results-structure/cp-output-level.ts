import {css, CSSResultArray, customElement, html, LitElement, property, TemplateResult} from 'lit-element';
import {ResultStructureStyles} from './results-structure.styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {ExpectedResult} from '../../common/models/intervention.types';
import '@unicef-polymer/etools-data-table';
import '@polymer/iron-icons';
import './modals/cp-output-dialog';
import {fireEvent} from '../../utils/fire-custom-event';

@customElement('cp-output-level')
export class CpOutputLevel extends LitElement {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      css`
        :host {
          display: block;
        }
        :host([show-cpo-level]) {
          border-top: 1px solid var(--main-border-color);
        }
        :host(:first-child) {
          border-top: none;
        }
        .alert {
          color: var(--error-color);
        }
      `
    ];
  }

  @property() interventionId!: number;
  @property() resultLink!: ExpectedResult;
  @property({type: Boolean, reflect: true, attribute: 'show-cpo-level'}) showCPOLevel = false;
  @property({type: Boolean}) showIndicators = true;
  @property({type: Boolean}) showActivities = true;

  protected render(): TemplateResult {
    return html`
      <style>
        etools-data-table-row {
          overflow: hidden;
          --list-second-bg-color: var(--secondary-background-color) !important;
          --list-row-wrapper-padding: 5px 12px 5px 0;
          --list-row-collapse-wrapper: {
            padding: 0 !important;
            margin-bottom: 10px;
            border: 1px solid var(--main-border-color) !important;
            border-bottom: 1px solid var(--main-border-color) !important;
          }
          --list-row-wrapper: {
            border-bottom: none !important;
          }
        }
      </style>
      ${this.showCPOLevel && this.resultLink
        ? html`
            <etools-data-table-row secondary-bg-on-hover>
              <div slot="row-data" class="layout-horizontal editable-row">
                <!--      If PD is associated with CP Output      -->
                ${this.resultLink.cp_output
                  ? html`
                      <div class="col-6">
                        <div class="heading">Country Program output234</div>
                        <div class="data">${this.resultLink.cp_output_name}</div>
                      </div>

                      <div class="col-4-5" ?hidden="${!this.showIndicators}">
                        <div class="heading">Ram Indicators</div>
                        <div class="data">
                          ${this.resultLink.ram_indicator_names.length
                            ? this.resultLink.ram_indicator_names.map(
                                (name: string) => html`<div class="truncate">${name}</div>`
                              )
                            : '-'}
                        </div>
                      </div>

                      <div class="col-1" ?hidden="${!this.showActivities}">
                        <div class="heading">Total Cash budget</div>
                        <div class="data">TTT 1231.144</div>
                      </div>

                      <div class="hover-block col-1">
                        <paper-icon-button icon="icons:create" @tap="${() => this.openPopup()}"></paper-icon-button>
                      </div>
                    `
                  : html`
                      <!--      If PD is unassociated with CP Output      -->
                      <div class="flex-1 flex-fix data alert">
                        Unassociated to CP Output! Please associate before moving forward
                      </div>
                    `}
              </div>

              <div slot="row-data-details">
                <slot></slot>

                <div class="add-pd row-h align-items-center" ?hidden="${!this.resultLink.cp_output}">
                  <iron-icon icon="add" @click="${() => this.addPD()}"></iron-icon>Add PD Output
                </div>
              </div>
            </etools-data-table-row>
          `
        : html`<slot></slot>`}
    `;
  }

  openPopup(): void {
    fireEvent(this, 'edit-indicators');
  }

  addPD(): void {
    fireEvent(this, 'add-pd');
  }
}
