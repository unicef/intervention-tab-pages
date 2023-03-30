import {
  CSSResultArray,
  customElement,
  html,
  LitElement,
  property,
  PropertyValues,
  query,
  TemplateResult
} from 'lit-element';
import {repeat} from 'lit-html/directives/repeat';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {LatLngTuple} from 'leaflet';
import {IMarker, MapHelper, defaultIcon, markedIcon, MarkerDataObj} from './map-mixin';
import {LocationWidgetStyles} from './location-widget.styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {leafletStyles} from './leaflet-styles';
import {Site} from '@unicef-polymer/etools-types';
import {debounce} from '@unicef-polymer/etools-modules-common/dist/utils/debouncer';
import {translate} from 'lit-translate';
import {callClickOnSpacePushListener} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';

const DEFAULT_COORDINATES: LatLngTuple = [-0.09, 51.505];

@customElement('sites-widget')
export class LocationSitesWidgetComponent extends connectStore(LitElement) {
  @property() selectedSites: Site[] = [];
  @property() sites: Site[] = [];
  @property() displayedSites!: Site[];
  @property() workspaceCoordinates!: [number, number];

  @property({type: String, reflect: true}) locationSearch = '';

  @property() private mapInitializationProcess = false;
  @query('#map') private mapElement!: HTMLElement;

  protected defaultMapCenter: LatLngTuple = DEFAULT_COORDINATES;
  private MapHelper!: MapHelper;

  static get styles(): CSSResultArray {
    return [elevationStyles, gridLayoutStylesLit, LocationWidgetStyles, leafletStyles];
  }
  get itemStyle(): string {
    // language=CSS
    return `
      .site-line {
        position: relative;
        display: flex;
        padding: 5px;
        margin-bottom: 2px;
      }

      .site-line:last-child{
        margin-bottom: 0;
      }

      .site-line:hover {
        background-color: var(--gray-06);
        cursor: pointer;
      }

      .site-line .gateway-name {
        flex: none;
        width: 100px;
        color: var(--gray-light);
      }

      .site-line .location-name {
        flex: auto;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-inline-end: 5px;
      }

      .site-line .deselect-btn {
        flex: none;
        width: 50px;
        text-align: center;
        color: #dd0000;
      }

      .site-line .deselect-btn span {
        display: none;
      }

      .site-line.selected {
        background-color: #f3e5bf;
      }

      .site-line.selected .deselect-btn span {
        display: inline;
      }

      .locations-list div:not(.missing-sites) ~ .no-search-results,
      .locations-list div.missing-sites:not([hidden]) + .no-search-results {
        display: none;
      }`;
  }

  protected get loadingInProcess(): boolean {
    return this.mapInitializationProcess;
  }

  protected render(): TemplateResult {
    return html`
      ${sharedStyles}
      <style>
        /* changes marker color by default blue to orange-ish */
        .selectedMarker {
          filter: hue-rotate(160deg);
        }
      </style>
      <div class="widget-container">
        <div class="map-and-list">
          <div id="map"></div>
          <div class="list">
            <paper-input
              class="search-input"
              type="search"
              .value="${this.locationSearch}"
              @value-changed="${({detail}: CustomEvent<{value: string}>) => this.search(detail)}"
              placeholder="${translate('INTERVENTIONS_LIST.SEARCH_RECORDS')}"
              inline
            >
              <iron-icon icon="search" slot="prefix"></iron-icon>
            </paper-input>

            <div class="locations-list" tabindex="0">
              ${repeat(
                this.displayedSites || [],
                (site: Site) => html`
                  <div
                    class="site-line ${this.getSiteLineClass(site.id)}"
                    @mouseenter="${() => this.onSiteHoverStart(site)}"
                    @keypress="${this.onSiteKeyPress}"
                    tabindex="-1"
                  >
                    <div class="location-name" tabindex="0" @tap="${() => this.onSiteLineClick(site)}">
                      <b>${site.name}</b>
                    </div>
                    <div
                      class="deselect-btn"
                      id="deselect_btn_${site.id}"
                      tabindex="${this.isSiteSelected(site.id) ? 0 : -1}"
                      @tap="${() => this.onRemoveSiteClick(site)}"
                    >
                      <span>&#10008;</span>
                    </div>
                  </div>
                `
              )}
              <etools-loading ?active="${this.loadingInProcess}"></etools-loading>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.MapHelper = new MapHelper();
    this.mapInitializationProcess = true;

    this.defaultMapCenter = this.workspaceCoordinates || DEFAULT_COORDINATES;
    this.displayedSites = (this.sites || []).filter((s: Site) => s.is_active);
    this.onSiteHoverStart = debounce(this.onSiteHoverStart.bind(this), 300) as any;
    this.checkSelectedSitesExistence();
    this.mapInitialisation();
  }

  addSitesToMap(): void {
    if (!this.MapHelper.map || this.MapHelper.markerClusters) {
      return;
    }

    const siteClick = this.onSiteClick.bind(this);
    const reversedMarks: MarkerDataObj[] = [];
    (this.displayedSites || []).forEach((location) => {
      reversedMarks.push({
        coords: [location.point.coordinates[1], location.point.coordinates[0]],
        staticData: location,
        popup: location.name
      });
    });
    this.MapHelper.addCluster(reversedMarks, siteClick);
    this.requestUpdate();
    setTimeout(() => {
      this.markSelectedSitesOnMap();
      this.setInitialMapView();
    }, 100);
  }

  markSelectedSitesOnMap(): void {
    (this.selectedSites || []).forEach((site) => this.setMarkerIcon(site.id, true));
  }

  onSiteHoverStart(site: Site): void {
    const marker = (this.MapHelper.staticMarkers || []).find((marker: IMarker) => marker.staticData.id === site.id);
    if (marker) {
      this.MapHelper.markerClusters.zoomToShowLayer(marker, () => {
        setTimeout(() => {
          marker.openPopup();
        }, 10);
      });
    }
  }

  onSiteKeyPress(event: KeyboardEvent) {
    if (event.key === ' ' && !event.ctrlKey) {
      // prevent scrolling if user add/remove sites with keyboard
      event.preventDefault();
    }
  }

  addSiteToSelected(site: Site) {
    if (!this.selectedSites.some((x: Site) => x.id === site.id)) {
      this.selectedSites.push(site);
      this.setMarkerIcon(site.id, true);
      this.onSitesSelectionChange();
    }
  }

  onSiteLineClick(site: Site): void {
    this.addSiteToSelected(site);
  }

  onSiteClick(e: CustomEvent): void {
    this.addSiteToSelected((e.target as any).staticData as Site);
  }

  onRemoveSiteClick(site: Site): void {
    this.selectedSites = this.selectedSites.filter((x) => x.id !== site.id);
    this.setMarkerIcon(site.id, false);
    this.onSitesSelectionChange();
    setTimeout(() => {
      // move focus on site name(needed for tab navigation)
      const el = this.shadowRoot?.querySelector(`#deselect_btn_${site.id}`);
      if (el && el.previousElementSibling) {
        (el.previousElementSibling as HTMLDivElement).focus();
      }
    }, 50);
  }

  onSitesSelectionChange(): void {
    fireEvent(this, 'sites-changed', {sites: [...this.selectedSites]});
    this.requestUpdate();
  }

  setMarkerIcon(id: number, selected: boolean) {
    const marker = this.MapHelper.staticMarkers?.filter((m) => m.staticData.id === id);
    if (marker && marker.length) {
      marker[0].setIcon(selected ? markedIcon : defaultIcon);
    }
  }

  getSiteLineClass(siteId: number | string): string {
    return this.isSiteSelected(siteId) ? 'selected' : '';
  }

  isSiteSelected(siteId: number | string): boolean {
    return this.selectedSites.some((x: Site) => x.id === siteId);
  }

  search({value}: {value: string} = {value: ''}): void {
    if (this.locationSearch !== value) {
      this.locationSearch = value;
      if (this.locationSearch) {
        this.displayedSites = this.sites.filter((site: Site) => {
          return site.name.toLowerCase().includes(value.toLowerCase());
        });
      } else {
        this.displayedSites = [...this.sites];
      }
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.mapInitialisation();
  }

  private checkSelectedSitesExistence(): void {
    if (!this.selectedSites || !this.selectedSites.length) {
      return;
    }

    const allSiteIDs = this.sites.map((x) => x.id);
    const missingSitesIDs = this.selectedSites.filter((x: Site) => !allSiteIDs.includes(x.id)).map((x) => x.id);

    if (missingSitesIDs.length > 0) {
      console.warn(`These sites are missing in list: ${missingSitesIDs.join(',')}. They will be removed from selected`);
      this.selectedSites = this.selectedSites.filter((site) => !missingSitesIDs.includes(site.id));
    }
  }

  private mapInitialisation(): void {
    if (!this.mapElement || !this.displayedSites) {
      return;
    }
    if (this.mapInitializationProcess) {
      this.mapInitializationProcess = false;
      this.MapHelper.initMap(this.mapElement);
      this.MapHelper.waitForMapToLoad().then(() => {
        this.addSitesToMap();
      });
    }
  }

  private setInitialMapView(): void {
    setTimeout(
      () => {
        this.MapHelper.map!.invalidateSize();
        const reversedCoords: LatLngTuple = [...this.defaultMapCenter].reverse() as LatLngTuple;
        const zoom = 6;
        this.MapHelper.map!.setView(reversedCoords, zoom);
        this.addClickOnSpaceForSites();
      },
      500,
      this
    );
  }

  private addClickOnSpaceForSites() {
    this.shadowRoot!.querySelectorAll('.location-name, .deselect-btn').forEach((el) =>
      callClickOnSpacePushListener(el)
    );
  }
}
