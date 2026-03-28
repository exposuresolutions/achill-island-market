# n8n workflows (DDWL)

Import in self-hosted or n8n Cloud: **Workflows → ⋮ → Import from File**.

| File | Purpose |
|------|---------|
| [ddwl-smoke-test.json](ddwl-smoke-test.json) | Calls `https://dodealswithlee.onrender.com/health` then `POST /ask-lilly`. No secrets. |
| [ddwl-render-deploy.json](ddwl-render-deploy.json) | `POST https://api.render.com/v1/services/{id}/deploys`. Set `RENDER_SERVICE_ID` in [n8n variables](https://docs.n8n.io/hosting/environment-variables/) or host env; add **Header Auth** on the HTTP node: `Authorization: Bearer YOUR_RENDER_API_KEY`. Keys: [Render API keys](https://dashboard.render.com/u/settings#api-keys). |

Docs: [Render API](https://api-docs.render.com/reference), [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/).
