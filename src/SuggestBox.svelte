<script>
  import { onDestroy } from 'svelte';

  export let placeholder = '';

  export let items = [];
  export let getItems = async value => items.filter(item => value && value.length && enableInput ? filter(item, value) : true).sort(sortComparator);
  export let getSearchValue = item => item;
  export let filter = (item, value) => getSearchValue(item).toLowerCase().indexOf(value.toLowerCase()) > -1;
  export let sortComparator = (a, b) => getSearchValue(a) > getSearchValue(b) ? 1 : getSearchValue(a) < getSearchValue(b) ? -1 : 0;
  export let onItemSelect = item => selectedItems = [...selectedItems, item];
  export let onNewItem = item => console.log('new item:', item);
  export let callDelay = 0;

  export let enableInput = true;
  export let typeAhead = true;
  export let multiSelect = true;
  export let selectedItem = {};
  export let selectedItems = [];

  let value = '';
  let showDropDown = false;
  let suggestedItems = [];
  let selectedIndex = 0;
  let isHoveringDropDown = false;

  function selectCurrentItem() {
    if(suggestedItems[selectedIndex]) {
      onItemSelect(suggestedItems[selectedIndex]);
      value = '';
    }
    else {
      onNewItem(value);
    }
    closeDropDown();
  }

  function keydown(e) {
    switch (e.key) {
      case 'Enter':
      case 'Tab': {
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
        selectedIndex = 0;
        openDropDown();
      } break;

      default: {
        if(e.key.length === 1) {
          selectedIndex = 0;
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
  }

  let timeoutHandle;
  let showLoader = false;

  function startSearch(value) {
    showLoader = true;
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(async () => {
      suggestedItems = await getItems(value)
      showLoader = false;
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

</script>

<div class="suggest-box">
  <div class="input">
    <div class="selection">
      {#each selectedItems as item, index}
        <slot name="selected-item" isFirst={index === 0} isLast={index === selectedItems.length - 1}>
          <div class="selected-item">{getSearchValue(item)}</div>
        </slot>
      {/each}
    </div>

    <input readonly={!enableInput} bind:value={value} on:keydown={keydown} on:focus={openDropDown} on:blur={() => !isHoveringDropDown ? closeDropDown() : null} {placeholder} >

    <button on:click={() => showDropDown ? closeDropDown() : openDropDown()} on:blur={() => !isHoveringDropDown ? closeDropDown() : null} tabindex={-1} >
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
      <div class="drop-down" on:mouseenter={() => isHoveringDropDown = true} on:mouseleave={() => isHoveringDropDown = false} >
        {#if suggestedItems.length}
          <slot name="result-count" count={suggestedItems.length}>
            <div class="result-count">{suggestedItems.length} items found</div>
          </slot>
        {/if}
        {#each suggestedItems as item, index}
          <div class="item" class:current={index === selectedIndex} class:selected={selectionMap[getSearchValue(item)]} on:mouseenter={() => selectedIndex = index} on:click={() => selectCurrentItem()} >
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
    /*border: 1px solid #ccc;*/
    border-radius: 2px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .result-count {
    /*background: #aaa;*/
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
  }

  .item {
    padding: 5px;
    cursor: pointer;
  }

  .item:hover {
    background: #fafafa;
  }

  .item.current {
    background: #fffbe6;
    /*color: white;*/
  }

  .item.selected {
    background: #cccccc;
    color: white;
  }
</style>
