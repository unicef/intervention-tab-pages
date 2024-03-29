import {GenericObject} from '@unicef-polymer/etools-types';
import {Map, Marker} from 'leaflet';
const TILE_LAYER: Readonly<string> = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
const TILE_LAYER_LABELS: Readonly<string> = 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png';
const arcgisWebmapId = '71608a6be8984b4694f7c613d7048114'; // Default WebMap ID
declare const L: any;

export interface IMarker extends Marker {
  staticData?: any;
}

export type MarkerDataObj = {
  coords: [number, number];
  staticData?: any;
  popup?: string;
};

export const defaultIcon = L.icon({
  iconUrl: 'node_modules/leaflet/dist/images/marker-icon.png',
  iconSize: [25, 41],
  shadowSize: [41, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28]
});

export const markedIcon = L.icon({
  iconUrl: 'node_modules/leaflet/dist/images/marker-icon.png',
  iconSize: [25, 41],
  shadowSize: [41, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  className: 'selectedMarker'
});

export class MapHelper {
  map: Map | null = null;
  webmap!: GenericObject;
  staticMarkers: IMarker[] | null = null;
  dynamicMarker: IMarker | null = null;
  markerClusters: any | null = null;

  arcgisMapIsAvailable(): Promise<boolean> {
    return fetch(`https://www.arcgis.com/sharing/rest/content/items/${arcgisWebmapId}?f=json`)
      .then((res) => res.json())
      .then((data) => {
        return !data.error;
      })
      .catch((e: any) => {
        console.log('arcgisMapIsAvailable error: ', e);
        return false;
      });
  }

  async initMap(element: HTMLElement) {
    if (!element) {
      throw new Error('Please provide HTMLElement for map initialization!');
    }
    if (sessionStorage.getItem('arcgisMapIsAvailable') === null) {
      await this.arcgisMapIsAvailable().then((res: boolean) => {
        sessionStorage.setItem('arcgisMapIsAvailable', JSON.stringify(res));
      });
    }

    const arcgisMapIsAvailable = JSON.parse(sessionStorage.getItem('arcgisMapIsAvailable') || '');
    arcgisMapIsAvailable ? this.initArcgisMap(element) : this.initOpenStreetMap(element);
  }

  initOpenStreetMap(element: HTMLElement): void {
    L.Icon.Default.imagePath = '/fm/assets/images/';
    this.map = L.map(element);
    L.tileLayer(TILE_LAYER, {pane: 'tilePane'}).addTo(this.map);
    L.tileLayer(TILE_LAYER_LABELS, {pane: 'overlayPane'}).addTo(this.map);
    // compliance for waitForMapToLoad
    setTimeout(() => {
      this.webmap = {_loaded: true};
    }, 10);
  }

  initArcgisMap(mapElement: HTMLElement): void {
    this.webmap = (L as any).esri.webMap(arcgisWebmapId, {map: L.map(mapElement), maxZoom: 20, minZoom: 2});
    this.map = this.webmap._map;
  }

  setStaticMarkers(markersData: MarkerDataObj[]): void {
    this.removeStaticMarkers();
    const markers: Marker[] = [];
    markersData.forEach((data: MarkerDataObj) => {
      const marker: IMarker = this.createMarker(data);
      markers.push(marker);
    });
    this.staticMarkers = markers;
  }

  waitForMapToLoad(): Promise<boolean> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!(this.webmap && this.webmap._loaded)) {
          return;
        }
        clearInterval(interval);
        resolve(true);
      }, 100);
    });
  }

  addCluster(markersData: MarkerDataObj[], onclick?: (e: any) => void): void {
    this.markerClusters = (L as any).markerClusterGroup();
    const markers: Marker[] = [];
    let marker: IMarker;
    (markersData || []).forEach((mark: MarkerDataObj) => {
      const markerPopup = L.popup({closeButton: false}).setContent(`<b>${mark.popup}</b>`);
      marker = L.marker(mark.coords).bindPopup(markerPopup);
      marker.staticData = mark.staticData;
      if (onclick) {
        marker.on('click', function (e) {
          onclick(e);
        });
      }
      markers.push(marker);
      this.markerClusters.addLayer(marker);
    });
    (this.map as Map).setMaxZoom(19);
    (this.map as Map).addLayer(this.markerClusters);
    this.staticMarkers = markers;
  }

  addStaticMarker(markerData: MarkerDataObj): void {
    if (!this.staticMarkers) {
      this.staticMarkers = [];
    }
    const marker: IMarker = this.createMarker(markerData);
    this.staticMarkers.push(marker);
  }

  removeStaticMarkers(): void {
    if (this.map && this.staticMarkers && this.staticMarkers.length) {
      this.staticMarkers.forEach((marker: Marker) => marker.removeFrom(this.map as Map));
      this.staticMarkers = [];
    }
  }

  removeStaticMarker(dataId: number): void {
    const markers: IMarker[] = this.staticMarkers || [];
    const index: number = markers.findIndex(({staticData}: any) => staticData && staticData.id === dataId);
    if (~index && this.staticMarkers) {
      this.staticMarkers[index].removeFrom(this.map as Map);
      this.staticMarkers.splice(index, 1);
    }
  }

  markerExists(dataId: number): boolean {
    return !!(
      this.staticMarkers && ~this.staticMarkers.findIndex(({staticData}: any) => staticData && staticData.id === dataId)
    );
  }

  reCheckMarkers(dataIds: number[]): void {
    const markers: IMarker[] = this.staticMarkers || [];
    const markersForRemove: IMarker[] = markers.filter(
      ({staticData}: any) => staticData && !~dataIds.indexOf(staticData.id)
    );
    markersForRemove.forEach(({staticData}: any) => this.removeStaticMarker(staticData.id));
  }

  addDynamicMarker(cordinates: [number, number]): void {
    if (!this.map) {
      throw new Error('Please, initialize map!');
    }
    this.removeDynamicMarker();
    this.dynamicMarker = L.marker(cordinates).addTo(this.map);
  }

  changeDMLocation(cordinates: [number, number]): void {
    if (!this.map) {
      throw new Error('Please, initialize map!');
    }
    if (!this.dynamicMarker) {
      this.addDynamicMarker(cordinates);
    } else {
      this.dynamicMarker.setLatLng(cordinates);
    }
  }

  removeDynamicMarker(): void {
    if (!this.map) {
      throw new Error('Please, initialize map!');
    }
    if (this.dynamicMarker) {
      this.dynamicMarker.removeFrom(this.map);
    }
  }

  invalidateSize(): Map | null {
    return this.map && this.map.invalidateSize();
  }

  private createMarker(data: MarkerDataObj): IMarker {
    const marker: IMarker = L.marker(data.coords).addTo(this.map as Map);
    marker.staticData = data.staticData;
    if (data.popup) {
      const markerPopup = L.popup({closeButton: false}).setContent(`<b>${data.popup}</b>`);
      marker.bindPopup(markerPopup);
    }

    return marker;
  }
}
