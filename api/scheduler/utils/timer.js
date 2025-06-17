export const delay = (ms) => new Promise((res) => setTimeout(res, ms))

export const randomBetween = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min)
