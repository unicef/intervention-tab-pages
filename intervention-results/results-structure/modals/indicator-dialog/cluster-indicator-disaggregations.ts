import {LitElement, html, property, customElement} from 'lit-element';
import {sharedStyles} from '../../../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../common/styles/button-styles';
import {Disaggregation, AnyObject} from '../../../../common/models/globals.types';

/**
 * @customElement
 */
@customElement('cluster-indicator-disaggregations')
export class ClusterIndicatorDisaggregations extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    return html`
      <style>
        ${sharedStyles} [hidden] {
          display: none !important;
        }
        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
        }
        paper-input {
          width: 100%;
        }
      </style>
      <div ?hidden="${!this.disaggregations.length}">
        ${this.disaggregations.map(
          (item: Disaggregation) => html`
            <div class="row-h ">
              <div class="col col-4">
                <div class="layout-vertical">
                  <label class="paper-label">Disaggregate By</label>
                  <label class="input-label" empty="${!item.name}">${item.name}</label>
                </div>
              </div>
              <div class="col col-8">
                <div class="layout-vertical">
                  <label class="paper-label">Disaggregation Groups</label>
                  <label class="input-label" empty="${!item.choices}">${this._getGroupNames(item.choices)}</label>
                </div>
              </div>
            </div>
          `
        )}
      </div>

      <div class="row-h" ?hidden="${!this._noDisaggregations(this.disaggregations, this.disaggregations.length)}">
        <p>There are no disaggregations added.</p>
      </div>
    `;
  }

  @property({type: Array})
  disaggregations: [] = [];

  _noDisaggregations(disaggregations: any, disaggregLength: number) {
    return !disaggregations || !disaggregLength;
  }
  _getGroupNames(groups: AnyObject[]) {
    if (!groups) {
      return '';
    }
    let groupNames = '';
    groups.forEach(function (g) {
      groupNames += g.value + '; ';
    });
    return groupNames;
  }
}
