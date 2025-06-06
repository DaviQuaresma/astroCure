// scheduler/jobs/generateProfiles.js
import { faker } from '@faker-js/faker'

export function generateProfiles(count = 5) {
    return Array.from({ length: count }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        age: faker.number.int({ min: 18, max: 60 }),
    }))
}
