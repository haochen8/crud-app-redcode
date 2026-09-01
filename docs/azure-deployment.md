# Azure deployment guide

This guide deploys Book & Quotes as one HTTPS application:

```text
Browser
   │
   ▼
Azure App Service
   ├── Angular static application
   └── ASP.NET Core /api and /health
                 │
                 ▼
            Azure SQL Database
```

Keeping Angular and the API on one origin removes production CORS configuration and lets the
frontend use the relative `/api` URL. Local development remains split between ports 4200 and 5047
and continues to use SQLite.

Azure App Service on Linux does not support file-based databases such as SQLite because its shared
filesystem cannot provide the required exclusive file locks. The API therefore supports the
`SqlServer` provider in production, while the same migrations still create the local SQLite schema.

## 1. Prerequisites and cost control

You need:

- An Azure subscription and permission to create resources.
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) or Azure Cloud Shell.
- Access to this GitHub repository's Actions settings.
- A local clone only if you want to verify the deployment package yourself.

App Service and Azure SQL can incur charges. Review the selected tiers in the Azure pricing
calculator and create a budget or cost alert before continuing. The examples use the `B1` App
Service tier and `Basic` Azure SQL tier for a small demonstration environment; choose tiers that fit
your subscription and expected use.

## 2. Sign in and choose unique names

Open a Bash terminal or Azure Cloud Shell, sign in, and select the correct subscription:

```bash
az login
az account list --output table
az account set --subscription "<subscription name or ID>"
```

Set deployment-specific variables. App Service and SQL Server names must be globally unique, so
replace the example suffix:

```bash
BOOK_QUOTES_RESOURCE_GROUP="book-quotes-rg"
BOOK_QUOTES_LOCATION="swedencentral"
BOOK_QUOTES_PLAN="book-quotes-plan"
BOOK_QUOTES_APP="book-quotes-<unique-suffix>"
BOOK_QUOTES_SQL_SERVER="book-quotes-sql-<unique-suffix>"
BOOK_QUOTES_DATABASE="bookquotes"
BOOK_QUOTES_SQL_ADMIN="bookquotesadmin"
```

## 3. Create App Service

Create a Windows App Service plan and a .NET 9 web app:

```bash
az group create \
  --name "$BOOK_QUOTES_RESOURCE_GROUP" \
  --location "$BOOK_QUOTES_LOCATION"

az appservice plan create \
  --name "$BOOK_QUOTES_PLAN" \
  --resource-group "$BOOK_QUOTES_RESOURCE_GROUP" \
  --location "$BOOK_QUOTES_LOCATION" \
  --sku B1

az webapp list-runtimes --os-type Windows --output table

az webapp create \
  --name "$BOOK_QUOTES_APP" \
  --resource-group "$BOOK_QUOTES_RESOURCE_GROUP" \
  --plan "$BOOK_QUOTES_PLAN" \
  --runtime "DOTNET:9"
```

The runtime listing is an intentional check: if Azure changes the canonical .NET 9 runtime label,
use the value shown by `az webapp list-runtimes`.

Require HTTPS and enable Always On for the `B1` plan:

```bash
az webapp update \
  --name "$BOOK_QUOTES_APP" \
  --resource-group "$BOOK_QUOTES_RESOURCE_GROUP" \
  --https-only true

az webapp config set \
  --name "$BOOK_QUOTES_APP" \
  --resource-group "$BOOK_QUOTES_RESOURCE_GROUP" \
  --always-on true \
  --http20-enabled true \
  --ftps-state Disabled
```

## 4. Create Azure SQL

Read the SQL administrator password without placing it in shell history. Use a unique strong value:

```bash
read -s -p "SQL administrator password: " BOOK_QUOTES_SQL_PASSWORD
```

Create the logical server and database:

```bash
az sql server create \
  --name "$BOOK_QUOTES_SQL_SERVER" \
  --resource-group "$BOOK_QUOTES_RESOURCE_GROUP" \
  --location "$BOOK_QUOTES_LOCATION" \
  --admin-user "$BOOK_QUOTES_SQL_ADMIN" \
  --admin-password "$BOOK_QUOTES_SQL_PASSWORD"

az sql db create \
  --resource-group "$BOOK_QUOTES_RESOURCE_GROUP" \
  --server "$BOOK_QUOTES_SQL_SERVER" \
  --name "$BOOK_QUOTES_DATABASE" \
  --service-objective Basic
```

Allow resources inside Azure to reach the database. This rule is convenient for a learning
deployment, but a production system should use private networking and managed identity instead:

```bash
az sql server firewall-rule create \
  --resource-group "$BOOK_QUOTES_RESOURCE_GROUP" \
  --server "$BOOK_QUOTES_SQL_SERVER" \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## 5. Configure production settings and secrets

Generate a random JWT signing key and construct the encrypted App Service connection setting:

```bash
BOOK_QUOTES_JWT_KEY="$(openssl rand -base64 48)"

BOOK_QUOTES_SQL_CONNECTION="Server=tcp:${BOOK_QUOTES_SQL_SERVER}.database.windows.net,1433;Initial Catalog=${BOOK_QUOTES_DATABASE};Persist Security Info=False;User ID=${BOOK_QUOTES_SQL_ADMIN};Password=${BOOK_QUOTES_SQL_PASSWORD};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

Store non-connection settings as App Service application settings:

```bash
az webapp config appsettings set \
  --name "$BOOK_QUOTES_APP" \
  --resource-group "$BOOK_QUOTES_RESOURCE_GROUP" \
  --settings \
    ASPNETCORE_ENVIRONMENT=Production \
    Database__Provider=SqlServer \
    Jwt__Key="$BOOK_QUOTES_JWT_KEY"
```

Store the database value as a typed, encrypted connection string:

```bash
az webapp config connection-string set \
  --name "$BOOK_QUOTES_APP" \
  --resource-group "$BOOK_QUOTES_RESOURCE_GROUP" \
  --connection-string-type SQLAzure \
  --settings DefaultConnection="$BOOK_QUOTES_SQL_CONNECTION"
```

ASP.NET Core maps the Azure connection-string setting to
`ConnectionStrings:DefaultConnection`. Nested application settings use double underscores on App
Service. Do not put either secret in `appsettings.json`, GitHub variables, workflow logs, or source
control.

Clear the shell values when this terminal session is no longer needed:

```bash
unset BOOK_QUOTES_SQL_PASSWORD BOOK_QUOTES_SQL_CONNECTION BOOK_QUOTES_JWT_KEY
```

## 6. Connect GitHub Actions

The workflow at `.github/workflows/deploy-azure.yml` builds Angular, copies its browser output into
the API's `wwwroot`, publishes .NET, and deploys the combined folder.

1. In the Azure portal, open the App Service and select **Overview → Get publish profile**. Treat the
   downloaded XML as a password. If profile download is disabled, temporarily enable **SCM Basic
   Auth Publishing Credentials** under **Configuration → General settings**.
2. In GitHub, open **Settings → Secrets and variables → Actions → Variables**. Create
   `AZURE_WEBAPP_NAME` with the exact value of `$BOOK_QUOTES_APP`.
3. Open the **Secrets** tab and create `AZURE_WEBAPP_PUBLISH_PROFILE`. Paste the entire publish
   profile XML as its value.
4. Delete the downloaded XML from your computer after GitHub stores it.
5. Open **Actions → Deploy to Azure App Service → Run workflow** and run it from `main`.

The workflow is manual so an unconfigured repository does not generate failed deployments. After
the first successful release, you may add a `push` trigger for `main` if automatic production
deployment is appropriate.

For a longer-lived application, replace the publish profile with GitHub OpenID Connect. OIDC uses
short-lived Azure credentials and avoids a long-lived deployment password.

## 7. Verify the live application

Set the public URL and check health:

```bash
BOOK_QUOTES_URL="https://${BOOK_QUOTES_APP}.azurewebsites.net"
curl --fail --show-error "${BOOK_QUOTES_URL}/health"
```

Then open `$BOOK_QUOTES_URL` and verify:

- Registration redirects to login and creates five starter quotes.
- Login succeeds and survives a page refresh.
- Books create, edit, search, sort, and delete work.
- Quotes create, edit, search, and delete work.
- A direct visit to `/books` or `/quotes` loads Angular instead of returning 404.
- The mobile menu and light/dark theme work.
- `/api/books` without a Bearer token returns `401 Unauthorized`.

The API runs EF Core migrations and seeds the three initial books during startup. The first request
can therefore take longer than later requests.

When the data model changes, review every new migration for both providers before deploying. The
committed migrations intentionally select SQLite or SQL Server column types at runtime. Generate
offline scripts for each provider and inspect them as part of the review:

```bash
Database__Provider=Sqlite \
dotnet tool run dotnet-ef migrations script \
  --project server/BookQuotes.Api \
  --startup-project server/BookQuotes.Api

Database__Provider=SqlServer \
ConnectionStrings__DefaultConnection="Server=localhost;Database=bookquotes;User Id=placeholder;Password=Placeholder1!;TrustServerCertificate=True" \
dotnet tool run dotnet-ef migrations script \
  --project server/BookQuotes.Api \
  --startup-project server/BookQuotes.Api
```

## 8. Troubleshooting

Enable and follow App Service logs:

```bash
az webapp log config \
  --name "$BOOK_QUOTES_APP" \
  --resource-group "$BOOK_QUOTES_RESOURCE_GROUP" \
  --application-logging filesystem \
  --level information

az webapp log tail \
  --name "$BOOK_QUOTES_APP" \
  --resource-group "$BOOK_QUOTES_RESOURCE_GROUP"
```

Common problems:

| Symptom | Check |
| --- | --- |
| Startup returns 500/503 | Verify `Database__Provider`, `Jwt__Key`, and the connection string in App Service settings. |
| SQL connection fails | Verify the `AllowAzureServices` firewall rule, SQL credentials, server name, and database name. |
| GitHub deployment fails immediately | Add the exact repository variable and full publish-profile secret described above. |
| Refreshing `/books` returns 404 | Confirm Angular files were copied into `publish/wwwroot` by the workflow. |
| Login works locally but not in Azure | Confirm the site uses HTTPS and `/api`, then inspect the browser network response and App Service logs. |

## 9. Remove the demonstration environment

Deleting the resource group permanently removes the web app, SQL server, database, and all user
data. Only run this after confirming that nothing in the group must be retained:

```bash
az group delete --name "$BOOK_QUOTES_RESOURCE_GROUP"
```

Also remove or rotate `AZURE_WEBAPP_PUBLISH_PROFILE` in GitHub if the App Service is deleted or the
profile is regenerated.

## Official Azure references

- [Deploy App Service with GitHub Actions](https://learn.microsoft.com/azure/app-service/deploy-github-actions)
- [Configure App Service settings and connection strings](https://learn.microsoft.com/azure/app-service/configure-common)
- [App Service Linux SQLite limitation](https://learn.microsoft.com/troubleshoot/azure/app-service/faqs-app-service-linux-new)
- [Deploy ASP.NET Core with Azure SQL](https://learn.microsoft.com/azure/app-service/tutorial-dotnetcore-sqldb-app)
- [Azure CLI web app reference](https://learn.microsoft.com/cli/azure/webapp)
