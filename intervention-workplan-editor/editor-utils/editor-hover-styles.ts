import {css} from 'lit-element';

export const EditorHoverStyles = css`
  tbody[hoverable]:not([in-edit-mode]):hover {
    background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1));
  }
  tbody[hoverable] > tr.action-btns:not([type='cp-output']) {
    height: 80px;
  }

  tbody[hoverable] > tr.action-btns > td.action-btns > div.action-btns {
    opacity: 0;
  }
  tbody[hoverable]:not([in-edit-mode]):hover > tr.action-btns > td.action-btns > div.action-btns {
    opacity: 1;
  }
  tbody[hoverable]:not([in-edit-mode]):focus-within > tr.action-btns > td.action-btns > div.action-btns {
    opacity: 1;
  }

  .hover-block {
    opacity: 0;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 10px;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    background-color: #e6e5e5;
  }

  .activity-items-row:not([in-edit-mode]):hover {
    background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1));
  }

  tr.activity-items-row:not([in-edit-mode]):hover > td.action-btns > div.hover-block {
    opacity: 1;
  }

  .align-bottom {
    position: absolute;
    bottom: 5px;
    right: 10px;
  }
`;
