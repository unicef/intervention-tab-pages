import {css, CSSResult} from 'lit-element';

// language=css
export const ActivityTimeframesStyles: CSSResult = css`
  :host {
    display: block;
    margin-bottom: 24px;
  }
  .time-frames {
    max-width: 1000px;
    width: 100%;
  }
  .year-divider {
    width: 100%;
    max-width: 950px;
    border-bottom: 1px solid var(--light-hex-divider-color);
    margin: 20px 0;
  }
  .frames-grid {
    display: grid;
    position: relative;
    grid-template-columns: 100px auto;
    grid-column-gap: 33px;
    grid-row-gap: 11px;
    align-items: center;
  }
  .frames-grid:not([rtl]):after {
    content: '';
    position: absolute;
    top: 5%;
    left: 116px;
    height: 90%;
    border-inline-start: 1px solid var(--light-hex-divider-color);
  }

  .frames-grid[rtl]:after {
    content: '';
    position: absolute;
    top: 5%;
    right: 116px; /*Little browser support for inset-inline-start*/
    height: 90%;
    border-inline-start: 1px solid var(--light-hex-divider-color);
  }

  .activities-container,
  .frame {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 5px 0;
  }
  .activities-container {
    align-items: flex-start;
  }
  .frame:not(.hide-border):after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 5%;
    width: 90%;
    border-top: 1px solid var(--light-divider-color);
  }
  .activities-container:not(.hide-border):after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 90%;
    border-top: 1px solid var(--light-divider-color);
  }
  .year {
    padding: 0 16px;
  }
  .year,
  .frame-name {
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
    color: var(--primary-text-color);
  }
  .no-activities,
  .frame-dates {
    font-size: 12px;
    line-height: 16px;
    color: var(--primary-text-color);
  }
  .activity-name {
    font-weight: 500;
    font-size: 12px;
    line-height: 20px;
    color: var(--primary-text-color);
  }
`;
