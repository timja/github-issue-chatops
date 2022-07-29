export class Command {
  constructor(id, payload) {
    this.id = id;
    this.payload = payload;
  }

  matches() {
    throw new Error("matches() must be implemented");
  }

  // eslint-disable-next-line no-unused-vars
  enabled(config) {
    return {
      enabled: false,
    };
  }

  // eslint-disable-next-line no-unused-vars
  run(authToken) {
    throw new Error("run(authToken) must be implemented");
  }
}
