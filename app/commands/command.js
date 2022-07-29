export class Command {
  constructor(id, payload) {
    this.id = id;
    this.payload = payload;
  }

  matches() {
    throw new Error("matches() must be implemented");
  }

  enabled(config) {
    return {
      enabled: false,
    };
  }

  run(authToken) {
    throw new Error("run(authToken) must be implemented");
  }
}
