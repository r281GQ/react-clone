import React, { Component, render } from "./React";

const Todos = props => (
  <div>
    {props.todos.map(todo => (
      <div
        key={todo.id}
        style={{ display: "flex", justifyContent: "space-around" }}
      >
        <div
          style={{ textDecoration: todo.completed ? "line-through" : "none" }}
        >
          {todo.name}
        </div>
        <button onClick={() => props.toggle(todo)}>
          {todo.completed ? `Mark it undone` : `Mark it complete`}
        </button>
      </div>
    ))}
  </div>
);

class CreateTodo extends Component {
  constructor(props) {
    super(props);

    this.state = { input: "" };
  }

  render() {
    return (
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexDirection: "column"
          }}
        >
          <input
            value={this.state.input}
            onChange={e => this.setState({ input: e.target.value })}
          />
          <button
            onClick={() => {
              this.props.onTodoCreation({
                name: this.state.input,
                completed: false,
                id: Math.round(Math.random() * 10000, 2)
              });
            }}
          >
            Create todo
          </button>
        </div>
      </div>
    );
  }
}

class Todo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      todos: [
        {
          completed: false,
          id: 1,
          name: "Where did I go wrong?"
        },
        {
          completed: false,
          id: 2,
          name: "Make coffee!"
        },
        {
          completed: false,
          id: 3,
          name: "Clean the house"
        }
      ]
    };

    this.handleTodoAppend = this.handleTodoAppend.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  handleToggle(todo) {
    const copy = [...this.state.todos];

    const index = copy.findIndex(t => t.id === todo.id);

    copy[index] = { ...copy[index], completed: !copy[index].completed };

    this.setState({ todos: copy });
  }

  handleTodoAppend(todo) {
    this.setState({ todos: [...this.state.todos, todo] });
  }

  render() {
    return (
      <div>
        <Todos todos={this.state.todos} toggle={this.handleToggle} />
        <CreateTodo onTodoCreation={this.handleTodoAppend} />
      </div>
    );
  }
}

const root = document.getElementById("root");

render(<Todo />, root);
