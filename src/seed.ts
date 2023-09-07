import { faker } from '@faker-js/faker';
import { PrismaClient, type Prisma } from '@prisma/client';
import argon2 from 'argon2';
import { slugify } from './utils/slugify';

const prisma = new PrismaClient();

async function main() {
  // Create Subjects
  const numOfSubjects = 10;
  const subjectIds: string[] = [];
  for (let i = 0; i < numOfSubjects; i++) {
    const name = faker.lorem.sentence();

    const createSubjectInput: Prisma.SubjectCreateInput = {
      id: slugify(name),
      name,
      description: faker.lorem.paragraph(),
      image: faker.image.avatarGitHub(),
      background: faker.image.urlLoremFlickr(),
      startDate: faker.date.past(),
      endDate: faker.date.future(),
      registrationLimit: faker.number.int({ min: 0, max: 100 }),
      acceptingLimit: faker.number.int({ min: 0, max: 100 }),
      questions: {
        create: [
          {
            name: 'Tell me why you want to join this subject.',
            description: 'This is description for question 1.',
            type: 'TEXTAREA',
            required: faker.datatype.boolean(),
          },
          {
            name: 'Select your favorite color.',
            description: 'This is description for question 2.',
            type: 'COLOR',
            required: faker.datatype.boolean(),
          },
          {
            name: 'Select your favorite food.',
            description: 'This is description for question 3.',
            type: 'SELECT',
            required: faker.datatype.boolean(),
            options: JSON.stringify([
              { label: 'Pizza', value: 'pizza' },
              { label: 'Burger', value: 'burger' },
              { label: 'Pasta', value: 'pasta' },
              { label: 'Noodle', value: 'noodle' },
            ]),
          },
          {
            name: 'Select your favorite time.',
            description: 'This is description for question 4.',
            type: 'TIME',
            required: faker.datatype.boolean(),
            options: JSON.stringify([
              { label: 'Morning', value: 'morning' },
              { label: 'Afternoon', value: 'afternoon' },
              { label: 'Evening', value: 'evening' },
            ]),
          },
          {
            name: 'Can you love me?',
            description: 'This is description for question 5.',
            type: 'CHECKBOX',
            required: faker.datatype.boolean(),
            defaultValue: faker.helpers.arrayElement(['true', 'false']),
          },
        ],
      },
    };

    const subject = await prisma.subject.upsert({
      where: { id: createSubjectInput.id },
      update: {},
      create: createSubjectInput,
    });

    subjectIds.push(subject.id);
  }

  // Create Users
  const numOfUsers = 100;
  const userIds: string[] = [];
  for (let i = 0; i < numOfUsers; i++) {
    const createSubjectInput: Prisma.UserCreateInput = {
      id: faker.number.int({ min: 65_130_500_000, max: 65_130_500_000 + i }).toString(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      image: faker.image.avatar(),
      password: await argon2.hash(faker.internet.password()),
      registration: {
        create: {
          subjectId: faker.helpers.arrayElement(subjectIds),
        },
      },
    };

    const user = await prisma.user.upsert({
      where: { id: createSubjectInput.id },
      update: {},
      create: createSubjectInput,
    });

    userIds.push(user.id);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
