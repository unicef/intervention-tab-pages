import {css, CSSResult} from 'lit';

// language=CSS
export const LocationWidgetStyles: CSSResult = css`
  :host {
    position: relative;
    width: 100%;
  }

  .widget-container {
    position: relative;
    display: flex;
    flex-direction: column;
    z-index: 0;
  }

  .widget-container a.link {
    color: var(--primary-color);
    cursor: pointer;
  }

  .widget-container .map-and-list {
    display: flex;
    width: 100%;
    max-height: 320px;
    box-sizing: border-box;
    padding: 12px 0;
  }

  .widget-container .map-and-list #map {
    width: 70%;
    height: 300px;
    margin-inline-end: 25px;
  }

  .widget-container .map-and-list .list {
    width: 30%;
    overflow: hidden;
  }

  .locations-list {
    display: flex;
    flex: 1;
    flex-flow: column;
    height: calc(100% - 43px);
    position: relative;
    overflow-y: auto;
  }

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
    margin-inline-end: 5px;
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
  .missing-sites,
  .no-search-results {
    position: absolute;
    top: 0;
    left: 0;
  }
  div:focus-visible {
    outline: none !important;
    box-shadow:
      0 6px 10px 0 rgba(0, 0, 0, 0.14),
      0 1px 18px 0 rgba(0, 0, 0, 0.12),
      0 3px 5px -1px rgba(0, 0, 0, 0.4);
  }

  @media (max-width: 768px) {
    .widget-container .map-and-list {
      flex-wrap: wrap;
      max-height: none;
    }
    .widget-container .map-and-list #map,
    .widget-container .map-and-list .list {
      width: 100% !important;
    }
  }
`;
