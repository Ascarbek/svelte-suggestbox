# Svelte SuggestBox

Svelte SuggestBox is a dropdown list component built with [Svelte](https://svelte.dev).

The Svelte SuggestBox can be customised in a lot of ways that should cover most of the possible use cases.

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

## Installation
```bash
yarn add svelte-suggestbox
```
or
```bash
npm install svelte-suggestbox --save
```

## Get started

```html
<script>
import SuggestBox from 'svelte-suggestbox';
</script>

<SuggestBox
placeholder={"Select an item"}
items={[{name: "Hello"}, {name: "World"}, {name: "It's me"}]}
/>
```

## Demo

Examples available at

## Props

| Prop | Type | Description|
|---|---|---|
| placeholder | string | Placeholder for input.<br> |
| items | array | A fixed set for dropdown menu elements. All array items must be of a JSON type.
| displayField | function(item) | Returns a field value for supplied `item`. This value is used to lookup user input value in. Also to show in the dropdown and as a selected item(s).<br> By default it will return `name` field value. <br>**default value:**<br> ```displayField = function(item) { return item.name; }``` <br>If you use a different field than `name` then you should replace this function by defining this prop.
| indexOfValue | function(item, value) | Returns the first index at which user input `value` can be found in the `item`.<br>**default value:**<br> ```indexOfValue = function(item, value) { return displayField(item).toLowerCase().indexOf(value.toLowerCase()); }``` <br> if you use different logic to lookup user input value in items then you should define this prop. For instance, by default this function is Case Insensitive, if you want to make it Case Sensitive then you can change to:<br> ```indexOfValue = {function(item, value) { return displayField(item).indexOf(value); } }```|
| isSuggested | function(item, value) | Returns `true` or `false` indicating weather an `item` should be shown in the dropdown list. <br>**default value:**<br>  ```isSuggested = function(item, value) { return indexOfValue(item, value) > -1; }``` |
| getSuggestedItems | function(value) | Returns an array of suggested dropdown list items. If user input `value` is empty returns all `items`. If there is a user input `value` then it filters out `items` using functions shown above. Also `items` get sorted using functions shown below.<br>**default value:**<br>```getSuggestedItems = function(value) { return items.map((item, index) => ({ ...item, [INDEX_FIELD]: index })).filter(item => hideSelected && selectionMap[item[INDEX_FIELD]] ? false : value && value.length && enableInput ? isSuggested(item, value) : true ).sort(sortComparator);}```<br> This function can be replaced to change suggestions behaviour. But if you do so note that all the functions described above and the `items` array will be ignored. This prop can be used for XHR requests, so filtering and sorting will be handled on a server side.|
| sortField | function(item) | Returns a field value for supplied `item`. This value is used to sort `items` before showing in the dropdown.<br>**default value:**<br>```sortField = function(item) { return item.name; }``` <br> Same as the `displayField` this function returns `name` field. If you want to sort by a different field value then, you should replace this function. For instance, if you want to preserve initial `items` array order, you can use `$index$` field that holds reference to `items` array index, so:<br>```sortField = function(item) { return item['$index$']; }``` will show dropdown items in the same order they are in `items` array.|
| sortComparator | function | sorting logic for suggested items <br>**default value:**<br> sortComparator = function(a, b) { return sortField(a) > sortField(b) ? 1 : sortField(a) < sortField(b) ? -1 : 0; }|
| callDelay | integer | A number of milliseconds to wait before calling `getSuggestedItems`. Can be useful with XHR requests. **Default value is** 0. The dropdown will show _waiting message_ for `callDelay` number of milliseconds.
| enableInput | boolean | *default* `true`. Enables user to input a lookup value. Set to `false` for combobox behaviour.
| typeAhead | boolean | *default* `true`. When there is only one suggested item left, it will fill the rest of the value into the input.|
| multiSelect | boolean | *default* `false`. |
| allowDuplicates | boolean | *default* `false`. |
| closeOnSelect | boolean | *default* `true`. |
| hideSelected | boolean |  *default* `true`. |
| selectedItems | array | an array of items that were selected. |
| cls | string | a CSS class that will be appended (if defined) to the parent DOM element|



