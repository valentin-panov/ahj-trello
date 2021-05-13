export default function addCard(params) {
  const data = params || '';

  const element = document.createElement('div');
  element.classList.add('form-holder');
  element.innerHTML = `
  <form id="formCard" novalidate class="form">
      <textarea class="form__input" type="text" id="name" name="name" value="${data}" required placeholder="Enter a title for this card..." >
    <div class="form__input-button-holder">
      <button type="submit" class="btn btn-green" id="save">Add Card</button>
      <span class="icon-delete" id="cancel">&#67755; || 𐢫</span>
      <span class="icon-delete" id="cancel">&#8942; || .../span>
    </div>
  </form>
  `;

  return element;
}
