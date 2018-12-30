import React, { Component, render } from "./React";

class Great extends Component {
  render() {
    return <div>Great</div>;
  }
}

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      color: "green"
    };
  }

  render() {
    return (
      <div style={{ backgroundColor: this.state.color }}>
        {this.props.text}
        <button
          onClick={() =>
            this.setState({
              color: this.state.color === "green" ? "purple" : "green"
            })
          }
        >
          Change color!
        </button>
        {this.state.color === "green" ? <Great /> : null}
      </div>
    );
  }
}

const App = (
  <div
    style={{ backgroundColor: "red" }}
    onClick={() => console.log("From the JSX!")}
  >
    <div style={{ textDecoration: "line-through" }}>Text1</div>
    <div>Text2</div>
    <div style={{ textDecoration: "line-through" }}>Text3</div>
    <div>Text4</div>
    <Main text="From a class Component! Hey Ho!" />
  </div>
);

const root = document.getElementById("root");

render(App, root);
