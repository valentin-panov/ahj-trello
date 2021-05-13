import Trello from '../engine/trello';
import app from '../app';

jest.mock('../engine/trello');

beforeEach(() => {
  Trello.mockClear();
});

test('new Trello wont be created automatically', () => {
  expect(Trello).not.toHaveBeenCalled();
});

test('app() should create new Trello', () => {
  app();
  expect(Trello).toHaveBeenCalledTimes(1);
});

test('app() should call method init', () => {
  expect(Trello).not.toHaveBeenCalled();
  app();
  expect(Trello).toHaveBeenCalledTimes(1);

  const trelloInstance = Trello.mock.instances[0];
  const mockInit = trelloInstance.init;

  expect(mockInit).toHaveBeenCalledTimes(1);
});
