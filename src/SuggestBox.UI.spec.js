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
    expect(getByTestId('drop-down')).toBeInTheDocument();
    await fireEvent.blur(input);
    expect(() => getByTestId('drop-down')).toThrow();
  });

  it('should open the dropdown by clicking on the trigger button', async () => {
    const { getByTestId } = render(SuggestBox);

    const button = getByTestId('trigger-button');
    expect(() => getByTestId('drop-down')).toThrow();
    await fireEvent.click(button);
    expect(getByTestId('drop-down')).toBeInTheDocument();
    await fireEvent.click(button);
    expect(getByTestId('drop-down')).toBeInTheDocument();
  });

  test('for dropdown elements to match supplied items', async () => {
    const items = ['item1', 'item2', 'item3'];

    const { getByTestId, getByText, getByPlaceholderText } = render(SuggestBox, {
      placeholder: PLACEHOLDER_TEXT,
      items,
    });

    const button = getByTestId('trigger-button');
    await fireEvent.click(button);

    await waitFor(() => expect(getByTestId('drop-down').children.length).toBeGreaterThan(1));

    const dropDown = getByTestId('drop-down');
    expect(dropDown.children.length).toBe(1 + items.length); // result count el + items.length

    items.forEach(item => {
      expect(getByText(item)).toBeInTheDocument();
    });
  });

  test('for default search', async () => {
    const items = ['aaa', 'bbb', 'ccc'];

    const { getByTestId, getByText, getByPlaceholderText } = render(SuggestBox, {
      placeholder: PLACEHOLDER_TEXT,
      items,
    });

    const input = getByPlaceholderText(PLACEHOLDER_TEXT);
    await fireEvent.focus(input);

    await fireEvent.input(input, { target: { value: 'a' } });
    await new Promise(r => setTimeout(() => r(), 100));

    expect(getByText('aaa')).toBeInTheDocument();
    expect(() => getByText('bbb')).toThrow();
    expect(() => getByText('ccc')).toThrow();

    await fireEvent.input(input, { target: { value: 'b' } });
    await new Promise(r => setTimeout(() => r(), 100));
    expect(() => getByText('aaa')).toThrow();
    expect(getByText('bbb')).toBeInTheDocument();
    expect(() => getByText('ccc')).toThrow();

    await fireEvent.input(input, { target: { value: 'c' } });
    await new Promise(r => setTimeout(() => r(), 100));
    expect(() => getByText('aaa')).toThrow();
    expect(() => getByText('bbb')).toThrow();
    expect(getByText('ccc')).toBeInTheDocument();

    await fireEvent.input(input, { target: { value: 'd' } });
    await new Promise(r => setTimeout(() => r(), 100));
    expect(() => getByText('aaa')).toThrow();
    expect(() => getByText('bbb')).toThrow();
    expect(() => getByText('ccc')).toThrow();
  });

  test('result count and not found messages', async () => {
    const items = ['aaa', 'aab', 'abc'];

    const { getByTestId, getByText, getByPlaceholderText } = render(SuggestBox, {
      placeholder: PLACEHOLDER_TEXT,
      items,
    });

    const input = getByPlaceholderText(PLACEHOLDER_TEXT);
    await fireEvent.focus(input);
    await new Promise(r => setTimeout(() => r(), 100));
    expect(getByTestId('result-count')).toHaveTextContent(items.length.toString());
    expect(() => getByTestId('not-found-msg')).toThrow();

    await fireEvent.input(input, { target: { value: 'a' } });
    await new Promise(r => setTimeout(() => r(), 100));
    expect(getByTestId('result-count')).toHaveTextContent('3');
    expect(() => getByTestId('not-found-msg')).toThrow();

    await fireEvent.input(input, { target: { value: 'b' } });
    await new Promise(r => setTimeout(() => r(), 100));
    expect(getByTestId('result-count')).toHaveTextContent('2');
    expect(() => getByTestId('not-found-msg')).toThrow();

    await fireEvent.input(input, { target: { value: 'c' } });
    await new Promise(r => setTimeout(() => r(), 100));
    expect(getByTestId('result-count')).toHaveTextContent('1');
    expect(() => getByTestId('not-found-msg')).toThrow();

    await fireEvent.input(input, { target: { value: 'd' } });
    await new Promise(r => setTimeout(() => r(), 100));
    expect(() => getByTestId('result-count')).toThrow();
    expect(getByTestId('not-found-msg')).toBeInTheDocument();
  });

  it('should show loader message when called with callDelay', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(SuggestBox, {
      callDelay: 500
    });

    const button = getByTestId('trigger-button');
    await fireEvent.click(button);
    await new Promise(r => setTimeout(() => r(), 100));

    expect(getByTestId('fetching-msg')).toBeInTheDocument();

    await new Promise(r => setTimeout(() => r(), 500));

    expect(() => getByTestId('fetching-msg')).toThrow();
  });
});



