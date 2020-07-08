<script>
  import SuggestBox from '../src/SuggestBox.svelte';

  import countries from './countries';

  let items = countries;

  let selectedCountries = [];
  let selectedStatus = [];

  let statuses = [{name: 'created'}, {name: 'working'}, {name: 'working'}, {name: 'postponed'}];

  const countrySelected = e => {
    console.log(e.detail);
  }

  let test1 = [{name:'aaa'}, {name:'bbb'}, {name:'ccc'}];

</script>

<div class="app">
  <div class="field">
    <label>simple usage:</label>
    <SuggestBox
            placeholder={"Select an item"}
            items={[{"name": "item1"}, {"name": "item2"}]}
    />
  </div>

  <div class="field">
    <label>Group:</label>
    <SuggestBox placeholder={"Type a name"} allowDuplicates={false} hideSelected={false} items={countries} displayField={item => item.name} bind:selectedItems={selectedCountries} closeOnSelect={true} on:onItemSelected={countrySelected}>
    </SuggestBox>
  </div>

  <div class="field">
    <label>Group:</label>
    <SuggestBox placeholder={"Status"} items={statuses} bind:selectedItems={selectedStatus} multiSelect={false}>
    </SuggestBox>
  </div>

  <div class="field">
    <label>Group:</label>
    <SuggestBox placeholder={"Status"} items={test1} >
    </SuggestBox>
  </div>
</div>

<style>

  .app {
    padding-top: 50px;
  }

  .field {
    width: 600px;
    margin: 0 auto 20px;
  }

  label {
    margin-bottom: 10px;
    display: block;
  }

  button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
  }

  input {
    padding: 5px;
    margin: 0;
  }
</style>
