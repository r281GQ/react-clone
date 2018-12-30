import React, { render } from "./React";

const App = (
  <div
    style={{ backgroundColor: "red" }}
    onClick={() => console.log("From the JSX!")}
  >
    <div style={{ textDecoration: "line-through" }}>Text1</div>
    <div>Text2</div>
    <div style={{ textDecoration: "line-through" }}>Text3</div>
    <div>Text4</div>
  </div>
);

const root = document.getElementById("root");

render(App, root);

const updateTypeMismatch = document.createElement("button");
const updateSameType = document.createElement("button");
const deletion = document.createElement("button");

updateTypeMismatch.innerHTML = "Update with type mismatch!";
updateSameType.innerHTML = "Update with same type!";
deletion.innerHTML = "Delete something!";

const updateTypeMismatchFunction = () =>
  render(
    <section
      style={{ backgroundColor: "blue", color: "white" }}
      onClick={() => console.log("From new!")}
    >
      <section>Text11</section>
      <section style={{ textDecoration: "line-through" }}>Text22</section>
      <section>Text33</section>
      <section style={{ textDecoration: "line-through" }}>Text44</section>
    </section>,
    root
  );

const updateSameTypeFunction = () =>
  render(
    <div
      style={{ backgroundColor: "blue", color: "white" }}
      onClick={() => console.log("From new!")}
    >
      <div>Text11</div>
      <div style={{ textDecoration: "line-through" }}>Text22</div>
      <div>Text33</div>
      <div style={{ textDecoration: "line-through" }}>Text44</div>
    </div>,
    root
  );

const deletionFunction = () =>
  render(
    <div
      style={{ backgroundColor: "blue", color: "white" }}
      onClick={() => console.log("From new!")}
    >
      <div>Text11</div>
      <div style={{ textDecoration: "line-through" }}>Text44</div>
    </div>,
    root
  );

updateTypeMismatch.addEventListener("click", updateTypeMismatchFunction);
updateSameType.addEventListener("click", updateSameTypeFunction);
deletion.addEventListener("click", deletionFunction);

root.appendChild(updateTypeMismatch);
root.appendChild(updateSameType);
root.appendChild(deletion);
