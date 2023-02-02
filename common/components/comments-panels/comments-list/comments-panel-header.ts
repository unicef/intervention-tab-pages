import {customElement, LitElement, html, TemplateResult, CSSResultArray, property} from 'lit-element';
import {CommentPanelsStyles} from '../common-comments.styles';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {translate} from 'lit-translate';

@customElement('comments-panel-header')
/* eslint-disable max-len */
export class CommentsPanelHeader extends LitElement {
  @property() count = 0;
  protected render(): TemplateResult {
    return html`
      <div>${translate('COMMENTS_PANEL')} <b>(${this.count})</b></div>
      <div class="buttons">
        <svg
          width="20"
          height="16"
          viewBox="0 0 20 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          @click="${() => this.toggleMinimize()}"
        >
          <line x1="18.5" y1="1.5" x2="1.5" y2="1.5" stroke="white" stroke-width="3" stroke-linecap="round" />
          <path
            d="M8.29359 5.79139C9.0735 4.51559 10.9265 4.51559 11.7064 5.79139L15.9339 12.7068C16.7486 14.0395 15.7895 15.75 14.2275 15.75H5.77249C4.2105 15.75 3.25139 14.0395 4.06609 12.7069L8.29359 5.79139Z"
            fill="white"
          />
        </svg>
        <svg
          width="17"
          height="17"
          viewBox="0 0 17 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          @click="${() => this.closePanel()}"
        >
          <path
            d="M1.61153 16.9927C1.19474 17.0173 0.784834 16.8771 0.46826 16.6018C-0.156087 15.9664 -0.156087 14.9403 0.46826 14.3049L14.1394 0.474726C14.7888 -0.139983 15.8078 -0.105812 16.4154 0.551115C16.9649 1.14517 16.9969 2.05825 16.4904 2.69018L2.73869 16.6018C2.4262 16.8731 2.02287 17.013 1.61153 16.9927Z"
            fill="white"
          />
          <path
            d="M15.2665 16.9912C14.8441 16.9894 14.4392 16.8198 14.1393 16.5188L0.468009 2.68859C-0.110418 2.00527 -0.0317782 0.976914 0.64369 0.39171C1.24656 -0.13057 2.13568 -0.13057 2.7385 0.39171L16.4903 14.2219C17.1395 14.8367 17.173 15.8676 16.5652 16.5244C16.5411 16.5505 16.5161 16.5758 16.4903 16.6002C16.1535 16.8965 15.7104 17.038 15.2665 16.9912Z"
            fill="white"
          />
        </svg>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('mousedown', this.makeDraggable);
  }

  closePanel(): void {
    fireEvent(this, 'close-comments-panels');
  }

  toggleMinimize(): void {
    fireEvent(this, 'toggle-minimize');
  }

  makeDraggable(e: any) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    const elem = document.querySelector('comments-panels') as any;
    const panelOpened = elem.shadowRoot!.querySelector('messages-panel')?.classList.contains('opened');
    const initX = elem.offsetLeft;
    const initY = elem.offsetTop;
    const firstX = e.clientX;
    const firstY = e.clientY;

    document.addEventListener('mouseup', closeDragElement, true);
    document.addEventListener('mousemove', elementDrag, true);

    function closeDragElement() {
      document.removeEventListener('mouseup', closeDragElement, true);
      document.removeEventListener('mousemove', elementDrag, true);
    }

    function elementDrag(e: any) {
      e = e || window.event;
      e.preventDefault();

      let y = initY + e.clientY - firstY;
      let x = initX + e.clientX - firstX;

      if (x < (panelOpened ? elem.clientWidth - 10 : 0)) x = panelOpened ? elem.clientWidth - 10 : 0;
      if (y < 0) y = 0;
      if (x > window.innerWidth - elem.clientWidth) x = window.innerWidth - elem.clientWidth - 18;
      if (y > window.innerHeight - elem.clientHeight) y = window.innerHeight - elem.clientHeight;

      elem.style.top = y + 'px';
      elem.style.left = x + 'px';
    }
  }

  static get styles(): CSSResultArray {
    // language=css
    return [CommentPanelsStyles];
  }
}
