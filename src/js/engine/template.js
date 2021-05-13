function cardsColumn(data) {
  const column = document.createElement('div');
  column.classList.add('cards-column');
  column.dataset.group = data;
  column.innerHTML = `
    <div class="container__header">
      <span class="container__header-text">${data}</span>
    </div>

    <div class="cards-container">
      <ul class="cards-list">
      </ul>
    </div>

    <div class="container__footer">
      <span class="container__footer-text">+</span>&nbsp;
      <span class="container__footer-text">Add another card</span>
    </div>
  `;
  return column;
}

function templateCard(data) {
  const card = document.createElement('li');
  card.classList.add('card');
  card.dataset.cardId = data.id;
  card.innerHTML = `
    <div class="card-header">
      <span class="card-text">${data.text}</span>
      <span class="card-delete visually-hidden">&#67755</span>
    </div>
  `;
  return card;
}

function templateAddCardForm(data) {
  const task = document.createElement('li');
  task.classList.add('cardForm');
  task.innerHTML = `
    <form name="${data}" novalidate class="form">
      <textarea class="form__input card" type="text" name="name" data-group="${data}" value="" required placeholder="Enter a title for this card..."></textarea>
      <div class="form__input-button-holder">
        <button type="submit" class="btn btn-green">Add Card</button>
        <span class="icon-cancel">&#67755;</span>
      </div>
    </form>
  `;
  return task;
}

export { cardsColumn, templateCard, templateAddCardForm };
