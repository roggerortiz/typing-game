<script lang="ts">
  import { onMount } from 'svelte'
  import Word from './components/word.svelte'
  import { words as INITIAL_WORDS } from './helpers/data'
  import type { TLetter } from './types/letter'
  import type { TWord } from './types/word'

  let time: number = $state(30)
  let timeId: number = $state(0)
  let words: TWord[] = $state([])
  let playing: boolean = $state(false)
  let gameOver: boolean = $state(false)
  let currentWordIndex: number = $state(-1)
  let currentLetterIndex: number = $state(-1)
  let inputEl: HTMLInputElement | null = $state(null)

  onMount(() => {
    inputEl?.focus()

    words = INITIAL_WORDS.toSorted(() => Math.random() - 0.5)
      .slice(0, 50)
      .map((word: string, indexW: number) => ({
        id: indexW + 1,
        letters: word.split('').map((letter: string, indexL: number) => ({
          id: indexL + 1,
          value: letter,
          active: indexW === 0 && indexL === 0
        })),
        active: indexW === 0
      }))
  })

  const onWindowsKeyDown = () => {
    inputEl?.focus()

    if (!playing) {
      playing = true
      timeId = setInterval(() => {
        time--

        if (time === 0) {
          clearInterval(timeId)
          setGameOver()
        }
      }, 1000)
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const { key } = event

    currentWordIndex = words.findIndex((word: TWord) => word.active)
    currentLetterIndex = words[currentWordIndex]?.letters?.findIndex((letter: TLetter) => letter.active) ?? -1

    if (currentWordIndex === -1 || currentLetterIndex === -1) {
      return
    }

    if (key === ' ') {
      event.preventDefault()

      words[currentWordIndex].letters[currentLetterIndex].active = false
      words[currentWordIndex].letters[currentLetterIndex].isLast = false
      words[currentWordIndex].correct = words[currentWordIndex].letters.every((letter: TLetter) => letter.correct)
      words[currentWordIndex].active = false

      words[currentWordIndex + 1].letters[0].active = true
      words[currentWordIndex + 1].active = true

      currentWordIndex = -1
      currentLetterIndex = -1

      if (inputEl) {
        inputEl.value = ''
      }
    }
  }

  const onKeyUp = () => {
    if (!inputEl || currentWordIndex === -1 || currentLetterIndex === -1) {
      return
    }

    inputEl.maxLength = words[currentWordIndex].letters.length
    inputEl.value.split('').forEach((char: string, index: number) => {
      words[currentWordIndex].letters[index].correct = char === words[currentWordIndex].letters[index].value
    })

    const inputLength: number = inputEl.value.length

    words[currentWordIndex].letters[currentLetterIndex].active = false
    words[currentWordIndex].letters[currentLetterIndex].isLast = false

    if (words[currentWordIndex].letters[inputLength]) {
      words[currentWordIndex].letters[inputLength].active = true
    } else {
      words[currentWordIndex].letters[currentLetterIndex].active = true
      words[currentWordIndex].letters[currentLetterIndex].isLast = true
    }
  }

  const setGameOver = () => {
    gameOver = true
  }
</script>

<main>
  {#if !gameOver}
    <section class="flex flex-col gap-2">
      <time class="text-yellow-500">{time}</time>
      <p class="flex flex-wrap gap-x-2 gap-y-0.5 m-0">
        {#each words as word (word.id)}
          <Word {word} />
        {/each}
      </p>
      <input
        bind:this={inputEl}
        class="absolute top-0 left-0 -z-[999] pointer-events-none opacity-0"
        onkeydown={onKeyDown}
        onkeyup={onKeyUp}
      />
    </section>
  {:else}
    <section></section>
  {/if}
</main>

<svelte:window onkeydown={onWindowsKeyDown} />
