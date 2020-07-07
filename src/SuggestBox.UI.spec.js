import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent, waitFor, screen } from '@testing-library/svelte'
import { tick } from 'svelte';

import SuggestBox from './SuggestBox.svelte';

const PLACEHOLDER_TEXT = 'testing placeholder';

describe('SuggestBox User Interaction events', () => {
  test('for placeholder and input appearance', async () => {
    const { getByPlaceholderText, getByTestId } = render(SuggestBox, {
      placeholder: PLACEHOLDER_TEXT
    });

    expect(getByPlaceholderText(PLACEHOLDER_TEXT)).toBeInTheDocument();
  });

  it('should open and close the dropdown by focusing/unFocusing the input', async () => {
    const { getByPlaceholderText, getByTestId } = render(SuggestBox, {
      placeholder: PLACEHOLDER_TEXT
    });

    const input = getByPlaceholderText(PLACEHOLDER_TEXT);
    expect(() => getByTestId('drop-down')).toThrow();
    await fireEvent.focus(input);
    await tick();
    expect(getByTestId('drop-down')).toBeInTheDocument();
    await fireEvent.blur(input);
    await tick();
    expect(() => getByTestId('drop-down')).toThrow();
  });

  it('should open the dropdown by clicking on the trigger button', async () => {
    const { getByTestId } = render(SuggestBox);

    const button = getByTestId('trigger-button');
    expect(() => getByTestId('drop-down')).toThrow();
    await fireEvent.click(button);
    await tick();
    expect(getByTestId('drop-down')).toBeInTheDocument();
    await fireEvent.click(button);
    await tick();
    expect(getByTestId('drop-down')).toBeInTheDocument();
  });

  test('for dropdown elements to match supplied items', async () => {
    const items = [{name:'item1'}, {name:'item2'}, {name:'item3'}];

    const { getByTestId, getByText, getByPlaceholderText } = render(SuggestBox, {
      placeholder: PLACEHOLDER_TEXT,
      items,
    });

    const button = getByTestId('trigger-button');
    await fireEvent.click(button);

    await tick();

    const dropDown = getByTestId('drop-down');
    expect(dropDown.children.length).toBe(1 + items.length); // result count el + items.length

    items.forEach(item => {
      expect(getByText(item.name)).toBeInTheDocument();
    });
  });

  test('for default search', async () => {
    const items = [{name:'aaa'}, {name:'bbb'}, {name:'ccc'}];

    const { getByTestId, getByText, getByPlaceholderText } = render(SuggestBox, {
      placeholder: PLACEHOLDER_TEXT,
      items,
    });

    const input = getByPlaceholderText(PLACEHOLDER_TEXT);
    await fireEvent.focus(input);

    await fireEvent.input(input, { target: { value: 'a' } });
    await tick()
    expect(getByText('aaa')).toBeInTheDocument();
    expect(() => getByText('bbb')).toThrow();
    expect(() => getByText('ccc')).toThrow();

    await fireEvent.input(input, { target: { value: 'b' } });
    await tick()
    expect(() => getByText('aaa')).toThrow();
    expect(getByText('bbb')).toBeInTheDocument();
    expect(() => getByText('ccc')).toThrow();

    await fireEvent.input(input, { target: { value: 'c' } });
    await tick()
    expect(() => getByText('aaa')).toThrow();
    expect(() => getByText('bbb')).toThrow();
    expect(getByText('ccc')).toBeInTheDocument();

    await fireEvent.input(input, { target: { value: 'd' } });
    await tick()
    expect(() => getByText('aaa')).toThrow();
    expect(() => getByText('bbb')).toThrow();
    expect(() => getByText('ccc')).toThrow();
  });

  test('result count and not found messages', async () => {
    const items = [{name:'aaa'}, {name:'aab'}, {name:'abc'}];

    const { getByTestId, getByText, getByPlaceholderText } = render(SuggestBox, {
      placeholder: PLACEHOLDER_TEXT,
      items,
    });

    const input = getByPlaceholderText(PLACEHOLDER_TEXT);
    await fireEvent.focus(input);
    await tick()
    expect(getByTestId('result-count')).toHaveTextContent(items.length.toString());
    expect(() => getByTestId('not-found-msg')).toThrow();

    await fireEvent.input(input, { target: { value: 'a' } });
    await tick()
    expect(getByTestId('result-count')).toHaveTextContent('3');
    expect(() => getByTestId('not-found-msg')).toThrow();

    await fireEvent.input(input, { target: { value: 'b' } });
    await tick()
    expect(getByTestId('result-count')).toHaveTextContent('2');
    expect(() => getByTestId('not-found-msg')).toThrow();

    await fireEvent.input(input, { target: { value: 'c' } });
    await tick()
    expect(getByTestId('result-count')).toHaveTextContent('1');
    expect(() => getByTestId('not-found-msg')).toThrow();

    await fireEvent.input(input, { target: { value: 'd' } });
    await tick()
    expect(() => getByTestId('result-count')).toThrow();
    expect(getByTestId('not-found-msg')).toBeInTheDocument();
  });

  it('should show loader message when called with callDelay', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(SuggestBox, {
      callDelay: 500
    });

    const button = getByTestId('trigger-button');
    await fireEvent.click(button);
    await tick();
    expect(getByTestId('fetching-msg')).toBeInTheDocument();

    await new Promise(r => setTimeout(() => r(), 600));
    expect(() => getByTestId('fetching-msg')).toThrow();
  });

  test('moving up and down, selecting and removing using keyboard', async () => {
    const items = [{name:'item1'}, {name:'item2'}, {name:'item3'}, {name:'item4'}];
    const { getByTestId, getByText, getByPlaceholderText } = render(SuggestBox, {
      placeholder: PLACEHOLDER_TEXT,
      items,
    });

    const input = getByPlaceholderText(PLACEHOLDER_TEXT);
    await fireEvent.focus(input);

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(getByText('item1')).toHaveClass('current');

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(getByText('item2')).toHaveClass('current');

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(getByText('item3')).toHaveClass('current');

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(getByText('item4')).toHaveClass('current');

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(getByText('item4')).toHaveClass('current');

    await fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(getByText('item3')).toHaveClass('current');

    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(getByTestId('selection').children.length).toBe(1);
    expect(getByTestId('selection').children[0].innerHTML).toBe('item3');

    await fireEvent.keyDown(input, { key: 'Backspace' });
    expect(getByTestId('selection').children.length).toBe(0);

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter' });

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Tab' });

    expect(getByTestId('selection').children.length).toBe(2);

    expect(getByTestId('selection').children[0].innerHTML).toBe('item1');
    expect(getByTestId('selection').children[1].innerHTML).toBe('item3');

    await fireEvent.keyDown(input, { key: 'Backspace' });
    expect(getByTestId('selection').children.length).toBe(1);
    expect(getByTestId('selection').children[0].innerHTML).toBe('item1');

    await fireEvent.keyDown(input, { key: 'Backspace' });
    expect(getByTestId('selection').children.length).toBe(0);

    await fireEvent.input(input, { target: { value: 'item' } });

    expect(input.value).toBe('item');

    await fireEvent.keyDown(input, { key: 'Escape' });

    expect(() => getByTestId('drop-down')).toThrow();
    expect(input.value).toBe('');

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(getByTestId('drop-down')).toBeInTheDocument();

    await fireEvent.keyDown(input, { key: 'Escape' });
    expect(() => getByTestId('drop-down')).toThrow();

    await fireEvent.keyDown(input, { key: 'i' });
    expect(getByTestId('drop-down')).toBeInTheDocument();
  });


});



