import {Map, Marker} from 'leaflet';
declare const L: any;

const TILE_LAYER: Readonly<string> = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
const TILE_LAYER_LABELS: Readonly<string> = 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png';

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
  staticMarkers: IMarker[] | null = null;
  dynamicMarker: IMarker | null = null;
  markerClusters: any | null = null;

  initMap(element?: HTMLElement | null): Map | null {
    if (!element) {
      throw new Error('Please provide HTMLElement for map initialization!');
    }
    this.map = L.map(element);
    L.tileLayer(TILE_LAYER, {pane: 'tilePane'}).addTo(this.map);
    L.tileLayer(TILE_LAYER_LABELS, {pane: 'overlayPane'}).addTo(this.map);
    return this.map;
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
