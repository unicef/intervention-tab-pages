import {css} from 'lit-element';

export const EditorHoverStyles = css`
  tbody[hoverable]:hover {
    background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1));
  }

  tbody > tr.action-btns > td.action-btns > .action-btns {
    visibility: hidden;
  }
  tbody[hoverable]:hover > tr.action-btns > td.action-btns > .action-btns {
    visibility: visible;
  }
  tbody[hoverable]:focus-within > tr.action-btns > td.action-btns > .action-btns {
    visibility: visible;
  }

  .hover-block {
    visibility: hidden;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 10px;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    background-color: #cdcdcd;
    min-width: 40px;
  }

  .activity-items-row[hoverable]:hover {
    background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1));
  }

  tr.activity-items-row[hoverable]:hover > td.action-btns > div.hover-block {
    visibility: visible;
  }

  tr.activity-items-row[hoverable] > td.action-btns:focus-within > div.hover-block {
    visibility: visible;
  }

  .align-bottom {
    position: absolute;
    bottom: 8px;
    right: 10px;
  }

  .height-for-action-btns {
    height: 80px;
  }
`;
