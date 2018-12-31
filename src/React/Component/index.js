import { scheduleUpdate } from "./../Reconciliation";

export class Component {
  constructor(props) {
    this.props = props || {};
    this.state = this.state || {};
  }

  shouldComponentUpdate() {
    return true;
  }

  setState(partialState) {
    scheduleUpdate(this, partialState);
  }
}

Component.getDerivedStateFromProps = () => {};
