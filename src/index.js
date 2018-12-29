import React, { render } from "./React";

const App = (
  <div
    style={{ backgroundColor: "red" }}
    onClick={() => console.log("From the JSX!")}
  >
    App
  </div>
);

const root = document.getElementById("root");

render(App, root);

const btn = document.createElement("button");

btn.innerHTML = "Manually rerender!";

const rerender = () =>
  render(
    <section
      style={{ backgroundColor: "blue" }}
      onClick={() => console.log("From new!")}
    >
      App in section
    </section>,
    root
  );

btn.addEventListener("click", rerender);

root.appendChild(btn);
