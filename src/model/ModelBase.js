import crypto from "crypto";
export class ModelBase {
  id;
  constructor() {
    this.id = crypto.randomUUID();
  }
}
