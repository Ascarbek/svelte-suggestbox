<script>
  import SuggestBox from './SuggestBox.svelte';

  import countries from './countries';

  let items = countries;

  let selectedCountries = [];
  let selectedStatus = '';

  let statuses = ['created', 'working', 'postponed'];

  $: {
    console.log(selectedStatus);
  }

</script>

<div class="app">
  <div class="feature-field">
    <label>Group:</label>
    <SuggestBox placeholder={"Type a name"} items={countries} getSearchValue={item => item.name} bind:selectedItems={selectedCountries} closeOnSelect={false}>
    </SuggestBox>
  </div>

  <div class="feature-field">
    <label>Group:</label>
    <SuggestBox placeholder={"Status"} items={statuses} bind:selectedItem={selectedStatus} multiSelect={false}>
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
