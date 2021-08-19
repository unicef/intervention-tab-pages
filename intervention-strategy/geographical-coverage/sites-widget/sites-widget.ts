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
import {connectStore} from '../../../../../etools-pages-common/mixins/connect-store-mixin';
import {LatLngTuple} from 'leaflet';
import {IMarker, MapHelper, defaultIcon, markedIcon} from './map-mixin';
import {LocationWidgetStyles} from './location-widget.styles';
import {gridLayoutStylesLit} from '../../../../../etools-pages-common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../../../../etools-pages-common/styles/shared-styles-lit';
import {elevationStyles} from '../../../../../etools-pages-common/styles/elevation-styles';
import {fireEvent} from '../../../../../etools-pages-common/utils/fire-custom-event';
import {leafletStyles} from './leaflet-styles';

const DEFAULT_COORDINATES: LatLngTuple = [-0.09, 51.505];

@customElement('sites-widget')
export class LocationSitesWidgetComponent extends connectStore(LitElement) {
  @property() selectedSites: number[] = [];
  @property() allSites: Site[] = [];
  @property() sites!: Site[];
  @property() workspaceCoordinates!: [number, number];

  @property({type: String, reflect: true}) locationSearch = '';

  @property() private mapInitializationProcess = false;
  @query('#map') private mapElement!: HTMLElement;

  protected defaultMapCenter: LatLngTuple = DEFAULT_COORDINATES;
  private MapHelper!: MapHelper;
  private sitesLoading = true;

  static get styles(): CSSResultArray {
    return [elevationStyles, gridLayoutStylesLit, LocationWidgetStyles, leafletStyles];
  }
  get itemStyle(): string {
    // language=CSS
    return `
      .site-line,
      .location-line {
        position: relative;
        display: flex;
        padding: 5px;
        margin-bottom: 2px;
      }

      .site-line:last-child,
      .location-line:last-child {
        margin-bottom: 0;
      }

      .site-line:hover,
      .location-line:hover {
        background-color: var(--gray-06);
        cursor: pointer;
      }

      .site-line .gateway-name,
      .location-line .gateway-name {
        flex: none;
        width: 100px;
        color: var(--gray-light);
      }

      .site-line .location-name,
      .location-line .location-name {
        flex: auto;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-right: 5px;
      }

      .site-line .deselect-btn,
      .location-line .deselect-btn {
        flex: none;
        width: 50px;
        text-align: center;
        color: #dd0000;
      }

      .site-line .deselect-btn span,
      .location-line .deselect-btn span {
        display: none;
      }

      .site-line.selected,
      .location-line.selected .deselect-btn {
        background-color: #f3e5bf;
      }

      .site-line.selected .deselect-btn span,
      .location-line.selected .deselect-btn span {
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
                this.sites || [],
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
    this.sites = (this.allSites || []).filter((s: Site) => s.is_active);
    this.mapInitialisation();
    if (this.selectedSites.length) {
      this.checkSelectedSites(this.selectedSites);
    }
  }

  addSitesToMap(): void {
    if (!this.MapHelper.map || !this.sites || this.MapHelper.markerClusters) {
      return;
    }

    const siteClick = this.onSiteClick.bind(this);
    const reversedMarks: MarkerDataObj[] = [];
    (this.sites || []).forEach((location) => {
      reversedMarks.push({
        coords: [location.point.coordinates[1], location.point.coordinates[0]],
        staticData: location,
        popup: location.name
      });
    });
    this.MapHelper.addCluster(reversedMarks, siteClick);
    this.requestUpdate();
    setTimeout(() => {
      this.showSelectedSite();
    }, 100);
  }

  showSelectedSite(): void {
    if (this.selectedSites && this.selectedSites.length) {
      const site = {id: this.selectedSites[0]} as Site;
      this.onSiteHoverStart(site);
      this.onSiteLineClick(site);
    }
  }

  onSiteHoverStart(location: Site): void {
    const site = (this.MapHelper.staticMarkers || []).find((marker: IMarker) => marker.staticData.id === location.id);
    if (site) {
      this.MapHelper.markerClusters.zoomToShowLayer(site, () => {
        setTimeout(() => {
          site.openPopup();
        }, 10);
      });
    }
  }

  onSiteLineClick(site: Site): void {
    this.selectedSites.push(site.id);
    this.selectedSites = [...new Set(this.selectedSites)];
    this.setMarkerSelected(site.id, true);
    this.onSitesSelectionChange();
  }

  onSiteClick(e: CustomEvent): void {
    const id = (e.target as any).staticData.id;
    this.selectedSites.push(id);
    this.selectedSites = [...new Set(this.selectedSites)];
    this.setMarkerSelected(id, true);
    this.onSitesSelectionChange();
  }

  onRemoveSiteClick(site: Site): void {
    this.selectedSites = this.selectedSites.filter((x) => x !== site.id);
    this.setMarkerSelected(site.id, false);
    this.onSitesSelectionChange();
  }

  onSitesSelectionChange(): void {
    fireEvent(this, 'sites-changed', {sites: [...this.selectedSites]});
    this.requestUpdate();
  }

  setMarkerSelected(id: number, selected: boolean) {
    const marker = this.MapHelper.staticMarkers?.filter((m) => m.staticData.id === id);
    if (marker && marker.length) {
      marker[0].setIcon(selected ? markedIcon : defaultIcon);
      // const icon = {...marker[0].getIcon()};
      // icon.options.iconUrl = selected ? 'marker-icon-yellow.png' : 'marker-icon.png';
      // marker[0].setIcon(icon);
    }
  }

  getSiteLineClass(siteId: number | string): string {
    const isSelected: boolean = this.selectedSites.findIndex((id: number) => id === siteId) !== -1;
    return isSelected ? 'selected' : '';
  }

  search({value}: {value: string} = {value: ''}): void {
    if (this.locationSearch !== value) {
      this.locationSearch = value;
      if (this.locationSearch) {
        this.sites = this.allSites.filter((site: Site) => {
          return site.name.toLowerCase().includes(value.toLowerCase());
        });
      } else {
        this.sites = [...this.allSites];
      }
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.mapInitialisation();
  }

  protected updated(changedProperties: PropertyValues): void {
    const oldSelectedSites: number[] | undefined = changedProperties.get('selectedSites') as number[] | undefined;
    if (oldSelectedSites || changedProperties.has('mapInitializationProcess')) {
      this.checkSelectedSites(this.selectedSites);
    }
  }

  private checkSelectedSites(selectedSites: number[]): void {
    if (this.mapInitializationProcess) {
      return;
    }

    if (this.sitesLoading || !selectedSites.length) {
      return;
    }

    const missingSites: number[] = selectedSites.filter(
      (siteId: number) => this.allSites.findIndex((site: Site) => site.id === siteId) === -1
    );

    if (missingSites.length !== 0) {
      console.warn(`This sites are missing in list: ${missingSites}. They will be removed from selected`);
      this.selectedSites = selectedSites.filter((siteId: number) => !missingSites.includes(siteId));
      missingSites.forEach((siteId: number) => this.MapHelper.removeStaticMarker(siteId));
    }
  }

  private mapInitialisation(): void {
    if (!this.mapElement || !this.sites) {
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
