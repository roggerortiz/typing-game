export function clickOutside(node: any, callback: Function) {
  function handleClick(event: any) {
    if (node && !node.contains(event.target)) {
      callback()
    }
  }

  window.addEventListener('click', handleClick, true)

  return {
    destroy() {
      window.removeEventListener('click', handleClick)
    }
  }
}
