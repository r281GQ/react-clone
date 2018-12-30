import { scheduleUpdate } from "./../Reconciliation";

export class Component {
  constructor(props) {
    this.props = props || {};
  }

  setState(partialState) {
    scheduleUpdate(this, partialState);
  }
}
