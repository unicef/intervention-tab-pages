import {sharedStylesContent} from './shared-styles-lit';

export const sharedStylesPolymer = () => {
  const template = document.createElement('template');
  template.innerHTML = `<style>
    ${sharedStylesContent}
   </style>`;
  return template;
};
