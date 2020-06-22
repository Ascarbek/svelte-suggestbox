<script>
  import { onDestroy, tick } from 'svelte';

  export let placeholder = '';

  export let items = [];
  export let getItems = async value => items.filter(item => value && value.length && enableInput ? getValueIndex(item, value) > -1 : true).sort(sortComparator);
  export let getSearchValue = item => item;
  export let getValueIndex = (item, value) => getSearchValue(item).toLowerCase().indexOf(value.toLowerCase());
  export let sortComparator = (a, b) => getSearchValue(a) > getSearchValue(b) ? 1 : getSearchValue(a) < getSearchValue(b) ? -1 : 0;
  export let onItemSelect = item => multiSelect ? selectedItems = [...selectedItems, item] : selectedItem = item;
  export let onNewItem = item => console.log('new item:', item);
  export let callDelay = 0;

  export let enableInput = true;
  export let typeAhead = true;
  export let multiSelect = true;
  export let closeOnSelect = true;
  export let selectedItem = {};
  export let selectedItems = [];
  export let cls = '';

  let value = '';
  let showDropDown = false;
  let suggestedItems = [];
  let selectedIndex = -1;
  let isHoveringDropDown = false;

  function selectCurrentItem() {
    if(selectedIndex === -1) return;
    if(suggestedItems[selectedIndex]) {
      onItemSelect(suggestedItems[selectedIndex]);
    }
    else {
      onNewItem(value);
    }

    value = '';
    selectedIndex = -1;

    if(closeOnSelect) {
      closeDropDown();
    }
  }

  async function keydown(e) {
    switch (e.key) {
      case 'Enter':
      case 'Tab': {
        isHoveringDropDown = false;
        selectCurrentItem();
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
        if(value.length === 0) {
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

  function openDropDown(){
    showDropDown = true;
  }

  function closeDropDown() {
    showDropDown = false;
    isHoveringDropDown = false;
  }

  function blur() {
    if(!isHoveringDropDown) {
      closeDropDown();
      selectedIndex = -1;
      value = '';
    }
  }

  let timeoutHandle;
  let showLoader = false;

  function startSearch(v) {
    showLoader = true;
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(async () => {
      suggestedItems = await getItems(v);
      showLoader = false;
      if(typeAhead && suggestedItems.length === 1) {
        selectedIndex = 0;
        let start = input.selectionStart;
        value = getSearchValue(suggestedItems[0]);

        await tick();
        input.selectionStart = getValueIndex(suggestedItems[0], v) + start;
        input.selectionEnd = value.length;
      }
    }, callDelay);
  }

  onDestroy(() => {
    clearTimeout(timeoutHandle);
  });

  $: {
    showDropDown ? startSearch(value) : null;
  }

  let selectionMap = {};

  $: {
    selectionMap = {};
    selectedItems.forEach(i => selectionMap[getSearchValue(i)] = true)
  }

  let input, dropDown;

  async function scrollToCurrentItem(index) {
    if(index < 0) return;
    await tick();

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

</script>

<div class="suggest-box {cls}">
  <div class="input" on:click={() => input.focus()}>
    <div class="selection">
      {#each selectedItems as item, index}
        <slot name="selected-item" item={item} isFirst={index === 0} isLast={index === selectedItems.length - 1}>
          <div class="selected-item">{getSearchValue(item)}</div>
        </slot>
      {/each}
    </div>

    <input bind:this={input} readonly={!enableInput} bind:value={value} on:keydown={keydown} on:focus={openDropDown} on:blur={blur} {placeholder} >

    <button tabindex="-1">
      <slot name="trigger-button">
        <i class="trigger fa fa-angle-down"></i>
      </slot>
    </button>
  </div>

  {#if showDropDown}
    {#if showLoader && callDelay > 0}
      <slot name="fetching-msg">
        <div class="loader">
          searching...
        </div>
      </slot>
    {:else}
      <div bind:this={dropDown} class="drop-down" on:mouseenter={() => isHoveringDropDown = true} on:mouseleave={() => isHoveringDropDown = false} on:click={() => input.focus()}>
        {#if suggestedItems.length}
          <slot name="result-count" count={suggestedItems.length}>
            <div class="result-count">{suggestedItems.length} items found</div>
          </slot>
        {/if}
        {#each suggestedItems as item, index}
          <div class="item" class:current={index === selectedIndex} class:selected={selectionMap[getSearchValue(item)]} on:mousemove={() => selectedIndex = index} on:click={() => selectCurrentItem()} >
            <slot name="suggest-item" item={item} isFirst={index === 0} isLast={index === suggestedItems.length - 1}>
              {getSearchValue(item)}
            </slot>
          </div>
        {/each}
        {#if suggestedItems.length === 0}
          <slot name="no-results-msg">
            <div class="not-found">no results found.</div>
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
</style>
