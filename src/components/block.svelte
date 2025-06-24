<script lang="ts">
  import type { MouseEventHandler } from 'svelte/elements'
  import CursorIcon from '../icons/cursor.svelte'

  let { onclick }: { onclick: MouseEventHandler<HTMLDivElement> } = $props()
</script>

<div
  class="absolute top-0 left-0 z-50 flex gap-3 justify-center items-center w-full h-dvh bg-zinc-900/90 text-gray-300 cursor-pointer"
  {onclick}
  onkeyup={() => {}}
  role="button"
  tabindex="0"
>
  <CursorIcon />
  <span>Click here or press any key to focus</span>
</div>
