# Next.js Full-Stack Migration Plan

## Goal

Convert this project into a real Next.js full-stack application where:

- all APIs live in Next.js `app/api/**/route.js` handlers
- database connectivity is configured only through environment variables
- Express is removed
- Sequelize is removed
- schema changes are managed manually in phpMyAdmin, not by app-level migrations or ORM sync

## Current Project State

The project is already running on Next.js for the frontend, but the backend is still a legacy Express app embedded inside Next:

- `app/api/**/route.js` files mostly proxy requests into `app/api/_server/app.js`
- `app/api/_server/app.js` bootstraps Express, middleware, rate limiting, routes, and static uploads
- `app/api/_server/models/*.js` define Sequelize models
- `app/api/_server/controllers/*.js` contain most business logic
- `app/api/_server/bridge/internalServer.js` simulates Express requests inside the Next.js runtime

In practice, this means the app is not yet using native Next.js route handlers for its backend behavior.

## Backend Surface Identified

### Express route modules

- `addressRoute.js`
- `adminRoute.js`
- `attributeRoute.js`
- `blogRoute.js`
- `cartRoute.js`
- `categoryRoute.js`
- `couponRoute.js`
- `homePageRoute.js`
- `homeSlideRoute.js`
- `myListRoute.js`
- `orderRoute.js`
- `paymentRoute.js`
- `productRamRoute.js`
- `productRoute.js`
- `productSizeRoute.js`
- `productWeightRoute.js`
- `returnRoute.js`
- `reviewRoute.js`
- `sitemapRoute.js`
- `userAddressRoute.js`
- `userRoute.js`

### Sequelize models

- `Address`
- `AttributeType`
- `AttributeValue`
- `Blog`
- `CartProduct`
- `Category`
- `Coupon`
- `HomePageContent`
- `HomeSlide`
- `MyList`
- `Order`
- `OrderItem`
- `Product`
- `ProductRam`
- `ProductSize`
- `ProductWeight`
- `Return`
- `Review`
- `StoreSettings`
- `User`

## Problems With the Current Architecture

1. The backend is split between Next.js and an embedded Express layer.
2. Native Next.js API route benefits are lost because requests are proxied through a compatibility bridge.
3. Sequelize model sync can still create tables automatically, which conflicts with manual phpMyAdmin schema control.
4. Controllers are tightly coupled to Express `req`/`res` and Sequelize model APIs.
5. The current structure makes deployment and debugging harder than a standard Next.js full-stack app.

## Recommended Target Architecture

Use plain server-side modules under a structure like this:

```text
app/
  api/
    user/
    admin/
    product/
    category/
    order/
    ...
lib/
  server/
    db/
      mysql.js
    auth/
      cookies.js
      tokens.js
      guards.js
    repositories/
      users.js
      products.js
      orders.js
      ...
    services/
      auth-service.js
      order-service.js
      product-service.js
      ...
```

### Database approach

- Use `mysql2/promise`
- Read connection settings only from environment variables
- Do not run migrations from the app
- Do not run ORM sync
- Do not infer schema changes from models
- Keep tables, indexes, and schema changes managed in phpMyAdmin

## Environment Variables Needed

The application should be able to connect with only these database values:

```env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

Optional extras can be added later for SSL or pool tuning, but these five are enough for the default MySQL connection flow.

## Migration Strategy

### Phase 1: Shared foundation

- add a native MySQL pool utility using `mysql2/promise`
- add server helpers for JSON responses, auth, cookies, and request parsing
- stop automatic Sequelize table creation unless explicitly enabled

### Phase 2: Auth and user APIs

Migrate first because most protected features depend on them:

- register
- login
- logout
- refresh token
- user details
- forgot password
- reset password
- Google login
- avatar upload

### Phase 3: Admin and settings APIs

- admin login
- dashboard stats
- users management
- settings CRUD

### Phase 4: Catalog APIs

- categories
- products
- product variants
- attributes
- blogs
- homepage content
- sliders
- reviews

### Phase 5: Commerce APIs

- cart
- wishlist
- coupons
- orders
- returns
- payment
- address handling

### Phase 6: Cleanup

- remove proxy bridge files
- remove Express app bootstrap
- remove Sequelize models
- remove Express/Sequelize dependencies from `package.json`

## Practical Rewrite Rules

When converting each API:

1. Move query logic into a repository module using raw SQL.
2. Move business logic into a service module.
3. Keep `route.js` focused on request parsing, auth checks, and response formatting.
4. Use `NextRequest` and `NextResponse` directly.
5. Replace Sequelize pagination/filtering with explicit SQL.
6. Keep response shapes compatible where possible so the frontend does not need a full rewrite at the same time.

## Important Notes for This Repo

- Uploads currently rely on local filesystem storage under `uploads/`
- Auth currently uses JWT plus cookies
- Several admin routes rely on cookie-based auth guards
- Some data fields are stored as JSON strings in MySQL text columns, such as product images and sizes
- Payment and email logic should be migrated after auth and order foundations are stable

## Recommendation

The safest implementation path is an incremental migration, not a full big-bang rewrite:

- keep the frontend unchanged at first
- replace backend domains one by one
- preserve API response contracts during the migration
- remove Express and Sequelize only after the last domain has been ported

## What Was Verified During Analysis

- the frontend is already Next.js App Router based
- the API layer is still largely Express behind proxy route handlers
- database access is currently implemented through Sequelize models
- the repo already uses MySQL via `mysql2`, so the native MySQL migration can build on an existing dependency

