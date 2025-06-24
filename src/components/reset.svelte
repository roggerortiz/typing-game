<script lang="ts">
  import type { MouseEventHandler } from 'svelte/elements'
  import ResetIcon from '../icons/reset.svelte'

  let { onclick }: { onclick: MouseEventHandler<HTMLButtonElement> } = $props()
</script>

<div class="text-center mt-8">
  <button
    class="cursor-pointer text-gray-400 hover:text-gray-100 hover:scale-110 hover:transition-opacity"
    {onclick}
  >
    <ResetIcon />
  </button>
</div>
