import {RootState} from '../../types/store.types';
import {LitElement} from 'lit-element';
import {CommentsCollection} from './comments.reducer';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import './comments-dialog';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {Constructor, InterventionComment} from '@unicef-polymer/etools-types';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';

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
 * - !For the firstUpdated method all is the same as for stateChanged!
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
  return class CommentsMixin extends connectStore(baseClass) {
    get commentMode(): boolean {
      return this.commentsModeEnabled;
    }

    private currentInterventionId: number | null = null;
    private comments: CommentsCollection = {};
    private metaDataCollection: MetaData[] = [];
    private commentsModeEnabled = false;
    private rendered = false;
    private currentEditedComments: MetaData | null = null;

    protected firstUpdated() {
      this.rendered = true;
      if (this.commentsModeEnabled) {
        setTimeout(() => {
          this.setCommentMode();
        }, 300);
      }
    }

    stateChanged(state: RootState) {
      const commentsState = state.commentsData;
      this.currentInterventionId =
        Number(state.app.routeDetails?.params?.interventionId) || state.interventions?.current?.id || null;
      if (!commentsState || !this.currentInterventionId) {
        return;
      }

      const {commentsModeEnabled, collection} = commentsState;
      const needToUpdate = collection[this.currentInterventionId] !== this.comments && this.commentsModeEnabled;
      this.comments = collection[this.currentInterventionId] || {};

      if (needToUpdate) {
        // we need to update comments state if mode was enabled before the data was fetched
        this.metaDataCollection.forEach((meta: MetaData) => {
          this.updateCounter(meta);
          this.updateBorderColor(meta);
        });
      }

      // update sate for currently edited comments
      if (this.currentEditedComments) {
        this.updateCounter(this.currentEditedComments);
        this.updateBorderColor(this.currentEditedComments);
      }

      if (commentsModeEnabled !== this.commentsModeEnabled) {
        this.commentsModeEnabled = commentsModeEnabled;
        if (this.rendered) {
          this.setCommentMode();
        }
      }
    }

    /**
     * Implement this method inside your component if you want to use comments-container attribute
     * @param _ - base element
     */
    getSpecialElements(_: HTMLElement): CommentElementMeta[] {
      return [];
    }

    setCommentMode() {
      if (this.commentsModeEnabled) {
        this.startCommentMode();
      } else {
        this.stopCommentMode();
      }
      (this as any).requestUpdate();
    }

    private startCommentMode(): void {
      const elements: NodeListOf<HTMLElement> = this.shadowRoot!.querySelectorAll(
        '[comment-element], [comments-container]'
      );
      this.metaDataCollection = Array.from(elements)
        .filter((element) => !!element)
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
        this.updateCounter(meta);
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
      const overlay: HTMLElement = this.createOverlay(relatedTo);
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
        z-index: 91;
      `;
      return element;
    }

    private createOverlay(relatedTo: string): HTMLElement {
      const comments: InterventionComment[] = this.comments[relatedTo] || [];
      const borderColor = comments.length ? '#FF4545' : '#81D763';
      const element: HTMLElement = document.createElement('div');
      element.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: transparent;
        z-index: 91;
        cursor: pointer;
        box-shadow: inset 0px 0px 0px 3px ${borderColor};
        ${this.determineOverlayMargin(relatedTo)}
      `;
      return element;
    }

    determineOverlayMargin(relatedTo: string) {
      const parts = relatedTo.split('-');
      // @ts-ignore
      if (isNaN(parts[parts.length - 1])) {
        return '';
      } else {
        // If the commentable element is part of a list, leave some spacing
        return 'margin: 2px;';
      }
    }

    private getMetaFromContainer(container: HTMLElement): MetaData[] {
      return this.getSpecialElements(container)
        .filter(({element}) => !!element)
        .map(({element, relatedTo, relatedToDescription}: CommentElementMeta) => {
          return this.createMataData(element, relatedTo, relatedToDescription);
        });
    }

    private updateCounter(meta: MetaData): void {
      const comments: InterventionComment[] = this.comments[meta.relatedTo] || [];
      meta.element.style.cssText = `
        position: relative;
      `;
      meta.counter.innerText = `${comments.length}`;
      if (comments.length) {
        meta.element.append(meta.counter);
      } else {
        meta.counter.remove();
      }
    }

    private updateBorderColor(meta: MetaData) {
      const comments: InterventionComment[] = this.comments[meta.relatedTo] || [];
      const borderColor = comments.length ? '#FF4545' : '#81D763';
      // @ts-ignore
      meta.overlay.style['box-shadow'] = `inset 0px 0px 0px 3px ${borderColor}
      `;
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
              relatedToDescription: meta.relatedToDescription,
              endpoints: getStore().getState().commentsData.endpoints
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
