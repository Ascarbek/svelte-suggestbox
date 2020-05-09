<script>
  import SuggestBox from './SuggestBox.svelte';

  import countries from './countries';

  let items = countries;

  function onItemSelect() {

  }

</script>

<div>
  <div class="feature-field">
    <label>Group:</label>
    <SuggestBox placeholder={"Type a name"} items={items} getSearchValue={item => item.name} onItemSelect={onItemSelect} allowNewItem={false}>
    </SuggestBox>
  </div>
</div>

<style>
  .feature-field {
    width: 500px;
    margin-bottom: 20px;
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
