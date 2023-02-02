import {css, CSSResult} from 'lit-element';

// language=css
export const CommentPanelsStyles: CSSResult = css`
  comments-list,
  messages-panel {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    box-shadow: 0 4px 10px 3px rgba(0, 0, 0, 0.17);
    border-radius: 11px;
    background-color: #ffffff;
    overflow: hidden;
    height: 100%;
    z-index: 15;
    transition: 0.5s;
  }
  .data-container {
    flex: auto;
    min-height: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }
  comments-panel-header,
  messages-panel-header {
    flex-wrap: nowrap;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    min-height: 64px;
    background-color: #009688;
    color: #ffffff;
  }
  comments-panel-header {
    padding: 0 24px 0 24px;
    cursor: move;
  }
  messages-panel-header {
    padding: 0 64px 0 24px;
  }
  .panel-header b {
    margin-left: 10px;
  }
  svg {
    cursor: pointer;
  }
  svg:last-child {
    margin-left: 28px;
  }
`;
