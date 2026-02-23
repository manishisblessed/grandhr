# Security — Secrets and Credentials

## Never commit real credentials

- **Database URLs:** Do not commit MongoDB Atlas (or any) connection strings with real usernames or passwords. Use placeholders in docs (e.g. `<YOUR_ATLAS_USER>:<YOUR_ATLAS_PASSWORD>`) and set real values only in `.env` on the server or in a secrets manager.
- **`.env` files:** Are in `.gitignore`. Keep all secrets in `.env` (or env vars) and never add them to the repository.

## If secrets were exposed (e.g. GitHub alert)

1. **Rotate credentials immediately** in the service (e.g. MongoDB Atlas):
   - Atlas → Database Access → edit user → set a new password (or create a new user and delete the old one).
   - Update your server `.env` with the new connection string.
2. **Remove secrets from the repo:** Docs have been updated to use placeholders only. If a past commit contained real values, consider them compromised; rotating (step 1) is what protects you.
3. **Optional:** For full history cleanup, use tools like `git filter-repo` or BFG only if you understand the impact (rewrites history, affects all clones). For most cases, rotating the credential is sufficient.

## Documentation

- Deployment and env docs (e.g. `EC2_ENV_VALUES.md`, `README.md`) show **placeholder** connection strings only. Replace placeholders with your real values in the server environment only.
