import {css, customElement, html, LitElement, property, TemplateResult} from 'lit-element';
import {translatesMap} from '../../utils/intervention-labels-map';
import {translate} from 'lit-translate';
import {GenericObject, LabelAndValue} from '@unicef-polymer/etools-types';
import {get as getTranslation} from 'lit-translate/util';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';

const ACTIONS: GenericObject<string> = {
  add: 'ADDED',
  update: 'UPDATED',
  create: 'CREATED',
  remove: 'REMOVED',
  original: 'ORIGINAL_VALUE'
};

@customElement('amendment-difference')
export class AmendmentDifference extends LitElement {
  static get styles() {
    // language=css
    return [
      css`
        .offset {
          position: relative;
          padding: 5px 0 5px 40px;
        }
        .field-name {
          margin: 0 0 10px;
          font-size: 15px;
        }
        .offset span {
          font-style: italic;
          font-size: 13px;
        }
        .action-name {
          display: inline-block;
          padding-bottom: 4px;
          margin-bottom: 10px;
        }
        span.changed-value {
          font-size: 16px;
          font-weight: 500;
          font-style: normal;
        }
        div.field-name + .offset:before {
          content: '';
          position: absolute;
          width: 5px;
          height: 25px;
          top: -9px;
          left: 25px;
          border: 1px solid transparent;
          border-bottom-color: var(--dark-divider-color);
          border-left-color: var(--dark-divider-color);
        }
        .offset:before {
          content: '';
          position: absolute;
          width: 5px;
          height: 32px;
          top: -16px;
          left: 25px;
          border: 1px solid transparent;
          border-bottom-color: var(--dark-divider-color);
          border-left-color: var(--dark-divider-color);
        }
        .value > .offset {
          padding: 0;
        }
        .value > .offset:before {
          content: none;
        }
      `
    ];
  }

  @property() difference!: GenericObject;

  render() {
    return this.difference && Object.keys(this.difference).length
      ? html`<div class="value">${this.displayDifference(this.difference)}</div>`
      : html`&#8212;`;
  }

  displayDifference(difference: GenericObject): TemplateResult[] {
    return Object.entries(difference as GenericObject).map(([field, diff]) => {
      let translatedString;
      if (!translatesMap[field]) {
        translatedString = field;
      } else {
        translatedString =
          typeof translatesMap[field] === 'string' ? translate(translatesMap[field]) : translatesMap[field]();
      }
      return html`<div class="offset">
        <div class="field-name">${translatedString || field}</div>
        ${this.getDifference(diff)}
      </div>`;
    });
  }

  getDifference(difference: GenericObject): TemplateResult | TemplateResult[] {
    if (['simple', 'many_to_one'].includes(difference.type)) {
      return html`<div class="offset">
        <span>${translate('PREVIOUS_VALUE')}</span> - ${this.getSimpleValue(difference.diff[0])};
        <span>${translate('CURRENT_VALUE')}</span> - ${this.getSimpleValue(difference.diff[1])}
      </div>`;
    } else if (['list[choices]', 'choices'].includes(difference.type)) {
      return this.getChoicesDiff(difference);
    } else if (difference.type === 'one_to_one') {
      return this.displayDifference(difference.diff);
    }
    return Object.entries(difference.diff as GenericObject).map(([action, value]: [string, GenericObject[]]) => {
      if (!value.length) {
        return html``;
      }
      if (action === 'update') {
        return html`
          <div class="offset">
            <span class="action-name">${translate(ACTIONS[action])}:</span>
            ${value.map(
              (item: GenericObject) => html`<div class="offset">
                <div class="field-name"><span class="changed-value">${item.name}</span></div>
                ${this.displayDifference(item.diff)}
              </div>`
            )}
          </div>
        `;
      } else {
        return html`<div class="offset">
          <span>${translate(ACTIONS[action])}:</span>
          <span class="changed-value">${this.getValue(value)}</span>
        </div>`;
      }
    });
  }

  getValue(valueArray: GenericObject[]): string {
    return valueArray.map(({name}) => name).join(' | ');
  }

  getSimpleValue(value: any): string {
    if (value === null || typeof value !== 'object') {
      return String(value);
    } else if (value.name) {
      return value.name;
    } else if (Object.hasOwnProperty.call(value, 'd') && Object.hasOwnProperty.call(value, 'v')) {
      return value.v === null
        ? getTranslation('UNKNOWN')
        : `${value.v}${value.d !== 1 && value.d !== 100 ? '/' + value.d : ''}`;
    } else {
      return JSON.stringify(value);
    }
  }

  private getChoicesDiff(difference: GenericObject): TemplateResult {
    const choices = this.getCollectionFromStore(difference.choices_key);
    const previous = [difference.diff[0]]
      .flat()
      .map((value) => choices.get(value) || value)
      .join(' | ');
    const current = [difference.diff[1]]
      .flat()
      .map((value) => choices.get(value) || value)
      .join(' | ');
    return html`<div class="offset">
      <span>${translate('PREVIOUS_VALUE')}</span> - ${previous}; <span>${translate('CURRENT_VALUE')}</span> - ${current}
    </div>`;
  }

  private getCollectionFromStore(key: string): Map<string, string> {
    let collectionKey = '';
    switch (key) {
      case 'cash_transfer_modalities':
        collectionKey = 'cashTransferModalities';
        break;
      case 'intervention_doc_type':
        collectionKey = 'documentTypes';
        break;
      case 'gender_rating':
      case 'equity_rating':
      case 'sustainability_rating':
        collectionKey = 'genderEquityRatings';
        break;
      case 'risk_type':
        collectionKey = 'riskTypes';
        break;
      case 'supply_item_provided_by':
        collectionKey = 'providedBy';
        break;
    }

    const collection: LabelAndValue[] = getStore().getState().commonData[collectionKey] || [];
    return new Map(collection.map(({label, value}) => [value, label]));
  }
}
