<script lang="ts">
  import { onMount } from 'svelte'
  import Block from './components/block.svelte'
  import Reset from './components/reset.svelte'
  import Word from './components/word.svelte'
  import { words as INITIAL_WORDS, letters } from './helpers/data'
  import { clickOutside } from './helpers/utils'
  import type { TLetter } from './types/letter'
  import type { TWord } from './types/word'

  const INITIAL_TIME: number = 30
  let time: number = $state(INITIAL_TIME)
  let timeId: number = $state(0)
  let words: TWord[] = $state([])
  let blocked: boolean = $state(false)
  let playing: boolean = $state(false)
  let currentWordIndex: number = $state(-1)
  let currentLetterIndex: number = $state(-1)
  let inputEl: HTMLInputElement | null = $state(null)
  let gameOver: boolean = $state(false)
  let wpm: number = $state(0)
  let accuracy: number = $state(0)
  let currentKey: string = $state('')

  onMount(() => {
    newGame()
  })

  const onWindowKeyDown = (event: KeyboardEvent) => {
    const { key } = event

    if (!blocked && !letters.includes(key) && key !== ' ') {
      return
    }

    if (blocked) {
      event.preventDefault()
    }

    startGame()
  }

  const onClickOutside = () => {
    blocked = true
    playing = false
    clearInterval(timeId)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const { key } = event
    currentKey = key

    currentWordIndex = words.findIndex((word: TWord) => word.active)
    currentLetterIndex = words[currentWordIndex]?.letters?.findIndex((letter: TLetter) => letter.active) ?? -1

    if (currentWordIndex === -1 || currentLetterIndex === -1) {
      return
    }

    if (key === ' ') {
      event.preventDefault()

      const letters: TLetter[] = words[currentWordIndex].letters.map((letter: TLetter) => ({
        ...letter,
        active: false
      }))

      words[currentWordIndex].letters = letters
      words[currentWordIndex].correct = letters.every((letter: TLetter) => letter.correct)
      words[currentWordIndex].active = false

      if (currentWordIndex + 1 < words.length) {
        words[currentWordIndex + 1].letters[0].active = true
        words[currentWordIndex + 1].active = true
      }

      currentWordIndex = -1
      currentLetterIndex = -1

      if (inputEl) {
        inputEl.value = ''
      }
    }

    if (key === 'Backspace') {
      const prevWordIndex: number = currentWordIndex - 1
      let prevLetterIndex: number = currentLetterIndex - 1

      if (prevWordIndex === -1 && prevLetterIndex === -1) {
        event.preventDefault()
        return
      }

      if (words[prevWordIndex]?.correct === false && prevLetterIndex === -1) {
        event.preventDefault()

        prevLetterIndex = words[prevWordIndex].letters.findLastIndex((letter: TLetter) => letter.correct !== undefined)

        if (prevLetterIndex === -1) {
          prevLetterIndex = 0
        }

        words[prevWordIndex].active = true
        words[prevWordIndex].correct = undefined
        words[prevWordIndex].letters[prevLetterIndex].active = true
        words[prevWordIndex].letters[prevLetterIndex].correct = undefined

        words[currentWordIndex].letters[0].active = false
        words[currentWordIndex].letters[0].correct = undefined

        if (inputEl) {
          inputEl.value = words[prevWordIndex].letters
            .slice(0, prevLetterIndex)
            .map((letter: TLetter) => (letter.correct ? letter.value : '*'))
            .join('')
        }

        currentWordIndex = prevWordIndex
        currentLetterIndex = prevLetterIndex
      }
    }
  }

  const onKeyUp = () => {
    if (!inputEl || currentWordIndex === -1 || currentLetterIndex === -1) {
      return
    }

    const letters: TLetter[] = words[currentWordIndex].letters.map((letter: TLetter) => ({
      ...letter,
      active: false,
      correct: undefined
    }))

    inputEl.maxLength = letters.length
    inputEl.value.split('').forEach((char: string, index: number) => {
      letters[index].correct = char === letters[index].value
    })

    if (inputEl.value.length < letters.length) {
      letters[inputEl.value.length].active = true
    } else {
      letters[letters.length - 1].active = true
    }

    words[currentWordIndex].letters = letters

    currentWordIndex = -1
    currentLetterIndex = -1
  }

  const newGame = () => {
    if (inputEl) {
      inputEl.focus()
      inputEl.value = ''
    }

    playing = false
    gameOver = false
    time = INITIAL_TIME
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
  }

  const startGame = () => {
    inputEl?.focus()

    if (blocked) {
      blocked = false
    }

    if (!playing) {
      playing = true
      timeId = setInterval(() => {
        time--

        if (time === 0) {
          clearInterval(timeId)
          finishGame()
        }
      }, 1000)
    }
  }

  const finishGame = () => {
    const letters: TLetter[] = words.map((word: TWord) => word.letters).flat()
    const correctWords: number = words.filter((word: TWord) => word.correct).length
    const correctLetters: number = letters.filter((letter: TLetter) => letter.correct === true).length
    const incorrectLetters: number = letters.filter((letter: TLetter) => letter.correct === false).length
    const totalLetters: number = correctLetters + incorrectLetters

    accuracy = totalLetters > 0 ? (correctLetters / totalLetters) * 100 : 0
    wpm = (correctWords * 60) / INITIAL_TIME
    gameOver = true
  }
</script>

<main>
  {#if !gameOver}
    <section
      class="flex flex-col gap-2"
      use:clickOutside={onClickOutside}
    >
      <time class="text-yellow-500">{time} '{currentKey}'</time>
      <p class="flex flex-wrap gap-x-2 gap-y-0.5 m-0">
        {#each words as word (word.id)}
          <Word {word} />
        {/each}
      </p>
      <input
        bind:this={inputEl}
        class="text-white"
        title="absolute top-0 left-0 -z-[999] pointer-events-none opacity-0 text-white"
        onkeydown={onKeyDown}
        onkeyup={onKeyUp}
      />
      <Reset onclick={newGame} />
      {#if blocked}
        <Block onclick={newGame} />
      {/if}
    </section>
  {:else}
    <section class="flex flex-col gap-2">
      <div>
        <h2 class="text-gray-400 text-2xl">wpm</h2>
        <h3 class="text-yellow-500 text-4xl">{wpm}</h3>
      </div>
      <div>
        <h2 class="text-gray-400 text-2xl">acc</h2>
        <h3 class="text-yellow-500 text-4xl">{`${accuracy.toFixed(2)}%`}</h3>
      </div>
      <div class="mt-8">
        <h2 class="text-gray-400 text-sm">test info</h2>
        <span class="flex gap-1 text-yellow-500 text-sm">
          time {INITIAL_TIME}s
        </span>
      </div>
      <Reset onclick={newGame} />
    </section>
  {/if}
</main>

<svelte:window onkeydown={onWindowKeyDown} />
