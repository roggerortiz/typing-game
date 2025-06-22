<script lang="ts">
  import clsx from 'clsx'
  import type { TLetter } from '../types/letter'

  let { letter }: { letter: TLetter } = $props()
</script>

<span
  class={clsx(
    {
      'text-gray-400': letter.correct === undefined,
      'text-green-600': letter.correct === true,
      'text-red-400': letter.correct === false
    },
    {
      'relative active': letter.active,
      'before:content-["|"]': letter.active,
      'before:text-yellow-500': letter.active,
      'before:animate-pulse': letter.active,
      'before:absolute': letter.active,
      'before:left-[62%]': letter.active && letter.isLast,
      'before:left-[-62%]': letter.active && !letter.isLast
    }
  )}
>
  {letter.value}
</span>
