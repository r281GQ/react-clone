import React, { Component, render } from "./React";

class Main extends Component {
  render() {
    return (
      <section style={{ backgroundColor: this.props.color }}>
        {this.props.text}
      </section>
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
    <Main text="From a class Component! Hey Ho!" color="purple" />
  </div>
);

const root = document.getElementById("root");

render(App, root);
