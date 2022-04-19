import {css} from 'lit-element';

export const EditorHoverStyles = css`
  tbody[hoverable]:hover {
    background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1));
  }

  tbody[hoverable] > tr.action-btns > td.action-btns > div.action-btns {
    opacity: 0;
  }
  tbody[hoverable]:hover > tr.action-btns > td.action-btns > div.action-btns {
    opacity: 1;
  }
  tbody[hoverable]:focus-within > tr.action-btns > td.action-btns > div.action-btns {
    opacity: 1;
  }

  tbody[hoverable] > tr.action-btns > td {
    padding: 0;
    padding-bottom: 6px;
  }

  .activity-items-row:hover {
    background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1));
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

  tr.activity-items-row:hover > td.action-btns > div.hover-block {
    opacity: 1;
  }
`;
