<script lang="ts">
  import clsx from 'clsx'
  import type { TWord } from '../types/word'
  import Letter from './letter.svelte'

  let { word }: { word: TWord } = $props()
</script>

<span class={clsx({ 'border-b border-red-400': word.correct === false })}>
  {#each word.letters as letter (letter.id)}
    <Letter
      {letter}
      last={letter.id === word.letters.length}
    />
  {/each}
</span>
