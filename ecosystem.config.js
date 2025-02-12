// ecosystem.config.js
module.exports = {
  apps: [{
      name: "app",
      script: "./dist/app.js",
      env: {
        NODE_ENV: "local"
      },
      env_development: {
        NODE_ENV: "development",
      },
      env_pre: {
        NODE_ENV: "pre",
      },
      env_production: {
        NODE_ENV: "production",
      },
  }]
}