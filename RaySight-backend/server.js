const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { SQLiteMemoryRepository } = require('./services/sqliteMemoryRepository');
const { AIPipelineService } = require('./services/aiPipelineService');
const { SQLiteMLJobRepository } = require('./services/sqliteMLJobRepository');
const { H2OLocalRuntime } = require('./services/h2oLocalRuntime');
const { MLJobService } = require('./services/mlJobService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001; // Backend port
const dbPath = path.resolve(__dirname, process.env.DB_PATH || './data/memory.sqlite');
const memoryRepository = new SQLiteMemoryRepository(dbPath);
const aiPipelineService = new AIPipelineService({ memoryRepository });
const mlJobDbPath = path.resolve(__dirname, process.env.ML_JOB_DB_PATH || './data/ml-jobs.sqlite');
const mlJobRepository = new SQLiteMLJobRepository(mlJobDbPath);
const h2oRuntime = new H2OLocalRuntime();
const mlJobService = new MLJobService({
  repository: mlJobRepository,
  runtime: h2oRuntime,
  memoryRepository,
});
const sessionSecret = process.env.SESSION_SECRET
  || (process.env.NODE_ENV === 'production' ? null : 'vad-local-development-session-secret');

if (!sessionSecret) {
  throw new Error('SESSION_SECRET is required when NODE_ENV=production.');
}

const trustProxyEnv = process.env.TRUST_PROXY;
let trustProxy = false;

if (trustProxyEnv === 'true') {
  trustProxy = true;
} else if (trustProxyEnv && /^\d+$/.test(trustProxyEnv)) {
  trustProxy = Number(trustProxyEnv);
} else if (trustProxyEnv && trustProxyEnv !== 'false') {
  trustProxy = trustProxyEnv;
}

app.set('trust proxy', trustProxy);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === corsOrigin) {
      callback(null, true);
      return;
    }
    callback(Object.assign(new Error('Not allowed by CORS'), { status: 403 }));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
  credentials: true,
}));
app.use(express.json()); // Middleware to parse JSON bodies

app.use(session({
  store: new SQLiteStore({
    dir: path.dirname(dbPath),
    db: 'sessions.sqlite',
  }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  }
}));

const aiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many AI requests. Try again shortly.',
  },
});

const evaluateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.EVALUATE_RATE_LIMIT_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many evaluation requests. Try again shortly.',
  },
});

// --- Serve Static React App ---
// Define the path to the React app's build directory
// This assumes the backend is started from its own directory,
// and 'RaySight-frontend' is a sibling directory.
const frontendBuildPath = path.join(__dirname, '..', 'RaySight-frontend', 'dist');
// For Vite, the build output is 'dist'.

// Serve static files from the React app build directory
app.use(express.static(frontendBuildPath));

// --- API Endpoints ---
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.post('/api/ai/explain-pipeline', aiLimiter, asyncHandler(async (req, res) => {
  const data = await aiPipelineService.explainPipeline(req.body, {
    sessionId: getSessionId(req),
    authorization: req.get('Authorization'),
  });

  res.json({
    status: 'success',
    data,
  });
}));

app.post('/api/ai/explain', aiLimiter, asyncHandler(async (req, res) => {
  if (Array.isArray(req.body?.nodes)) {
    const data = await aiPipelineService.explainPipeline(req.body, {
      sessionId: getSessionId(req),
      authorization: req.get('Authorization'),
    });
    res.json({ status: 'success', data });
    return;
  }

  res.json({
    status: 'success',
    data: {
      explanation: 'AI explanation endpoint is ready.',
      stepIndex: req.body?.stepIndex ?? null,
      latency_ms: 0,
    },
  });
}));

app.post('/api/ai/evaluate-pipeline', evaluateLimiter, asyncHandler(async (req, res) => {
  const data = await aiPipelineService.evaluatePipeline(req.body, {
    sessionId: getSessionId(req),
    authorization: req.get('Authorization'),
  });

  res.json({
    status: 'success',
    data,
  });
}));

app.post('/api/memory/feedback', asyncHandler(async (req, res) => {
  const data = memoryRepository.addFeedback({
    ...req.body,
    sessionId: getSessionId(req) || req.body?.sessionId,
  });

  res.status(201).json({
    status: 'success',
    data,
  });
}));

app.post('/api/ml/jobs', evaluateLimiter, asyncHandler(async (req, res) => {
  const data = await mlJobService.createJob(req.body, {
    sessionId: getSessionId(req),
    authorization: req.get('Authorization'),
  });

  res.status(201).json({
    status: 'success',
    data,
  });
}));

app.get('/api/ml/jobs/:id', asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    data: mlJobService.getJob(req.params.id),
  });
}));

app.post('/api/ml/jobs/:id/cancel', asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    data: mlJobService.cancelJob(req.params.id),
  });
}));

app.get('/api/ml/jobs/:id/artifacts', asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    data: mlJobService.getArtifacts(req.params.id),
  });
}));

// --- Catch-all for Frontend Routing ---
// For any other GET request, serve the React app's index.html
// This allows client-side routing to work.
// The original instructions had a check for index.html existence, 
// I'm using a slightly modified version from the prompt.
app.get(/.*/, (req, res) => {
  const indexPath = path.join(frontendBuildPath, 'index.html');
  // Check if index.html exists. If not, it might mean the frontend hasn't been built.
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(
      'Frontend not found. Please build the VAD frontend by running: ' +
      '<code>cd ../RaySight-frontend && npm run build</code>'
    );
  }
});

app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    error: err.code || (statusCode === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR'),
    message: isProd ? 'Internal server error' : err.message,
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

function getSessionId(req) {
  return req.session ? req.session.id : 'anonymous';
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

module.exports = {
  app,
  aiPipelineService,
  memoryRepository,
  mlJobService,
};
