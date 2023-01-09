# auth0

## API Creation

docs: https://auth0.com/blog/developing-a-secure-api-with-nestjs-adding-authorization/

- After creating your tenant, you need to create an Auth0 [API](https://manage.auth0.com/?_ga=2.69504340.598902652.1658219820-1451879670.1656320355&_gl=1*1x1q696*rollup_ga*MTQ1MTg3OTY3MC4xNjU2MzIwMzU1*rollup_ga_F1G3E656YZ*MTY1ODMxNzE4OC4yMy4wLjE2NTgzMTcxODguNjA.#/apis), which is an API that you define within your Auth0 tenant and that you can consume from your applications to process authentication and authorization requests.
- Add a Name to your API:
- Set the Identifier: {{https://menu-api.demo.com}}
- Leave the signing algorithm as `RS256`. It's the best option from a security standpoint.
- As you may have more than one API that requires authorization services, you can create as many Auth0 APIs as you need. As such, the identifier is a unique string that Auth0 uses to differentiate between your Auth0 APIs. We recommend structuring the value of identifiers as URLs to make it easy to create unique identifiers predictably. Bear in mind that Auth0 never calls these URLs.
- Once you've added those values, hit the Create button.

```
AUTH0_DOMAIN=https://<AUTH0-TENANT-NAME>.auth0.com
AUTH0_AUDIENCE=https://menu-api.demo.com
```

- The AUTH0_DOMAIN is the value of the issuer property and the AUTH0_AUDIENCE is the value of the audience property, which is the same as the identifier that you created earlier.

## Frontend - SPA

- Create a new SPA application in the auth0 dashboard
- Grab domain and Client ID from settings
- Add `http://localhost:3000` to Allowed Callback URLs, Allowed Logout URLs, Allowed Web Origins.
- Edit redirect to field to ``http://localhost:3000` in password forget template.
