# Fest

Fest is a SaaS boilerplate built with Node.js & React. It's equipped with the following features:

- User authentication and authorization with email verification and password reset.
- Organizations management system.
- Invite system: users can join organizations by having different roles.
- Secure API endpoints and Front-end routes with role-based authorization.

<p align="center">
  <kbd>
    <img width="320" src="https://github.com/DimiMikadze/fest/blob/main/screenshot2.png">
  </kbd>
  <kbd>
    <img width="320" src="https://github.com/DimiMikadze/fest/blob/main/screenshot.png">
  </kbd>
</p>

## Tech Stack

The repository is structured as a Monorepo using [Nx](https://nx.dev). It contains two apps:

- [api](./apps/api) A [Nest.js](https://nestjs.com/) application, with [Prisma ORM](https://www.prisma.io/).
- [frontend](./apps/frontend) A [Next.js](https://nextjs.org/) application with [MUI](https://mui.com/) React components.

And a [shared](./libs/shared) library for sharing common Typescript types, constants, and utility functions across apps.

[auth0](https://auth0.com/) is used for Identity management and PostgreSQL as a database.

## Requirements

- You'll need docker installed on your machine to run the PostgreSQL.
- For identity management to work, you need to create an account in [auth0](https://auth0.com/) and create two apps in there as described in [here](./docs/auth0.md).
- [Postmark](https://postmarkapp.com/) is used in the repository as an email client. To send emails with Postmark, grab the key from their dashboard and add it to `apps/api/.env`. If you want to use another email client, change the corresponding code in `apps/api/src/mail.service.ts`.

## Getting started

- Clone the repo: `git clone https://github.com/DimiMikadze/fest.git`.
- Install dependencies: `yarn`.
- Rename `apps/api/.env.example` to `.env` and `apps/frontend/.env.local.example` to `.env.local` and update environment variables.
- Navigate to the `apps/api` directory and run `docker-compose up`, to run the PostgreSQL instance.
- run `yarn dev` from the project's root, to run API and frontend apps in the development mode.

## License

Fest is an open-source software [licensed as MIT](./LICENSE).
