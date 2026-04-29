const fs = require('fs');
const { spawn, spawnSync } = require('child_process');

class H2OLocalRuntime {
  constructor(options = {}) {
    this.enabled = parseBoolean(options.enabled ?? process.env.H2O_ENABLED);
    this.jarPath = options.jarPath || process.env.H2O_JAR_PATH || '';
    this.javaPath = options.javaPath || process.env.H2O_JAVA_PATH || 'java';
    this.maxMem = options.maxMem || process.env.H2O_MAX_MEM || '1g';
    this.host = options.host || '127.0.0.1';
    this.port = Number(options.port || process.env.H2O_PORT || 54321);
    this.process = null;
  }

  probe() {
    if (!this.enabled) {
      return { ok: false, reason: 'H2O is disabled. Set H2O_ENABLED=true to use the local runtime.' };
    }
    if (!this.jarPath || !fs.existsSync(this.jarPath)) {
      return { ok: false, reason: 'H2O_JAR_PATH is missing or does not exist.' };
    }

    const version = getJavaVersion(this.javaPath);
    if (!version.ok) {
      return version;
    }
    if (version.major !== 17) {
      return { ok: false, reason: `Java 17 is required for stable H2O mode; found Java ${version.major}.`, javaVersion: version.raw };
    }

    return { ok: true, reason: 'H2O local runtime is available.', javaVersion: version.raw };
  }

  async ensureStarted() {
    const probe = this.probe();
    if (!probe.ok) {
      return probe;
    }

    if (this.process && !this.process.killed) {
      return { ok: true, reason: 'H2O local runtime is already started.', port: this.port, javaVersion: probe.javaVersion };
    }

    this.process = spawn(this.javaPath, [
      `-Xmx${this.maxMem}`,
      '-jar',
      this.jarPath,
      '-name',
      'vad_local_h2o',
      '-ip',
      this.host,
      '-port',
      String(this.port),
    ], {
      stdio: 'ignore',
      windowsHide: true,
    });

    this.process.once('exit', () => {
      this.process = null;
    });

    const health = await waitForCloud(this.host, this.port, 8000);
    if (!health.ok) {
      return { ok: false, reason: health.reason, javaVersion: probe.javaVersion };
    }

    return {
      ok: true,
      reason: 'H2O local runtime started.',
      port: this.port,
      javaVersion: probe.javaVersion,
      cluster: health.cluster,
    };
  }
}

function getJavaVersion(javaPath) {
  const result = spawnSync(javaPath || 'java', ['-version'], { encoding: 'utf8', windowsHide: true });
  const raw = `${result.stderr || ''}${result.stdout || ''}`.trim();
  if (result.error || result.status !== 0) {
    return { ok: false, reason: 'Java is not available on PATH or H2O_JAVA_PATH.' };
  }
  const match = raw.match(/version "(\d+)(?:\.(\d+))?/);
  if (!match) {
    return { ok: false, reason: 'Could not parse Java version.', raw };
  }
  return { ok: true, major: Number(match[1]), raw };
}

async function waitForCloud(host, port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://${host}:${port}/3/Cloud`);
      if (response.ok) {
        return { ok: true, cluster: await response.json().catch(() => ({})) };
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await delay(250);
  }

  return { ok: false, reason: `H2O did not become healthy before timeout: ${lastError || 'unknown error'}` };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseBoolean(value) {
  return String(value || '').toLowerCase() === 'true';
}

module.exports = {
  H2OLocalRuntime,
  __private: {
    getJavaVersion,
    parseBoolean,
  },
};
