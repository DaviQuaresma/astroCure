export function parseRemark(text = '') {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
    const result = {}

    for (const line of lines) {
        const [keyRaw, ...valueParts] = line.split(':')
        const key = keyRaw.trim().toLowerCase().replace(/[^a-z0-9]/gi, '')
        const value = valueParts.join(':').trim()

        if (key && value) {
            result[key] = value
        }
    }

    return result
}
