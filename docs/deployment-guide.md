# Deployment Guide — Mekong Mobile L2 Warranty Intake

## 1. Requirements

- Windows 10/11, macOS, or a recent Linux distribution.
- Git 2.30 or later.
- Docker Desktop with Docker Compose v2, or Docker Engine with the Compose v2 plugin.
- At least 2 GB of free disk space for the application image and PostgreSQL data.
- Host port `3001` available for the application. PostgreSQL port `5432` is not published to the host.
- Node.js and PostgreSQL do not need to be installed on the host when using Docker.

Check the installed tools:

```sh
git --version
docker compose version
```

## 2. Setup steps

Run these commands from a terminal. For the final coursework clean-machine check, the repository should have a `v1.0` tag pointing to the tested submission commit.

1. Clone the project and enter its directory:

```sh
git clone --branch v1.0 https://github.com/Dang-Mai-Hoang-Long/cdtn1-dangmaihoanglong-l2.git
cd ctdn1-dangmaihoanglong-l2
```

2. Optional: create a local environment file if you want to change the Compose database name, user, or password. The defaults work without this step:

```sh
cp .env.example .env
```

On PowerShell, use `Copy-Item .env.example .env`.

3. Build and start the application and database:

```sh
docker compose up -d --build
```

The app container applies database migrations, loads sample business data, and creates the five demo users before starting the API. On a new database volume, initialization is automatic. The demo users use the shared password documented in the project README. These credentials are for local coursework only.

Run the test suite in a separate container, using a separate logical test database on the same PostgreSQL service:

```sh
docker compose --profile test run --build --rm test npm test
```

The test runner image contains the test files and development dependencies. It creates `${DB_NAME}_test` if needed, then sets both `DATABASE_URL` and `TEST_DATABASE_URL` for the test process. The integration helper resets only the `_test` database schema; it does not reset the application database. Node.js and PostgreSQL are not required on the host.

To stop the services while retaining database data:

```sh
docker compose down
```

To remove the local database volume and all data created in it:

```sh
docker compose down -v
```

## 3. Environment variables

| Name                  | Meaning                                                   | Sample value                                      | Required                                                                |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| `DB_NAME`             | PostgreSQL database name used by Compose                  | `mekong_mobile_l2`                                | No; Compose default is used                                             |
| `DB_USER`             | PostgreSQL application user                               | `postgres`                                        | No; Compose default is used                                             |
| `DB_PASSWORD`         | Local PostgreSQL password                                 | `thay_bang_mat_khau_postgres` from `.env.example` | No for local coursework; set a private value for any shared environment |
| `AUTH_COOKIE_SECURE`  | Enables the cookie `Secure` attribute when set to `true`  | `false` for local HTTP                            | No; defaults to `false` in Compose                                      |
| `APP_USER_USERNAME`   | Optional account created with the project account script  | Empty                                             | No                                                                      |
| `APP_USER_PASSWORD`   | Password for the optional account                         | Empty                                             | No                                                                      |
| `APP_USER_ROLE`       | Optional account role: `NHAN_VIEN_TIEP_NHAN` or `QUAN_LY` | Empty                                             | No                                                                      |
| `APP_USER_CENTER_ID`  | Center for an optional intake-staff account               | Empty                                             | No                                                                      |
| `APP_USER_CENTER_IDS` | Centers assigned to an optional manager account           | Empty                                             | No                                                                      |

The Compose service uses its own internal database hostname and port. Compose sets `DB_HOST=database` and `DB_PORT=5432`; these are Docker's internal network address and port, not a connection to PostgreSQL on the host. The `DB_NAME`, `DB_USER`, and `DB_PASSWORD` values configure the database container and the app's connection to it. The local `DB_HOST`, `DB_PORT`, and `DATABASE_URL` values in `.env.example` are for running the app directly on the host. Do not commit `.env` or place real credentials in screenshots or documentation.

## 4. Sample data

On startup, the app runs `npm run db:seed`. On a clean database, the seed files in `seeds/` create 6 issue categories, 1,050 customers, 1,050 devices, 1,020 tickets, and 1,078 status-log rows. Check these counts with the default database settings:

```sh
docker compose exec database psql -U postgres -d mekong_mobile_l2 -c "SELECT (SELECT COUNT(*) FROM issue_category) AS categories, (SELECT COUNT(*) FROM customer) AS customers, (SELECT COUNT(*) FROM device) AS devices, (SELECT COUNT(*) FROM ticket) AS tickets, (SELECT COUNT(*) FROM ticket_status_log) AS status_logs;"
```

If `DB_USER` or `DB_NAME` was changed in `.env`, use those values in the command. The app also runs `npm run auth:seed-demo-users`, which creates or resets five local demo accounts:

- `nv.trungtam-a.1` and `nv.trungtam-a.2` — intake staff at center A.
- `nv.trungtam-b.1` and `nv.trungtam-b.2` — intake staff at center B.
- `quanly` — manager assigned to centers A and B.

All five demo accounts use `MekongL2Demo!2026`. The seed scripts are idempotent for the sample records. Demo user passwords are reset to the coursework password whenever the app container starts; do not use this demo setup for production or shared deployment.

## 5. Verify it works

Check that both containers are running:

```sh
docker compose ps
```

Expected result: the `database` and `app` services show `healthy`.

Check the API readiness endpoint:

```sh
curl.exe -i http://localhost:3001/health
```

Expected result: HTTP `200` and JSON `{"status":"ok","db":"up"}`. If the database is unavailable, the endpoint returns HTTP `503` and `{"status":"error","db":"down"}`.

Run the tests:

```sh
docker compose --profile test run --build --rm test npm test
```

Expected result: all 15 test cases pass, including the PostgreSQL integration cases; the test command reports zero failures and zero skipped cases.

Open `http://localhost:3001` in a browser, sign in with a local demo account, and confirm the seeded ticket list appears. To inspect startup errors, run:

```sh
docker compose logs app --tail 50
```

For a clean-machine check, clone into a new empty folder, create `.env` from `.env.example`, run `docker compose up -d --build`, then verify the container status and `/health` response above. Remove the volume first with `docker compose down -v` when repeating the initialization check against an existing checkout.
