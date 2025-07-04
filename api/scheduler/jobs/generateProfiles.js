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
      id: 135,
      group: 1,
      data: {
        user_id: "kynksw9",
        tiktok: {
          email: "mariliaquinazperalta@gmail.com",
          password: "Jade_2021"
        },
        instagram: {
          email: "",
          password: ""
        }
      }
    },
    {
      id: 134,
      group: 1,
      data: {
        user_id: "kynkngq",
        tiktok: {
          email: "joann32kummklt@hotmail.com",
          password: "DEDEDE3$"
        },
        instagram: {
          email: "",
          password: ""
        }
      }
    },
    {
      id: 133,
      group: 1,
      data: {
        user_id: "kynkdje",
        tiktok: {
          email: "dennis72englerdqb@hotmail.com",
          password: "HOTHOT6-"
        },
        instagram: {
          email: "",
          password: ""
        }
      }
    },
    {
      id: 132,
      group: 1,
      data: {
        user_id: "kynk78o",
        tiktok: {
          email: "anthony73williamshwe@hotmail.com",
          password: "dswsaw3_"
        },
        instagram: {
          email: "",
          password: ""
        }
      }
    },
    {
      id: 131,
      group: 1,
      data: {
        user_id: "kynjwf6",
        tiktok: {
          email: "laragottino@gmail.com",
          password: "35623562leo@"
        },
        instagram: {
          email: "",
          password: ""
        }
      }
    },
  ]
}
