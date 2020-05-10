<script>
  import SuggestBox from './SuggestBox.svelte';

  import countries from './countries';

  let items = countries;

  let selectedCountries = [];

</script>

<div class="app">
  <div class="feature-field">
    <label>Group:</label>
    <SuggestBox placeholder={"Type a name"} items={items} getSearchValue={item => item.name} bind:selectedItems={selectedCountries} >
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
