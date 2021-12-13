# LinkedIn Scraper Backend

Install the dependencies with ```npm install``` or ```yarn```.

Add a ```.env``` file following the ```.env.test``` example. 

Run the docker-compose file to set up a postgres database with ```docker-compose up -d``` or create a linkedinProfiles database in your local machine.

Run the following command to create your Postgres database file. This also creates the Profile, Experience and Education tables.
`npx prisma migrate dev --name init`.

Launch your GraphQL server with ```npm run dev```.

Try the following query:
```
query getAllProfiles {
  getAllProfiles {
    id
    name
    title
    resume
    experiences {
      company
    }
    educations {
      career
    }
    createdAt
    updatedAt
  }
}
```
You should get: 
```
{
  "data": {
    "getAllProfiles": []
  }
}
```