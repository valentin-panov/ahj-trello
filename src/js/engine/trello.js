/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { cardsColumn, templateCard, templateAddCardForm } from './template';
import StateService from './stateService';
import json from '../data/cards.json';
import FORM_ERRORS from '../data/formErrors';

export default class Trello {
  constructor() {
    this.stateService = new StateService();
  }

  init() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('wrapper');
    this.wrapper.innerHTML = this.stateService.getCards() || this.loadFromJSON(json);
    document.body.append(this.wrapper);
    this.closeAllForms();

    [...this.wrapper.querySelectorAll('.card')].forEach((element) => {
      this.addCardListeners(element);
    });

    this.addFooterListeners();
    this.addWrapperListeners();
  }

  /**
   * Add listeners to the card element (now only delete-icon)
   * @param {Element} element
   */
  addCardListeners(element) {
    element.addEventListener(
      'mouseenter',
      (event) => {
        event.preventDefault();
        event.target.querySelector('.card-delete').classList.remove('visually-hidden');
      },
      false
    );
    element.addEventListener(
      'mouseleave',
      (event) => {
        event.preventDefault();
        event.target.querySelector('.card-delete').classList.add('visually-hidden');
      },
      false
    );
    element.querySelector('.card-delete').addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        this.deleteCard(event.target.closest('li.card'));
      },
      false
    );
  }

  /**
   * Adds DnD listeners to the container
   */
  addWrapperListeners() {
    const element = this.wrapper;

    element.addEventListener(
      'mousedown',
      (event) => {
        event.preventDefault();
        this.dragStart(event);
      },
      false
    );

    element.addEventListener(
      'mousemove',
      (event) => {
        event.preventDefault();
        this.dragMove(event);
      },
      false
    );

    element.addEventListener(
      'mouseup',
      (event) => {
        event.preventDefault();
        this.dragEnd(event);
      },
      false
    );

    element.addEventListener(
      'mouseleave',
      (event) => {
        event.preventDefault();
        this.dragEnd();
      },
      false
    );
  }

  /**
   * Catches card for dragggin
   * @param {Object} event
   * @returns undefined if fails
   */
  dragStart(event) {
    this.draggedCard = event.target.closest('li.card');
    if (!this.draggedCard) {
      return;
    }

    this.ghostCard = this.draggedCard.cloneNode(true);
    this.ghostCard.classList.add('draggedGhost');
    this.draggedCard.classList.add('transparent');

    const { width, height, left, top } = this.draggedCard.getBoundingClientRect();
    this.ghostCard.style.width = `${width}px`;
    this.ghostCard.style.height = `${height}px`;
    this.ghostCard.style.top = `${top}px`;
    this.ghostCard.style.left = `${left}px`;

    document.body.appendChild(this.ghostCard);

    this.wrapper.style.cursor = 'grabbing';
    this.coordX = event.pageX - left;
    this.coordY = event.pageY - top;
  }

  /**
   * Renders move of the draggin card
   * @param {Object} event
   * @returns undefined if fails
   */
  dragMove(event) {
    if (!this.ghostCard) {
      return;
    }
    this.ghostCard.style.left = `${event.pageX - this.coordX}px`;
    this.ghostCard.style.top = `${event.pageY - this.coordY}px`;
    const column = document
      .elementFromPoint(event.clientX, event.clientY)
      .closest('div.cards-column');
    if (column) {
      const { height, top } = this.draggedCard.getBoundingClientRect();
      const closest = document.elementFromPoint(event.clientX, event.clientY).closest('li.card');
      if (!closest) {
        column.querySelector('ul.cards-list').append(this.draggedCard);
        return;
      }
      if (event.pageY < top - height / 2) {
        closest.before(this.draggedCard);
      } else {
        closest.after(this.draggedCard);
      }
    }
  }

  /**
   * Drops the draggin card into the new position
   * @returns undefined if fails
   */
  dragEnd() {
    if (!this.draggedCard) {
      if (this.ghostCard) {
        this.ghostCard.remove();
        this.ghostCard = null;
      }
      return;
    }

    this.wrapper.style.cursor = 'default';
    this.draggedCard.classList.remove('transparent');
    this.draggedCard = null;
    this.ghostCard.remove();
    this.ghostCard = null;
    this.saveState();
  }

  /**
   * Adds listener to all footers on the board
   */
  addFooterListeners() {
    [...document.querySelectorAll('.container__footer')].forEach((element) => {
      element.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          this.addNewCardFormShow(event.target.closest('.cards-column').dataset.group);
        },
        false
      );
      element.addEventListener(
        'mouseenter',
        (event) => {
          event.preventDefault();
          event.target
            .querySelector('.container__footer-text:nth-child(2)')
            .classList.add('container__footer-text_active');
        },
        false
      );
      element.addEventListener(
        'mouseleave',
        (event) => {
          event.preventDefault();
          event.target
            .querySelector('.container__footer-text:nth-child(2)')
            .classList.remove('container__footer-text_active');
        },
        false
      );
    });
  }

  /**
   * Shows add new card form and bind its listeners
   * @param {String} group - column name
   */
  addNewCardFormShow(group) {
    const column = document.querySelector(`div[data-group="${group}"]`);

    column.querySelector(`.container__footer`).classList.add('visually-hidden');

    const newForm = templateAddCardForm(group);
    column.querySelector(`.cards-list`).append(newForm);

    newForm.querySelector(`.icon-cancel`).addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        this.addNewCardFormClose(group);
      },
      false
    );
    newForm.querySelector(`.btn`).addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        const data = {
          group,
          value: column.querySelector(`.form__input`).value,
        };
        this.createNewCard(data);
      },
      false
    );

    this.wrapper.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        if (event.target === this.wrapper) {
          this.closeAllForms();
        }
      },
      false
    );

    //! обработчик ктрл+ввод быстро не завёлся, отложил
    // newForm.querySelector(`.form__input`).addEventListener(
    //   'keydown',
    //   (e) => {
    // e.preventDefault();
    //     console.log(e.key);
    //     if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    //       const data = {
    //         group,
    //         value: column.querySelector(`.form__input`).value,
    //       };
    //       this.createNewCard(data);
    //     }
    //   },
    //   false
    // );

    newForm.querySelector(`.form__input`).focus();
  }

  /**
   * Creates new card in DB and redraws the board
   * @param {String} data - text value for new card
   */
  createNewCard(data) {
    const form = document.forms[data.group];
    let { error } = this;

    // old error removing
    if (error) {
      error.remove();
      error = null;
    }
    // check validity code
    const isValid = form.checkValidity();

    if (!isValid) {
      // switch .invalid on all valid elements to .valid
      [...form.elements]
        .filter((o) => o.validity.valid && !o.classList.contains('btn'))
        .forEach((el) => {
          el.classList.add('valid');
          el.classList.remove('invalid');
        });

      const first = [...form.elements].find((o) => !o.validity.valid);
      first.focus();
      first.classList.remove('valid');
      first.classList.add('invalid');

      const ValidityState = first.validity;
      let errorKey = 'Неизвестная ошибка';

      for (const key in ValidityState) {
        if (ValidityState[key]) {
          errorKey = key;
        }
      }

      error = document.createElement('div');
      error.dataset.id = 'error';
      error.dataset.group = data.group;
      error.className = 'form-error';
      error.textContent = `${FORM_ERRORS.FORM_ERRORS[first.name][errorKey]}`;

      // for relative positioning inside container
      first.offsetParent.appendChild(error);
      error.style.top = `${first.offsetTop + first.offsetHeight + 10}px`;
      error.style.left = `${first.offsetLeft + first.offsetWidth - error.offsetWidth - 10}px`;
      this.error = error;
      return;
    }

    const newCard = templateCard({
      id: `${new Date().getTime()}`,
      text: data.value.replace(/\n/g, '<br>'),
    });
    this.addNewCardFormClose(data.group);
    const column = this.wrapper.querySelector(`div.cards-column[data-group="${data.group}"]`);
    column.querySelector('.cards-list').append(newCard);

    this.addCardListeners(newCard);
    this.saveState();
  }

  /**
   * Closes all new card forms
   */
  closeAllForms() {
    [...document.querySelectorAll(`li.cardForm`)].forEach((element) => {
      this.addNewCardFormClose(element.closest('div.cards-column').dataset.group);
    });
  }

  /**
   * Closes new card form
   * @param {String} group - column name
   */
  addNewCardFormClose(group) {
    const column = document.querySelector(`div[data-group="${group}"]`);
    column.querySelector(`.container__footer`).classList.remove('visually-hidden');
    column.querySelector(`li.cardForm`).remove();
    [...document.querySelectorAll(`div.form-error[data-group="${group}"]`)].forEach((el) =>
      el.remove()
    );
  }

  /**
   * Removes card from the DOM
   * @param {Element} element - element to remove
   */
  deleteCard(element) {
    element.remove();
    this.saveState();
  }

  /**
   * Saves state into Local Storage
   */
  saveState() {
    this.stateService.saveCards(document.querySelector('.wrapper').innerHTML);
  }

  /**
   * Constructs state from JSON object
   * @param {Object} data
   * @returns state innerHTML
   */
  loadFromJSON(data) {
    const container = document.createElement('div');
    data.forEach((item) => {
      const newCol = cardsColumn(item.id);
      const cardsList = newCol.querySelector('.cards-list');
      item.entries.forEach((card) => {
        const newCard = templateCard(card);
        cardsList.append(newCard);
      });
      container.append(newCol);
    });
    return container.innerHTML;
  }
}
