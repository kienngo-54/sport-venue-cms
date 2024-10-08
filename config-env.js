/* eslint-disable class-methods-use-this */
const dotenv = require("dotenv-defaults");
const fs = require("fs");
const { DefinePlugin } = require("webpack");

class Dotenv {
  constructor(config = {}) {
    this.config = {
      path: "./.env",
      ...config,
    };

    const env = this.getEnvs();

    this.writeFile(env);

    return new DefinePlugin(this.formatData(env));
  }

  getEnvs() {
    const { path } = this.config;

    return dotenv.parse(this.loadFile(path), this.getDefaults());
  }

  getDefaults() {
    const { defaults } = this.config;

    if (defaults) {
      return this.loadFile(defaults === true ? "./.env.defaults" : defaults);
    }

    return "";
  }

  formatData(vars = {}) {
    const formatted = {};

    Object.keys(vars).forEach((key) => {
      formatted[`process.env.${key}`] = `window._env_.${key}`;
    });

    // supporting webpack 5
    formatted["process.env"] = "{}";

    return formatted;
  }

  loadFile(file) {
    try {
      return fs.readFileSync(file, "utf8");
    } catch (err) {
      this.warn(`Failed to load ${file}.`);
      return {};
    }
  }

  writeFile(env) {
    const data = `window._env_ = ${JSON.stringify(env)}`;

    try {
      fs.writeFileSync("public/env-config.js", data);
    } catch (error) {
      console.log("Error writing file: ", error);
    }
  }

  warn(msg) {
    console.warn(msg);
  }
}

module.exports = Dotenv;
