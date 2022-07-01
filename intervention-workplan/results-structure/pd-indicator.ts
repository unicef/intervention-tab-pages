import {LitElement, html, customElement, property, TemplateResult, css} from 'lit-element';
import '@unicef-polymer/etools-data-table/etools-data-table';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {ResultStructureStyles} from './styles/results-structure.styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {CommentElementMeta, CommentsMixin} from '../../common/components/comments/comments-mixin';
import {Disaggregation, DisaggregationValue} from '@unicef-polymer/etools-types';
import {Indicator} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {addCurrencyAmountDelimiter} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {ActivitiesAndIndicatorsStyles} from './styles/ativities-and-indicators.styles';

@customElement('pd-indicator')
export class PdIndicator extends CommentsMixin(LitElement) {
  @property() private disaggregations: Disaggregation[] = [];
  @property({type: Array}) indicator!: Indicator;
  @property({type: Boolean}) readonly!: boolean;
  @property({type: Array}) locationNames: {name: string; adminLevel: string}[] = [];
  @property({type: String}) sectionClusterNames = '';
  @property({type: String}) interventionStatus = '';
  @property({type: Boolean}) inAmendment!: boolean;
  @property({type: Boolean}) detailsOpened = false;
  @property({type: Number}) index?: number;

  render() {
    return html`
      ${sharedStyles}
      <style>
        .font-bold {
          font-weight: bold;
        }
      </style>
      <div
        class="table-row editable-row"
        related-to="indicator-${this.indicator.id}"
        related-to-description="Indicator - ${this.indicator.indicator?.title}"
        comments-container
        @paper-dropdown-open="${(event: CustomEvent) => (event.currentTarget as HTMLElement)!.classList.add('active')}"
        @paper-dropdown-close="${(event: CustomEvent) =>
          (event.currentTarget as HTMLElement)!.classList.remove('active')}"
      >
        <div class="main-info">
          <!--    Indicator name    -->
          <div class="flex-1 left-align layout-vertical start-aligned">
            <div class="name layout-horizontal">
              ${this.getIndicatorDisplayType(this.indicator)} ${this.addInactivePrefix(this.indicator)}
              ${(this.indicator.indicator ? this.indicator.indicator.title : this.indicator.cluster_indicator_title) ||
              '—'}
              <div id="hf" class="hf-mark" ?hidden="${!this.indicator.is_high_frequency}"></div>
              <paper-tooltip for="hf" position="top" theme="light" animation-delay="0" offset="4">
                This indicator is high frequency
              </paper-tooltip>
            </div>
            <div class="item-link" @click="${() => (this.detailsOpened = !this.detailsOpened)}">
              ${this.detailsOpened ? 'hide' : 'show'} ${this.locationNames.length} ${translate('LOCATIONS')} |
              ${this.indicator.disaggregation.length} ${translate('DISAGGREGATIONS')}
            </div>
          </div>
          <!--    Baseline    -->
          <div class="flex-1 secondary-cell right">
            ${this._displayBaselineOrTarget(this.indicator.baseline, this.indicator)}
          </div>

          <!--    Target    -->
          <div class="flex-1 secondary-cell right">
            ${this._displayBaselineOrTarget(this.indicator.target, this.indicator)}
          </div>
        </div>
        <div class="details ${this.detailsOpened ? 'opened' : ''}">${this.additionalTemplate()}</div>

        <div class="show-actions hover-block" style="z-index: ${99 - (this.index || 0)}" ?hidden="${this.commentMode}">
          <paper-menu-button id="view-menu-button" close-on-activate horizontal-align="right">
            <paper-icon-button slot="dropdown-trigger" icon="icons:more-vert" tabindex="0"></paper-icon-button>
            <paper-listbox slot="dropdown-content">
              <div
                class="action"
                ?hidden="${!this._canEdit() && !this._canView()}"
                @click="${() => this.openIndicatorDialog(this.indicator, this.readonly)}"
              >
                <iron-icon icon="${this._canEdit() ? 'create' : 'visibility'}"></iron-icon>
                ${this._canEdit() ? translate('EDIT') : translate('VIEW')}
              </div>
              <div
                class="action"
                ?hidden="${!this._canDeactivate()}"
                @click="${() => this.openDeactivationDialog(String(this.indicator.id))}"
              >
                <iron-icon icon="icons:block"></iron-icon>
                ${translate('DEACTIVATE')}
              </div>
              <div
                class="action delete-action"
                ?hidden="${!this._canDelete()}"
                @click="${() => this.openDeletionDialog(String(this.indicator.id))}"
              >
                <iron-icon icon="delete"></iron-icon>
                ${translate('DELETE')}
              </div>
            </paper-listbox>
          </paper-menu-button>
        </div>
      </div>
    `;
  }

  additionalTemplate() {
    return html` <!--    Indicator row collapsible Details    -->
      <!--    Locations    -->
      <div class="details-container">
        <div class="details-heading">${translate('LOCATIONS')}</div>
        <div class="details-text">
          ${this.locationNames.length
            ? this.locationNames.map(
                (name) =>
                  html`
                    <div class="details-list-item">
                      <span class="font-bold">${name.name}</span>
                      ${name.adminLevel}
                    </div>
                  `
              )
            : '-'}
        </div>
      </div>

      <!--    Disaggregations    -->
      <div class="details-container">
        <div class="details-heading">${translate('DISAGGREGATION')}</div>
        <div class="details-text">
          ${this.indicator.disaggregation.length
            ? this.indicator.disaggregation.map((disaggregation: string) => this.getDisaggregation(disaggregation))
            : '—'}
        </div>
      </div>`;
  }

  getSpecialElements(element: HTMLElement): CommentElementMeta[] {
    const relatedTo: string = element.getAttribute('related-to') as string;
    const relatedToDescription = element.getAttribute('related-to-description') as string;
    return [{element, relatedTo, relatedToDescription}];
  }
  openDeactivationDialog(indicatorId: string) {
    fireEvent(this, 'open-deactivate-confirmation', {indicatorId: indicatorId});
  }
  openIndicatorDialog(indicator: Indicator, readonly: boolean) {
    fireEvent(this, 'open-edit-indicator-dialog', {indicator: indicator, readonly: readonly});
  }
  openDeletionDialog(indicatorId: string) {
    fireEvent(this, 'open-delete-confirmation', {indicatorId: indicatorId});
  }

  // Both unit and displayType are used because of inconsitencies in the db.
  getIndicatorDisplayType(indicator: Indicator) {
    const unit = indicator.indicator ? indicator.indicator!.unit : '';
    const displayType = indicator.indicator ? indicator.indicator!.display_type : '';
    if (!unit) {
      return '';
    }
    let typeChar = '';
    switch (unit) {
      case 'number':
        typeChar = '#';
        break;
      case 'percentage':
        if (displayType === 'percentage') {
          typeChar = '%';
        } else if (displayType === 'ratio') {
          typeChar = '÷';
        }
        break;
      default:
        break;
    }
    return typeChar;
  }

  getDisaggregation(disaggregationId: string | number): TemplateResult {
    const disaggreg: Disaggregation | null =
      this.disaggregations.find(({id}: Disaggregation) => String(id) === String(disaggregationId)) || null;
    let values: string =
      (disaggreg && disaggreg.disaggregation_values.map(({value}: DisaggregationValue) => value).join(', ')) || '';
    if (!values) {
      values = '—';
    }
    return disaggreg && values
      ? html` <div class="details-list-item"><b>${disaggreg.name}</b>: ${values}</div> `
      : html``;
  }

  private addInactivePrefix(indicator: any) {
    return !indicator || indicator.is_active ? '' : html`<strong>(inactive)</strong>`;
  }

  _displayBaselineOrTarget(item: any, indicator: Indicator) {
    if (!item) {
      return '—';
    }
    if (!item.v && parseInt(item.v) !== 0) {
      return '—';
    }

    const isCluster = indicator.cluster_indicator_id;
    if (isCluster && this._clusterIndIsRatio(item)) {
      return item.v + ' / ' + item.d;
    }
    const unit = indicator.indicator ? indicator.indicator!.unit : '';
    const displayType = indicator.indicator ? indicator.indicator!.display_type : '';
    if (unit === 'percentage' && displayType === 'ratio') {
      return item.v + ' / ' + item.d;
    } else if (unit === 'percentage') {
      return item.v;
    }

    const numberValue = Number(item.v) || 0;
    return addCurrencyAmountDelimiter(String(numberValue));
  }

  _clusterIndIsRatio(item: any) {
    return item.d && parseInt(item.d) !== 1 && parseInt(item.d) !== 100;
  }

  _canDeactivate(): boolean {
    if (this.inAmendment && this.indicator.is_active && !this.readonly) {
      return true;
    }

    if (this.interventionStatus === 'draft' || this.interventionStatus === 'development') {
      return false;
    }
    if (this.indicator.is_active && !this.readonly) {
      return true;
    }
    return false;
  }

  _canEdit() {
    return this.indicator.is_active && !this.readonly;
  }

  _canView() {
    return this.readonly || !this.indicator.is_active;
  }

  _canDelete(): boolean {
    if (this.inAmendment) {
      // only Deactivate should be av. in amendment
      return false;
    }
    // TODO: refactor this after status draft comes as development
    if ((this.interventionStatus === 'draft' || this.interventionStatus === 'development') && !this.readonly) {
      return true;
    }
    return false;
  }
  // language=css
  static get styles() {
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      ActivitiesAndIndicatorsStyles,
      css`
        :host {
          display: block;
          position: relative;
        }
        .table-row {
          gap: 0;
          flex-direction: column;
          padding-right: 10%;
        }
        .main-info {
          display: flex;
          gap: 10px;
        }
        .details-heading {
          margin-bottom: 12px;
          font-size: 16px;
          font-weight: 700;
          line-height: 16px;
          color: #5c5c5c;
        }
        .details-container {
          text-align: left;
          padding-left: 0;
        }
        .details-list-item {
          font-size: 16px;
          font-weight: 400;
          line-height: 26px;
          color: #212121;
        }
        .table-row .details {
          display: flex;
          overflow: hidden;
          height: 0;
          transform: scaleY(0);
          transform-origin: top;
          transition: 0.25s;
          padding-top: 0;
          flex: none;
        }
        .details.opened {
          flex: 1 1 0%;
          height: auto;
          padding-top: 16px;
          transform: scaleY(1);
        }
        div.editable-row .hover-block {
          background: linear-gradient(270deg, var(--main-background) 71.65%, rgba(196, 196, 196, 0) 100%);
          padding-left: 20px;
        }
        .hf-mark {
          width: 15px;
          height: 15px;
          flex: none;
          margin-top: 5px;
          margin-left: 2px;
          border-radius: 50%;
          background-color: #2073b7;
        }
        .start-aligned {
          align-items: flex-start;
        }
      `
    ];
  }
}
