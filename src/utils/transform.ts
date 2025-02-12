export const transform = (data) => {
  return Object.keys(data).reduce((acc, key) => {
    let cKey = key.replace(/_([a-zA-Z])/g, ($0, $1) => $1.toUpperCase())
    acc[cKey] = data[key]

    return acc
  }, {})
}
