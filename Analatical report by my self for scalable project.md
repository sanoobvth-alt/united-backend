PLease analyse the project and give me the project to feature based scalable arctitecture.
In this like Route COntroller Service model.
So I need it in feature based.
also in this have theme context.
axios configuration.
prisma config.
middle wares i prefere all with zod not express validator.
So may be the structure change .
rest of middle wares use the same.
module\jira you can skip in analyse.
searilizer sanitisation json response.
Input will handle zod so there is no need.
in utilities use below files
APiError
file.utility
generate token
queryBuilder (importand for db filter)
toSlug for routing url.
and analyse first the app.js
i need middle wares are
cors
morgan
express.josn
express.urlencoded
notFoundMiddleware
errorMiddleware
and this project in ES6+ not in commonjs
And its monolith
Role-Based Access Control (RBAC)
Define user roles (admin, user, moderator)
Permission-based endpoint access
Middleware for authorization checks
Granular resource-level permissions.
packages used
"@prisma/adapter-pg": "^7.4.1",
"@prisma/client": "^7.4.1",
"axios": "^1.13.6",
"bcrypt": "^6.0.0",
"cors": "^2.8.6",
"dotenv": "^17.3.1",
"express": "^5.2.1",
"jsonwebtoken": "^9.0.3",
"moment": "^2.30.1",
"morgan": "^1.10.1",
"multer": "^2.0.2",
"openai": "^6.25.0",
"path-to-regexp": "^8.3.0"
"devDependencies": {
"prisma": "^7.4.1"
}

script of package.json
"dev": "nodemon server.js",
"start": "node server.js",

    This md file i need to create a not for every upcoming my project frame work.
    So this want to usefull for scalable project .
    Give me the Scalable_Project.md file.
    After that if you have any suggestion please give me .
    And i want folder structure should be feature based.
