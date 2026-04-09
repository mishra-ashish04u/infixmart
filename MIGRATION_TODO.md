# Migration Todo

## Status Key

- `[x]` done
- `[-]` in progress
- `[ ]` not started

## Foundation

- [x] document the full migration strategy in `NEXTJS_FULLSTACK_MIGRATION.md`
- [x] add native MySQL pool helper in `lib/server/db/mysql.js`
- [x] stop implicit Sequelize schema sync unless explicitly enabled
- [x] add native server helpers for API responses, cookies, tokens, and auth guards

## User and Auth

- [x] migrate `app/api/user/[[...path]]/route.js` from Express proxy to native Next.js dispatch
- [x] port `register`
- [x] port `verifyemail`
- [x] port `login`
- [x] port `logout`
- [x] port `refresh-token`
- [x] port `user-details`
- [x] port `forgot-password`
- [x] port `verify-forgot-password-otp`
- [x] port `resend-otp`
- [x] port `reset-password`
- [x] port `google-login`
- [x] port `PUT /api/user/:id`
- [x] port `user-avatar`
- [x] port `deleteimage`
- [x] port `/api/user/addresses`

## Admin

- [x] migrate admin login
- [x] migrate dashboard stats
- [x] migrate users management
- [x] migrate settings CRUD

## Catalog

- [x] migrate categories
- [x] migrate products
- [x] migrate product variants
- [x] migrate attributes
- [x] migrate reviews
- [x] migrate blogs
- [x] migrate homepage content
- [x] migrate home sliders

## Commerce

- [x] migrate cart
- [x] migrate wishlist
- [x] migrate coupons
- [x] migrate orders
- [x] migrate returns
- [x] migrate payment
- [x] migrate address domain
- [x] remove legacy fallback from dedicated commerce route handlers

## Cleanup

- [x] remove legacy proxy handlers for fully migrated domains
- [x] remove legacy fallback from commerce route handlers
- [x] remove legacy fallback from blog/homepage/homeSlide/reviews routes
- [x] migrate `uploads` asset serving to native Next.js route
- [x] migrate `sitemap.xml` generation to native Next.js route
- [x] move shared upload and HTML sanitizer helpers out of `app/api/_server`
- [x] move `create-admin` script off the legacy Sequelize backend
- [x] remove Express bootstrap from `app/api/_server/app.js`
- [x] remove Sequelize models
- [x] remove Express and Sequelize from `package.json`
- [x] run full build verification at the end of the migration
