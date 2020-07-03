import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/svelte'

import SuggestBox from './SuggestBox.svelte';

it('tests for placeholder prop', async () => {
  const { getByPlaceholderText } = render(SuggestBox, {
    placeholder: 'testing placeholder'
  });

  expect(getByPlaceholderText('testing placeholder')).toBeInTheDocument();
});

