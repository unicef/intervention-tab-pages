import {Constructor, RootState} from '../../models/globals.types';
import {LitElement} from 'lit-element';
import {CommentsCollection} from './comments.reducer';
import {InterventionComment} from '../../types/types';
import {openDialog} from '../../../utils/dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../../utils/redux-store-access';
import './comments-dialog';

type MetaData = CommentElementMeta & {
  oldStyles: string;
  counter: HTMLElement;
  overlay: HTMLElement;
};

export type CommentElementMeta = {
  relatedTo: string;
  relatedToDescription: string;
  element: HTMLElement;
};

/**
 * - !CommentsMixin uses connect mixin, so don't use it in your component!
 * - !If you use stateChanged inside your component remember to call super.stateChanged() at the end of your method!
 * - !You need to provide currentInterventionId getter inside your component!
 *
 * Use several attributes:
 *
 * [comment-element] - this element will be used as base element for comments. Provided string inside attribute will be
 * used as relatedTo field for comments
 *
 * [comment-description] - attribute value will be used for Comment Popup title
 *
 * [comments-container] - provide this attribute if you need special logic for base element. In this case you need to
 * implement getSpecialElement() method that will take base element as argument;
 * This method must return array of  that will be used as Base element for comments
 *
 * @param baseClass
 * @constructor
 */
export function CommentsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class CommentsMixin extends connect(getStore())(baseClass) {
    get commentMode(): boolean {
      return this.commentsModeEnabled;
    }

    get currentInterventionId(): number | null {
      return null;
    }

    private comments: CommentsCollection = {};
    private metaDataCollection: MetaData[] = [];
    private commentsModeEnabled = false;
    private rendered = false;
    private currentEditedComments: MetaData | null = null;

    protected firstUpdated() {
      this.rendered = true;
      if (this.commentsModeEnabled) {
        this.startCommentMode();
      }
    }

    stateChanged(state: RootState) {
      const commentsState = state.commentsData;
      if (!commentsState || !this.currentInterventionId) {
        return;
      }

      const {commentsModeEnabled, collection} = commentsState;
      const needToUpdate = collection[this.currentInterventionId] !== this.comments && this.commentsModeEnabled;
      this.comments = collection[this.currentInterventionId] || {};

      if (needToUpdate) {
        // we need to update comments state if mode was enabled before the data was fetched
        this.metaDataCollection.forEach((meta: MetaData) => this.updateCounterAndColor(meta));
      }

      // update sate for currently edited comments
      if (this.currentEditedComments) {
        this.updateCounterAndColor(this.currentEditedComments);
      }

      if (commentsModeEnabled === this.commentsModeEnabled) {
        return;
      }
      this.commentsModeEnabled = commentsModeEnabled;
      if (commentsModeEnabled && this.rendered) {
        this.startCommentMode();
        this.requestUpdate();
      } else if (this.rendered) {
        this.stopCommentMode();
        this.requestUpdate();
      }
    }

    /**
     * Implement this method inside your component if you want to use comments-container attribute
     * @param _ - base element
     */
    getSpecialElements(_: HTMLElement): CommentElementMeta[] {
      return [];
    }

    private startCommentMode(): void {
      const elements: NodeListOf<HTMLElement> = this.shadowRoot!.querySelectorAll(
        '[comment-element], [comments-container]'
      );
      this.metaDataCollection = Array.from(elements)
        .map((element: HTMLElement) => {
          if (element.hasAttribute('comments-container')) {
            return this.getMetaFromContainer(element);
          }
          const relatedTo: string | null = element.getAttribute('comment-element');
          const relatedToDescription = element.getAttribute('comment-description') || relatedTo;
          return !relatedTo ? null : this.createMataData(element, relatedTo, relatedToDescription as string);
        })
        .flat()
        .filter((meta: MetaData | null) => meta !== null) as MetaData[];
      this.metaDataCollection.forEach((meta: MetaData) => {
        this.updateCounterAndColor(meta);
        this.registerListener(meta);
      });
    }

    private stopCommentMode(): void {
      while (this.metaDataCollection.length) {
        const meta: MetaData = this.metaDataCollection.shift() as MetaData;
        meta.element.style.cssText = meta.oldStyles;
        meta.counter.remove();
        meta.overlay.remove();
      }
    }

    private createMataData(element: HTMLElement, relatedTo: string, relatedToDescription: string): MetaData {
      const oldStyles: string = element.style.cssText;
      const counter: HTMLElement = this.createCounter();
      const overlay: HTMLElement = this.createOverlay();
      element.append(overlay);
      return {
        element,
        counter,
        overlay,
        oldStyles,
        relatedTo,
        relatedToDescription
      };
    }

    private createCounter(): HTMLElement {
      const element: HTMLElement = document.createElement('div');
      element.style.cssText = `
        position: absolute;
        top: -7px;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 19px;
        height: 19px;
        background-color: #5B2121;
        border-radius: 50%;
        font-weight: bold;
        font-size: 10px;
        color: #ffffff;
        z-index: 99;
      `;
      return element;
    }

    private createOverlay(): HTMLElement {
      const element: HTMLElement = document.createElement('div');
      element.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent;
        z-index: 9999;
        cursor: pointer;
      `;
      return element;
    }

    private getMetaFromContainer(container: HTMLElement): MetaData[] {
      return this.getSpecialElements(container).map(({element, relatedTo, relatedToDescription}: CommentElementMeta) =>
        this.createMataData(element, relatedTo, relatedToDescription)
      );
    }

    private updateCounterAndColor(meta: MetaData): void {
      const comments: InterventionComment[] = this.comments[meta.relatedTo] || [];
      const borderColor = comments.length ? '#FF4545' : '#81D763';
      meta.element.style.cssText = `
        position: relative;
        border-top: 2px solid ${borderColor} !important;
        border-bottom: 2px solid ${borderColor} !important;
        border-left: 2px solid ${borderColor} !important;
        border-right: 2px solid ${borderColor} !important;
      `;
      meta.counter.innerText = `${comments.length}`;
      if (comments.length) {
        meta.element.append(meta.counter);
      } else {
        meta.counter.remove();
      }
    }

    private registerListener(meta: MetaData): void {
      meta.overlay.addEventListener(
        'click',
        () => {
          this.currentEditedComments = meta;
          openDialog({
            dialog: 'comments-dialog',
            dialogData: {
              interventionId: this.currentInterventionId,
              relatedTo: meta.relatedTo,
              relatedToDescription: meta.relatedToDescription
            }
          }).then(() => {
            this.currentEditedComments = null;
          });
        },
        false
      );
    }
  };
}
