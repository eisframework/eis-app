<script lang="ts">
  let { 
    name, 
    type = 'text', 
    placeholder = '', 
    value = '', 
    label, 
    error = '',
    required = false,
    disabled = false
  } = $props()

  let id = $state(name)
</script>

<div class="space-y-1">
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  <input
    id={id}
    name={name}
    type={type}
    placeholder={placeholder}
    value={value}
    disabled={disabled}
    required={required}
    class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
  />
  {#if error}
    <p class="text-sm text-red-600">{error}</p>
  {/if}
</div>
