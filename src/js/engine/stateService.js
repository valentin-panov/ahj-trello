/* eslint-disable class-methods-use-this */
export default class StateService {
  getCards() {
    return JSON.parse(localStorage.getItem('cards')) || null;
  }

  saveCards(data) {
    localStorage.setItem('cards', JSON.stringify(data));
  }
}
