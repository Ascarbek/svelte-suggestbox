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
  <div class="feature-field">
    <label>Group:</label>
    <SuggestBox placeholder={"Type a name"} allowDuplicates={true} hideSelected={true} items={countries} displayField={item => item.name} bind:selectedItems={selectedCountries} closeOnSelect={false} on:onItemSelected={countrySelected}>
    </SuggestBox>
  </div>

  <div class="feature-field">
    <label>Group:</label>
    <SuggestBox placeholder={"Status"} items={statuses} bind:selectedItems={selectedStatus} multiSelect={false}>
    </SuggestBox>
  </div>

  <div class="feature-field">
    <label>Group:</label>
    <SuggestBox placeholder={"Status"} items={test1} >
    </SuggestBox>
  </div>
</div>

<style>

  .app {
    padding-top: 50px;
  }

  .feature-field {
    width: 600px;
    margin: 0 auto 20px;
  }

  label {
    margin-bottom: 10px;
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
