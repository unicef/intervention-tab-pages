import {LitElement, customElement, html, css, property} from 'lit-element';

@customElement('comments-wrapper')
export class CommentsWrapper extends LitElement {
  static get styles() {
    return [
      css`
        *[hidden] {
          display: none;
        }
        .container {
          position: relative;
        }
        .box {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0.8;
        }
        .stack-top {
          box-sizing: border-box;
          z-index: 9;
        }
        .green-border {
          border: 2px solid green;
        }
        .red-border {
          border: 2px solid red;
        }
      `
    ];
  }
  render() {
    return html`
      <div class="container">
        <div class="box stack-over ${this.getBorderColor(this.hasComments)}" ?hidden="${!this.commentModeOn}"></div>
        <div>
          <slot></slot>
        </div>
      </div>
    `;
  }

  @property({type: Boolean})
  commentModeOn = false;

  @property({type: Boolean})
  get hasComments() {
    return false; // TODO
  }

  getBorderColor(hasComment: boolean) {
    return hasComment ? 'red-border' : 'green-border';
  }
}
