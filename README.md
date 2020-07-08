# Svelte SuggestBox

Svelte SuggestBox is a dropdown list component built with [Svelte](https://svelte.dev).

The Svelte SuggestBox can be customised in a lot of ways that should cover most of the possible usages.

## Features

* Combobox behaviour.
* Multiple item selection and allow duplicates.
* Custom behaviour for item suggestions.
* Custom display field, and search field.
* A custom layout for:
    * dropdown items.
    * selected items.
    * trigger button.
    * result count and "not found" messages.

## install
```
npm install svelte-suggestbox
```
or
```
yarn add svelte-suggestbox
```

## Get started

```sveltehtml
<SuggestBox
placeholder={"Select an item"}
items={[{"name": "item1"}, {"name": "item2"}]}
bind:selectedItems={selectedItems}
/>
```


## Props




