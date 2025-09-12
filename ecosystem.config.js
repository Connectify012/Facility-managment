module.exports = {
  apps: [{
    name: "spotworks-backend",
    script: "dist/server.js",
    instances: 1,
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log",
    time: true,
    max_memory_restart: "500M",
    watch: false,
    ignore_watch: [
      "node_modules",
      "logs",
      "uploads"
    ]
  }]
};
