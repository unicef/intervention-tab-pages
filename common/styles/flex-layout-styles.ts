import {css, unsafeCSS} from 'lit-element';

export const _layout = `display: -ms-flexbox;
display: -webkit-flex;
display: flex;`;

export const layout = css`
  ${unsafeCSS(_layout)}
`;

export const _layoutHorizontal = `
  ${_layout}
  -ms-flex-direction: row;
  -webkit-flex-direction: row;
  flex-direction: row;
`;

export const layoutHorizontal = css`
  ${unsafeCSS(_layoutHorizontal)}
`;

export const _layoutVertical = `
  ${_layout}
  -ms-flex-direction: column;
  -webkit-flex-direction: column;
  flex-direction: column;
`;

export const layoutVertical = css`
  ${unsafeCSS(_layoutVertical)}
`;

export const _layoutFlex = `
  -ms-flex: 1 1 0.000000001px;
  -webkit-flex: 1;
  flex: 1;
  -webkit-flex-basis: 0.000000001px;
  flex-basis: 0.000000001px;
`;

export const layoutFlex = css`
  ${unsafeCSS(_layoutFlex)}
`;

export const _layoutWrap = `
  -ms-flex-wrap: wrap;
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
`;

export const layoutWrap = css`
  ${unsafeCSS(_layoutWrap)}
`;

export const _layoutStartJustified = `-ms-flex-pack: start;
-webkit-justify-content: flex-start;
justify-content: flex-start;`;

export const layoutStartJustified = css`
  ${unsafeCSS(_layoutStartJustified)}
`;

export const _layoutEndJustified = `
-ms-flex-pack: end;
  -webkit-justify-content: flex-end;
  justify-content: flex-end;
`;

export const layoutEndJustified = css`
  ${unsafeCSS(_layoutEndJustified)}
`;

export const _layoutInline = `
  display: -ms-inline-flexbox;
  display: -webkit-inline-flex;
  display: inline-flex;
`;

export const layoutInline = css`
  ${unsafeCSS(_layoutInline)}
`;

export const _layoutCenter = `
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
`;
export const layoutCenter = css`
  ${unsafeCSS(_layoutCenter)}
`;

export const _layoutJustified = `
  -ms-flex-pack: justify;
  -webkit-justify-content: space-between;
  justify-content: space-between;
`;

export const layoutJustified = css`
  ${unsafeCSS(_layoutJustified)}
`;

export const _layoutCenterJustified = `
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
`;

export const layoutCenterJustified = css`
  ${unsafeCSS(_layoutCenterJustified)}
`;

export const _layoutStart = `
  -ms-flex-align: start;
  -webkit-align-items: flex-start;
  align-items: flex-start;
`;

export const layoutStart = css`
  ${unsafeCSS(_layoutStart)}
`;

export const _layoutEnd = `
  -ms-flex-align: end;
  -webkit-align-items: flex-end;
  align-items: flex-end;
`;
export const layoutEnd = css`
  ${unsafeCSS(_layoutEnd)}
`;

export const _layoutSelfEnd = `
  -ms-align-self: flex-end;
  -webkit-align-self: flex-end;
  align-self: flex-end;
`;
export const layoutSelfEnd = css`
  ${unsafeCSS(_layoutSelfEnd)}
`;
