// scheduler/jobs/generateProfiles.js
import { faker } from '@faker-js/faker'

// export function generateProfiles(count = 5) {
//     return Array.from({ length: count }, () => ({
//         id: faker.string.uuid(),
//         name: faker.person.fullName(),
//         email: faker.internet.email(),
//         age: faker.number.int({ min: 18, max: 60 }),
//     }))
// }

export function generateProfiles() {
  return [
    {
      user_id: "kt4kg1b",
      email: "Jedjdjdi123@outlook.com"
    }
    // {
    //   user_id: "kt4kfdq",
    //   email: "Dfhhg3432@outlook.com"
    // }
  ]
}
