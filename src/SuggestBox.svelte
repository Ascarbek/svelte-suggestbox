<script>
  import { onDestroy, tick, createEventDispatcher } from 'svelte';

  /*
  * Constant values for internal usage
  * */

  const dispatch = createEventDispatcher();

  const INDEX_FIELD = '$index$';
  const SELECTED_FIELD = '$selected$';

  const ON_ITEM_SELECTED_EVENT = 'onItemSelected';
  const ON_NEW_ITEM_EVENT = 'newItem';

  /*
  * Component Props
  * */

  export let placeholder = '';

  // common usage as a dropdown
  // provide with items if items are a fixed set
  // all elements of items array have to be JSON objects
  // if you have specific logic for showing items, you can redefine getSuggestedItems function below
  // The component will modify items elements by adding $index$ and $selected$ fields for internal usage
  // that way it can track which elements have been selected and avoid duplicate selection
  export let items = [];

  $: validateItems(items);

  const validateItems = a => a.forEach(b => {if(typeof b !== 'object') throw 'items array must have JSON objects as elements';});

  // a field that will be used to search in when user is typing a text
  // also this field's value is shown in dropdown
  // by default it will use 'name' field but you can change it
  // for example: displayField = {item => item.value}
  export let displayField = item => item.name;

  // function that return first occurrence of user typed text in the items element
  // you can change this function if you use different way of getting occurrences
  // for example if you need it to be case sensitive then change to:
  // indexOfValue = { (item, value) => displayField(item).indexOf(value) }
  // if you are not using indexOf then you'd better set typeahead to false
  export let indexOfValue = (item, value) => displayField(item).toLowerCase().indexOf(value.toLowerCase());

  // true false weather to show items element in the dropdown when user is typing
  export let isSuggested = (item, value) => indexOfValue(item, value) > -1;

  // default function that searches through items array above
  // if you redefine this function then you'll have to take care of filtering and sorting
  // in case of async call (e.g. http request) you have to redefine this function and also supply with non zero callDelay value
  export let getSuggestedItems = async value => items
          .map((item, index) => ({ ...item, [INDEX_FIELD]: index }))
          .filter(item => hideSelected && selectionMap[item[INDEX_FIELD]] ? false : value && value.length && enableInput ? isSuggested(item, value) : true )
          .sort(sortComparator);

  // default behaviour is to sort alphabetically by 'name' field
  // to preserve items order you can change to item => item.$index$
  export let sortField = item => item.name;

  // sorting function, default behaviour is to sort ascending
  export let sortComparator = (a, b) => sortField(a) > sortField(b) ? 1 : sortField(a) < sortField(b) ? -1 : 0;

  // delay between end of user typing and calling getSuggestedItems
  export let callDelay = 0;

  // enable input component by default
  // disable if you need combobox behaviour
  export let enableInput = true;

  // if there is one suggestion then it will put the rest of the text into the input
  export let typeAhead = true;

  // allow multiple items selected
  export let multiSelect = true;

  export let closeOnSelect = true;
  export let hideSelected = true;

  export let selectedItems = [];
  // export let selectedIds = [];

  // custom css class that will be applied to root element
  export let cls = '';

  /*
  * Internal logic
  * */

  let value = '';
  let showDropDown = false;
  let suggestedItems = [];
  let selectedIndex = -1;
  let isHoveringDropDown = false;
  let selectionMap = {};

  let timeoutHandle;
  let showLoader = false;

  // DOM elements
  let input, dropDown;

  let selectItem = item => {
    multiSelect ? selectedItems = [...selectedItems, item] : selectedItems = [item];
    dispatch(ON_ITEM_SELECTED_EVENT, item);
  }

  let newItem = item => dispatch(ON_NEW_ITEM_EVENT, item);

  function selectCurrentItem(index) {
    if(index === -1) return;

    if(suggestedItems[index]) {
      selectItem(suggestedItems[index]);
    }
    else {
      newItem(value);
    }

    value = '';

    if(closeOnSelect) {
      closeDropDown();
    }
    selectedIndex = -1;
  }

  $: {
    selectionMap = {};
    selectedItems.forEach(i => typeof i[INDEX_FIELD] !== 'undefined' ? selectionMap[i[INDEX_FIELD]] = true : '')
  }

  $: {
    showDropDown ? startSearch(value) : null;
  }

  function openDropDown(){
    showDropDown = true;
  }

  function closeDropDown() {
    showDropDown = false;
    isHoveringDropDown = false;
    selectedIndex = -1;
  }

  function blur() {
    if(!isHoveringDropDown) {
      closeDropDown();
      value = '';
    }
  }

  function startSearch(v) {
    const fn = async () => {
      suggestedItems = await getSuggestedItems(v);
      showLoader = false;
      if(typeAhead && suggestedItems.length === 1) {
        selectedIndex = 0;
        let start = input.selectionStart;
        value = displayField(suggestedItems[0]);

        await tick();
        input.selectionStart = indexOfValue(suggestedItems[0], v) + start;
        input.selectionEnd = value.length;
      }
    }
    if(callDelay) {
      showLoader = true;
      clearTimeout(timeoutHandle);
      timeoutHandle = setTimeout(fn, callDelay);
    }
    else {
      fn();
    }
  }

  onDestroy(() => {
    clearTimeout(timeoutHandle);
  });

  async function scrollToCurrentItem(index) {
    if(index < 0) return;
    await tick();
    if(!showDropDown) return;

    const ddTop = dropDown.getBoundingClientRect().top;
    const ddHeight = dropDown.getBoundingClientRect().height;

    const itemTop = dropDown.querySelector('.current').getBoundingClientRect().top;
    const itemHeight = dropDown.querySelector('.current').clientHeight;

    if(itemTop + itemHeight > ddTop + ddHeight) {
      dropDown.scrollTop = dropDown.scrollTop + itemTop + itemHeight - ddHeight - ddTop;
    }
    if(itemTop < ddTop) {
      dropDown.scrollTop = dropDown.scrollTop - (ddTop - itemTop);
    }
  }

  $: {
    scrollToCurrentItem(selectedIndex);
  }

  async function keydown(e) {
    switch (e.key) {
      case 'Enter':
      case 'Tab': {
        isHoveringDropDown = false;
        selectCurrentItem(selectedIndex);
      } break;

      case 'Escape': {
        value = '';
        closeDropDown();
      } break;

      case 'ArrowDown': {
        openDropDown();
        if(selectedIndex < suggestedItems.length - 1) {
          selectedIndex++;
        }
      } break;

      case 'ArrowUp': {
        if(selectedIndex > 0) {
          selectedIndex--;
        }
      } break;

      case 'Backspace': {
        if(value.length === 0 && selectedItems.length > 0) {
          selectedItems = selectedItems.slice(0, selectedItems.length - 1);
        }
        selectedIndex = -1;
        openDropDown();
      } break;

      default: {
        if(e.key.length === 1) {
          selectedIndex = -1;
          dropDown.scrollTop = 0;
          openDropDown();
        }
      } break;
    }
  }

</script>

<div class="suggest-box {cls}" data-testid="component-root">
  <div class="input" on:click={() => input.focus()}>
    <div class="selection" data-testid="selection">
      {#each selectedItems as item, index}
        <slot name="selected-item" item={item} isFirst={index === 0} isLast={index === selectedItems.length - 1}>
          <div class="selected-item">{displayField(item)}</div>
        </slot>
      {/each}
    </div>

    <input bind:this={input} readonly={!enableInput} bind:value={value} on:keydown={keydown} on:focus={openDropDown} on:blur={blur} {placeholder} >

    <button tabindex="-1" data-testid="trigger-button">
      <slot name="trigger-button">
        <i class="trigger fa fa-angle-down"></i>
      </slot>
    </button>
  </div>

  {#if showDropDown}
    {#if showLoader && callDelay > 0}
      <slot name="fetching-msg">
        <div class="loader" data-testid="fetching-msg">
          searching...
        </div>
      </slot>
    {:else}
      <div bind:this={dropDown} class="drop-down" on:mouseenter={() => isHoveringDropDown = true} on:mouseleave={() => isHoveringDropDown = false} on:click={() => input.focus()} data-testid="drop-down">
        {#if suggestedItems.length}
          <slot name="result-count" count={suggestedItems.length}>
            <div class="result-count"><span data-testid="result-count">{suggestedItems.length}</span> items found</div>
          </slot>
        {/if}
        {#each suggestedItems as item, index}
          <div class="item" class:current={index === selectedIndex} class:selected={selectionMap[item[INDEX_FIELD]]} on:click={() => selectCurrentItem(index)} >
            <slot name="suggest-item" item={item} isFirst={index === 0} isLast={index === suggestedItems.length - 1}>
              {displayField(item)}
            </slot>
          </div>
        {/each}
        {#if suggestedItems.length === 0}
          <slot name="no-results-msg">
            <div class="not-found" data-testid="not-found-msg">no results found.</div>
          </slot>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .suggest-box {
    position: relative;
  }

  .selection {
    display: flex;
    align-items: center;
  }

  .selected-item {
    margin-right: 5px;
  }

  .input {
    display: flex;
    align-items: stretch;
    width: 100%;
    border: 1px solid #ccc;
    padding-left: 6px;
    box-sizing: border-box;
    outline: 0;
  }

  .input input {
    flex: 1;
    margin: 0;
    outline: 0;
    padding: 6px 0;
    border: none;
  }

  .input button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    outline: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .trigger {
    width: 30px;
    color: #333;
    background-color: #f4f4f4;
    border-radius: 2px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .result-count {
    color: #aaaaaa;
    font-size: 10px;
    padding: 2px 10px;
  }

  .loader {
    position: absolute;
    top: calc(100% + 4px);
    left: 6px;
  }

  .not-found {
    color: #aaaaaa;
    padding: 5px;
  }

  .drop-down {
    position: absolute;
    top: calc(100% + 4px);
    border: #dddddd 1px solid;
    width: 100%;
    height: 200px;
    overflow: auto;
    background: #ffffff;
    z-index: 1;
    box-sizing: border-box;
    outline: 0;
  }

  .item {
    padding: 5px;
    cursor: pointer;
  }

  .item.selected {
    background: #4092fc;
    color: white;
  }

  .item.current {
    background: #4092fc;
    color: white;
    text-decoration: underline;
  }

  .item:hover {
    background: #eeeeee;
  }

  .item.hidden {
    display: none;
  }
</style>
