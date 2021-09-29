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
        margin-right: 5px;
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
              placeholder="Search"
              inline
            >
              <iron-icon icon="search" slot="prefix"></iron-icon>
            </paper-input>

            <div class="locations-list">
              ${repeat(
                this.displayedSites || [],
                (site: Site) => html`
                  <div
                    class="site-line ${this.getSiteLineClass(site.id)}"
                    @mouseenter="${() => this.onSiteHoverStart(site)}"
                  >
                    <div class="location-name" @tap="${() => this.onSiteLineClick(site)}">
                      <b>${site.name}</b>
                    </div>
                    <div class="deselect-btn" @tap="${() => this.onRemoveSiteClick(site)}">
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
    this.checkSelectedSitesExistence();
    this.mapInitialisation();
  }

  addSitesToMap(): void {
    if (!this.MapHelper.map || !this.displayedSites || this.MapHelper.markerClusters) {
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
    const isSelected: boolean = this.selectedSites.some((x: Site) => x.id === siteId);
    return isSelected ? 'selected' : '';
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
      this.addSitesToMap();
    }
    this.setInitialMapView();
  }

  private setInitialMapView(): void {
    setTimeout(
      () => {
        this.MapHelper.map!.invalidateSize();
        const reversedCoords: LatLngTuple = [...this.defaultMapCenter].reverse() as LatLngTuple;
        const zoom = 6;
        this.MapHelper.map!.setView(reversedCoords, zoom);
      },
      500,
      this
    );
  }
}
