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
    height: 550px;
    overflow: hidden;
    z-index: 15;
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
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    background-color: #009688;
    padding: 0 54px 0 24px;
    color: #ffffff;
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
