const MIN = 3
const MAX = 15

export function isValidHandle(handle: string) {
  if (handle.length < MIN || handle.length > MAX) {
    return false
  }
  return /^[0-9A-Za-z_]+$/.test(handle)
}

export { MIN as MIN_HANDLE_LEN, MAX as MAX_HANDLE_LEN }
