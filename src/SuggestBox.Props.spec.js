import '@testing-library/jest-dom/extend-expect'
import { fireEvent, render } from "@testing-library/svelte";
import { tick } from 'svelte';

import SuggestBox from "./SuggestBox.svelte";

const PLACEHOLDER_TEXT = 'testing placeholder';

describe('SuggestBox props', () => {
  test('getSuggestedItems function replacement', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(SuggestBox, {
      placeholder: PLACEHOLDER_TEXT,
      getSuggestedItems: v => [v.toString() + 'a', v.toString() + 'b', v.toString() + 'c'],
    });

    const input = getByPlaceholderText(PLACEHOLDER_TEXT);
    await fireEvent.focus(input);

    await fireEvent.input(input, { target: { value: 'test' } });
    await tick();
    expect(getByText('testa')).toBeInTheDocument();
    expect(getByText('testb')).toBeInTheDocument();
    expect(getByText('testc')).toBeInTheDocument();

    const dropDown = getByTestId('drop-down');
    expect(dropDown.children.length).toBe(1 + 3); // result count el + items.length
  });

  test('custom css class', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(SuggestBox, {
      cls: 'test class'
    });

    expect(getByTestId('component-root')).toHaveClass('test class');
  });


});


