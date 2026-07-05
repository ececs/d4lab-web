import { workflow, node, trigger, expr } from '@n8n/workflow-sdk';

const requestWebhook = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Infisical Request',
    position: [260, 300],
    parameters: {
      httpMethod: 'POST',
      path: 'infisical-secret-gateway',
      responseMode: 'responseNode',
      options: {
        responseHeaders: {
          entries: [
            { name: 'content-type', value: 'application/json' },
          ],
        },
      },
    },
  },
  output: [
    {
      body: {
        secretKey: 'OPENAI_API_KEY',
        environment: 'dev',
        secretPath: '/',
        includeValue: true,
      },
    },
  ],
});

const loginToInfisical = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Login to Infisical',
    position: [540, 300],
    parameters: {
      method: 'POST',
      url: expr('{{ $env.INFISICAL_BASE_URL || "https://app.infisical.com" }}/api/v1/auth/universal-auth/login'),
      sendBody: true,
      contentType: 'form-urlencoded',
      specifyBody: 'keypair',
      bodyParameters: {
        parameters: [
          { name: 'clientId', value: expr('{{ $env.INFISICAL_CLIENT_ID || "" }}') },
          { name: 'clientSecret', value: expr('{{ $env.INFISICAL_CLIENT_SECRET || "" }}') },
        ],
      },
      options: {
        response: {
          response: {
            fullResponse: false,
            neverError: false,
            responseFormat: 'json',
          },
        },
      },
    },
  },
  output: [
    {
      accessToken: 'example-token',
      tokenType: 'Bearer',
      expiresIn: 7200,
    },
  ],
});

const listSecrets = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'List Secrets',
    position: [840, 300],
    parameters: {
      method: 'GET',
      url: expr('{{ $env.INFISICAL_BASE_URL || "https://app.infisical.com" }}/api/v4/secrets'),
      sendHeaders: true,
      specifyHeaders: 'keypair',
      headerParameters: {
        parameters: [
          {
            name: 'Authorization',
            value: expr('Bearer {{ $("Login to Infisical").item.json.accessToken }}'),
          },
          { name: 'Accept', value: 'application/json' },
        ],
      },
      sendQuery: true,
      specifyQuery: 'keypair',
      queryParameters: {
        parameters: [
          { name: 'projectId', value: expr('{{ $env.INFISICAL_PROJECT_ID || "" }}') },
          {
            name: 'environment',
            value: expr('{{ $("Infisical Request").item.json.body.environment || $env.INFISICAL_DEFAULT_ENV || "dev" }}'),
          },
          {
            name: 'secretPath',
            value: expr('{{ $("Infisical Request").item.json.body.secretPath || $env.INFISICAL_DEFAULT_PATH || "/" }}'),
          },
          { name: 'viewSecretValue', value: 'true' },
          { name: 'expandSecretReferences', value: 'true' },
          { name: 'includeImports', value: 'false' },
        ],
      },
      options: {
        response: {
          response: {
            fullResponse: false,
            neverError: false,
            responseFormat: 'json',
          },
        },
      },
    },
  },
  output: [
    {
      secrets: [
        {
          id: 'secret-id',
          secretKey: 'OPENAI_API_KEY',
          secretValue: 'sk-example',
          secretComment: 'Main OpenAI key',
          secretMetadata: [],
          version: 1,
          secretPath: '/',
          environment: 'dev',
          updatedAt: '2026-04-20T00:00:00.000Z',
        },
      ],
    },
  ],
});

const selectSecret = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Select Secret',
    position: [1140, 300],
    parameters: {
      mode: 'manual',
      includeOtherFields: false,
      assignments: {
        assignments: [
          {
            id: 'requestedKey',
            name: 'requestedKey',
            type: 'string',
            value: expr('{{ $("Infisical Request").item.json.body.secretKey || "" }}'),
          },
          {
            id: 'requestedEnvironment',
            name: 'requestedEnvironment',
            type: 'string',
            value: expr('{{ $("Infisical Request").item.json.body.environment || $env.INFISICAL_DEFAULT_ENV || "dev" }}'),
          },
          {
            id: 'requestedPath',
            name: 'requestedPath',
            type: 'string',
            value: expr('{{ $("Infisical Request").item.json.body.secretPath || $env.INFISICAL_DEFAULT_PATH || "/" }}'),
          },
          {
            id: 'includeValue',
            name: 'includeValue',
            type: 'boolean',
            value: expr('{{ $("Infisical Request").item.json.body.includeValue === true || $("Infisical Request").item.json.body.includeValue === "true" }}'),
          },
          {
            id: 'matchedEntry',
            name: 'matchedEntry',
            type: 'object',
            value: expr('{{ ($json.secrets || []).find(secret => secret.secretKey === $("Infisical Request").item.json.body.secretKey) || null }}'),
          },
          {
            id: 'found',
            name: 'found',
            type: 'boolean',
            value: expr('{{ !!(($json.secrets || []).find(secret => secret.secretKey === $("Infisical Request").item.json.body.secretKey)) }}'),
          },
        ],
      },
      options: {
        dotNotation: false,
      },
    },
  },
  output: [
    {
      requestedKey: 'OPENAI_API_KEY',
      requestedEnvironment: 'dev',
      requestedPath: '/',
      includeValue: true,
      found: true,
      secret: {
        id: 'secret-id',
        secretKey: 'OPENAI_API_KEY',
        secretValue: 'sk-example',
      },
    },
  ],
});

const shapeResponse = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Shape Response',
    position: [1440, 300],
    parameters: {
      mode: 'manual',
      includeOtherFields: false,
      assignments: {
        assignments: [
          {
            id: 'found',
            name: 'found',
            type: 'boolean',
            value: expr('{{ $json.found }}'),
          },
          {
            id: 'projectId',
            name: 'projectId',
            type: 'string',
            value: expr('{{ $env.INFISICAL_PROJECT_ID || "" }}'),
          },
          {
            id: 'environment',
            name: 'environment',
            type: 'string',
            value: expr('{{ $json.requestedEnvironment }}'),
          },
          {
            id: 'secretPath',
            name: 'secretPath',
            type: 'string',
            value: expr('{{ $json.requestedPath }}'),
          },
          {
            id: 'requestedSecretName',
            name: 'requestedSecretName',
            type: 'string',
            value: expr('{{ $json.requestedKey }}'),
          },
          {
            id: 'secretValue',
            name: 'secretValue',
            type: 'string',
            value: expr('{{ $json.includeValue && $("Select Secret").item.json.matchedEntry ? $("Select Secret").item.json.matchedEntry.secretValue : "" }}'),
          },
          {
            id: 'metadata',
            name: 'metadata',
            type: 'object',
            value: expr('{{ $("Select Secret").item.json.matchedEntry ? { id: $("Select Secret").item.json.matchedEntry.id, version: $("Select Secret").item.json.matchedEntry.version, comment: $("Select Secret").item.json.matchedEntry.secretComment || "", path: $("Select Secret").item.json.matchedEntry.secretPath || $json.requestedPath, environment: $("Select Secret").item.json.matchedEntry.environment || $json.requestedEnvironment, updatedAt: $("Select Secret").item.json.matchedEntry.updatedAt || null, metadata: $("Select Secret").item.json.matchedEntry.secretMetadata || [] } : null }}'),
          },
          {
            id: 'error',
            name: 'error',
            type: 'string',
            value: expr('{{ $json.found ? "" : "Secret not found in the configured Infisical project/environment/path" }}'),
          },
        ],
      },
      options: {
        dotNotation: false,
      },
    },
  },
  output: [
    {
      found: true,
      projectId: 'project-id',
      environment: 'dev',
      secretPath: '/',
      secretKey: 'OPENAI_API_KEY',
      secretValue: 'sk-example',
      metadata: {
        id: 'secret-id',
        version: 1,
        comment: 'Main OpenAI key',
      },
      error: '',
    },
  ],
});

const webhookResponse = node({
  type: 'n8n-nodes-base.respondToWebhook',
  version: 1.5,
  config: {
    name: 'Webhook Response',
    position: [1740, 300],
    parameters: {
      respondWith: 'firstIncomingItem',
      options: {
        responseCode: expr('{{ $json.found ? 200 : 404 }}'),
      },
    },
  },
  output: [
    {
      found: true,
      secretKey: 'OPENAI_API_KEY',
    },
  ],
});

export default workflow('infisical-secret-gateway', 'Infisical Secret Gateway')
  .add(requestWebhook)
  .to(loginToInfisical)
  .to(listSecrets)
  .to(selectSecret)
  .to(shapeResponse)
  .to(webhookResponse);
