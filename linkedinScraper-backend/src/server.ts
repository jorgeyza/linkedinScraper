import { prismaClient } from '../prisma'
import { ApolloServer, gql, UserInputError } from 'apollo-server'

const prisma = prismaClient()

const typeDefs = gql`
  type Profile {
    id: ID!
    name: String
    title: String
    location: String
    resume: String
    experiences: [Experience]
    educations: [Education]
    createdAt: String!
    updatedAt: String!
  }

  type Experience {
    id: ID!
    title: String
    date: String
    company: String
    createdAt: String!
    updatedAt: String!
    profile: Profile
    profileId: String
  }

  type Education {
    id: ID!
    institution: String
    career: String
    date: String
    createdAt: String!
    updatedAt: String!
    profile: Profile
    profileId: String
  }

  type Query {
    getAllProfiles: [Profile]!
  }

  type Mutation {
    createProfile(
      name: String
      title: String
      location: String
      resume: String
      experiences: [ExperienceInput]
      educations: [EducationInput]
    ): Profile!
    deleteAllProfiles: Boolean!
  }

  input ExperienceInput {
    title: String!
    date: String!
    company: String!
  }

  input EducationInput {
    institution: String!
    career: String!
    date: String!
  }
`

const resolvers = {
  Query: {
    getAllProfiles: () => {
      return prisma.profile.findMany()
    }
  },
  Profile: {
    experiences: (parent: { id: string }) => {
      return prisma.experience.findMany({
        where: {
          profileId: parent.id
        }
      })
    },
    educations: (parent: { id: string }) => {
      return prisma.education.findMany({
        where: {
          profileId: parent.id
        }
      })
    }
  },
  Mutation: {
    createProfile: (_parent: any, args: { name: string; title: string; location: string; resume: string; experiences: any; educations: any }) => {
      try {
        return prisma.profile.create({
          data: {
            name: args.name,
            title: args.title,
            location: args.location,
            resume: args.resume,
            experiences: {
              create: args.experiences
            },
            educations: {
              create: args.educations
            }
          }
        })
      } catch (error) {
        if (error instanceof Error)
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
      }
    },
    deleteAllProfiles: () => {
      try {
        return prisma.profile.deleteMany().then(() => true)
      } catch (error) {
        if (error instanceof Error) throw new Error(error.message)
      }
    }
  }
}

const port = process.env.PORT || 4000

const server = new ApolloServer({ typeDefs, resolvers })
server
  .listen({ port })
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
  })
  .catch((error) => {
    console.log(error)
  })

async function main() {
  // await prisma.profile.create({
  //   data: {
  //     name: 'Jorge Alonso Eyzaguirre Herrera',
  //     title: 'Web Developer',
  //     location: 'Perú',
  //     resume:
  //       'Desarrollador web con Bachiller en Administración otorgado por la Universidad del Pacífico. Apasionado por la tecnología y en solucionar problemas. Con ganas de seguir creciendo y aprendiendo.',
  //     experiences: {
  //       create: [
  //         { title: 'Frontend Web Developer', date: 'nov 2021 – actualidad', company: 'Krowdy Jornada completa' },
  //         {
  //           title: 'Web Developer',
  //           date: 'jul 2021 – nov 2021',
  //           company: 'Profesional independiente'
  //         },
  //         {
  //           title: 'Scrum Master / QA / Coordinador de Planeación',
  //           date: 'abr 2019 – abr 2020',
  //           company: 'Krowdy Jornada completa'
  //         },
  //         {
  //           title: 'Asistente Administrativo',
  //           date: 'feb 2018 – ene 2019',
  //           company: 'HYDROMAQ S.A.C. Jornada completa'
  //         },
  //         {
  //           title: 'Equipo de operaciones',
  //           date: 'dic 2015 – mar 2016',
  //           company: 'Busch Gardens Tampa Contrato temporal'
  //         },
  //         {
  //           title: 'Asistente de Administración/Contabilidad',
  //           date: 'ene 2015 – mar 2015',
  //           company: 'HYDROMAQ S.A.C. Contrato de prácticas'
  //         }
  //       ]
  //     },
  //     educations: {
  //       create: [
  //         {
  //           institution: 'Universidad del Pacífico (PE)',
  //           career: 'Bachillerato',
  //           date: '2012 – 2017'
  //         }
  //       ]
  //     }
  //   }
  // })
  
  // const allProfiles = await prisma.profile.findMany({
  //   include: {
  //     experiences: true,
  //     educations: true
  //   }
  // })
  // console.dir(allProfiles, { depth: null })
}

main()
  .catch((error) => {
    throw error
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
