import Trello from './engine/trello';

export default function app() {
  const trello = new Trello();
  trello.init();
}

app();
