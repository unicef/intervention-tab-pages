import {gridLayoutStylesContent} from './grid-layout-styles-lit';

export const gridLayoutStylesPolymer = () => {
  const template = document.createElement('template');
  template.innerHTML = `<style>
    ${gridLayoutStylesContent}
   </style>`;
  return template;
};
