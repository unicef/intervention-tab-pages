import {LitElement, html, TemplateResult, css} from 'lit';
import {property, customElement, query} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {ResultStructureStyles} from './styles/results-structure.styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {CommentElementMeta, CommentsMixin} from '../../common/components/comments/comments-mixin';
import {Disaggregation, DisaggregationValue} from '@unicef-polymer/etools-types';
import {Indicator} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import {addCurrencyAmountDelimiter} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {ActivitiesAndIndicatorsStyles} from './styles/ativities-and-indicators.styles';
import {getIndicatorDisplayType} from '../../utils/utils';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import {_canDeactivate, _canDelete} from '../../common/mixins/results-structure-common';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
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
  @property({type: String})
  @query('#view-menu-button')
  actionsMenuBtn!: SlDropdown;

  inAmendmentDate!: string;

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
        style="padding-inline-end: 0 !important"
        related-to="indicator-${this.indicator.id}"
        related-to-description="${this.indicator.indicator?.title}"
        comments-container
        @sl-show="${(event: CustomEvent) => (event.currentTarget as HTMLElement)!.classList.add('active')}"
        @sl-hide="${(event: CustomEvent) => (event.currentTarget as HTMLElement)!.classList.remove('active')}"
      >
        <div class="main-info" style="padding-inline-end:10%">
          <!--    Indicator name    -->
          <div class="left-align layout-vertical start-aligned">
            <div class="name layout-horizontal">
              ${getIndicatorDisplayType(this.indicator.indicator)} ${this.addInactivePrefix(this.indicator)}
              ${(this.indicator.indicator ? this.indicator.indicator.title : this.indicator.cluster_indicator_title) ||
              '—'}

              <etools-info-tooltip position="top" custom-icon offset="0">
                <div id="hf" slot="custom-icon" class="hf-mark" ?hidden="${!this.indicator.is_high_frequency}"></div>
                <span class="no-wrap" slot="message">${translate('THIS_INDICATOR_IS_HIGH_FREQUENCY')}</span>
              </etools-info-tooltip>
            </div>
            <div class="item-link indent" @click="${() => (this.detailsOpened = !this.detailsOpened)}">
              ${translate(this.detailsOpened ? 'HIDE' : 'SHOW')} ${this.locationNames.length} ${translate('LOCATIONS')}
              | ${this.indicator.disaggregation.length} ${translate('DISAGGREGATIONS')}
            </div>
          </div>
          <!--    Baseline    -->
          <div class="secondary-cell right">
            ${this._displayBaselineOrTarget(this.indicator.baseline, this.indicator)}
          </div>

          <!--    Target    -->
          <div class="secondary-cell right">
            ${this._displayBaselineOrTarget(this.indicator.target, this.indicator)}
          </div>

          <div
            class="show-actions hover-block"
            style="z-index: ${99 - (this.index || 0)}; max-height: 59px;"
            ?hidden="${this.commentMode}"
          >
            <sl-dropdown distance="-65" id="view-menu-button">
              <etools-icon-button slot="trigger" name="more-vert"></etools-icon-button>
              <sl-menu>
                <sl-menu-item
                  class="action"
                  ?hidden="${!this._canEdit() && !this._canView()}"
                  @click="${() => this.openIndicatorDialog(this.indicator, this.readonly)}"
                >
                  <etools-icon slot="prefix" name="${this._canEdit() ? 'create' : 'visibility'}"></etools-icon>
                  ${this._canEdit() ? translate('EDIT') : translate('VIEW')}
                </sl-menu-item>
                <sl-menu-item
                  class="action"
                  ?hidden="${!_canDeactivate(
                    this.indicator,
                    this.readonly,
                    this.interventionStatus,
                    this.inAmendment,
                    this.inAmendmentDate
                  )}"
                  @click="${() => this.openDeactivationDialog(String(this.indicator.id))}"
                >
                  <etools-icon slot="prefix" name="block"></etools-icon>
                  ${translate('DEACTIVATE')}
                </sl-menu-item>
                <sl-menu-item
                  class="action delete-action"
                  ?hidden="${!_canDelete(
                    this.indicator,
                    this.readonly,
                    this.interventionStatus,
                    this.inAmendment,
                    this.inAmendmentDate
                  )}"
                  @click="${() => this.openDeletionDialog(String(this.indicator.id))}"
                >
                  <etools-icon slot="prefix" name="delete"></etools-icon>
                  ${translate('DELETE')}
                </sl-menu-item>
              </sl-menu>
            </sl-dropdown>
          </div>
        </div>
        <div class="details indent ${this.detailsOpened ? 'opened' : ''}" style="max-height:350px; overflow-y:auto">
          ${this.additionalTemplate()}
        </div>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.closeMenuOnScroll = this.closeMenuOnScroll.bind(this);
    this.getScrollableArea().addEventListener('scroll', this.closeMenuOnScroll, false);
  }

  // Scroll happens on this area, not on window
  getScrollableArea() {
    return document!
      .querySelector('app-shell')!
      .shadowRoot!.querySelector('#appHeadLayout')!
      .shadowRoot!.querySelector('#contentContainer')!;
  }

  closeMenuOnScroll() {
    this.actionsMenuBtn.removeAttribute('focused');
    setTimeout(() => (this.actionsMenuBtn.open = false));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.getScrollableArea().removeEventListener('scroll', this.closeMenuOnScroll, false);
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
    return !indicator || indicator.is_active ? '' : html`<strong>(${getTranslation('INACTIVE')})</strong>`;
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

  _canEdit() {
    return this.indicator.is_active && !this.readonly;
  }

  _canView() {
    return this.readonly || !this.indicator.is_active;
  }

  // language=css
  static get styles() {
    return [
      layoutStyles,
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
          padding-inline-end: 10%;
        }
        .main-info {
          display: flex;
          gap: 10px;
        }
        .details-heading {
          margin-bottom: 12px;
          font-size: var(--etools-font-size-16, 16px);
          font-weight: 700;
          line-height: 16px;
          color: #5c5c5c;
        }
        .details-container {
          text-align: left;
          padding-inline-start: 0;
        }
        .details-list-item {
          font-size: var(--etools-font-size-16, 16px);
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
          padding-inline-start: 20px;
        }
        .hf-mark {
          width: 15px;
          height: 15px;
          flex: none;
          margin-inline-start: 2px;
          border-radius: 50%;
          background-color: #2073b7;
        }
        .start-aligned {
          align-items: flex-start;
        }
        sl-dropdown sl-menu-item:focus-visible::part(base) {
          background-color: rgba(0, 0, 0, 0.1);
          color: var(--sl-color-neutral-1000);
        }
      `
    ];
  }
}
