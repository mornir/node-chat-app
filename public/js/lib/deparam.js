export function deparam(urlString) {
  const searchParams = new URLSearchParams(urlString)
  return { name: searchParams.get('name'), room: searchParams.get('room') }
}
