import React, { createRef, useEffect, useState, Component } from "./React";
import { render } from "./ReactDOM";

import { createStore, combineReducers } from "./Redux";

class TodoElement extends Component {
  constructor(props) {
    super(props);

    this.state = { value: 0 };
  }

  render() {
    return (
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {this.state.value}
        <div
          style={{
            textDecoration: this.props.todo.completed ? "line-through" : "none"
          }}
        >
          {this.props.todo.name}
        </div>
        <button onClick={() => this.props.toggle(this.props.todo)}>
          {this.props.todo.completed ? `Mark it undone` : `Mark it complete`}
        </button>

        <button onClick={() => this.setState({ value: this.state.value + 1 })}>
          {`Change internal state!`}
        </button>
      </div>
    );
  }
}

class Todos extends Component {
  render() {
    return (
      <div>
        {this.props.todos.map(todo => (
          <TodoElement key={todo.id} todo={todo} toggle={this.props.toggle} />
        ))}
      </div>
    );
  }
}

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
            onInput={e => this.setState({ input: e.target.value })}
          />
          <button
            onClick={() => {
              if (this.state.input !== "") {
                this.props.onTodoCreation({
                  name: this.state.input,
                  completed: false,
                  id: Math.round(Math.random() * 10000, 2)
                });

                this.setState({ input: "" });
              }
            }}
          >
            {`Create todo`}
          </button>
        </div>
      </div>
    );
  }
}

const Counter = () => {
  const [value, setValue] = useState(0);

  const [greeting, setGreeting] = useState("Hey!");

  useEffect(
    () => {
      console.log("From effect! " + value);

      return () => console.log("Clean up! " + value);
    },
    [greeting]
  );

  return (
    <div>
      <button
        onClick={() => {
          setValue(value + 1);
        }}
      >
        Increment
      </button>
      <div>{value}</div>
      <button onClick={() => setGreeting("Morning!")}>Set greeting!</button>
      <div>{greeting}</div>
    </div>
  );
};

class Todo extends Component {
  constructor(props) {
    super(props);

    this.ref = createRef();

    this.state = {
      keyToPass: 1,
      ref: undefined,
      visible: true,
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
    this.removeFixedElementTodo = this.removeFixedElementTodo.bind(this);
  }

  handleToggle(todo) {
    const copy = [...this.state.todos];

    const index = copy.findIndex(t => t.id === todo.id);

    copy[index] = { ...copy[index], completed: !copy[index].completed };

    this.setState({ todos: copy });
  }

  removeFixedElementTodo() {
    const copy = [...this.state.todos];

    copy.splice(copy.length - 3, 1);

    this.setState({ todos: copy });
  }

  handleTodoAppend(todo) {
    this.setState({ todos: [...this.state.todos, todo] });
  }

  static getDerivedStateFromProps(props, state) {
    if (props.nullify) {
      return { todos: [] };
    }

    return { ...state };
  }

  render() {
    return (
      <div ref={this.ref}>
        {this.state.visible && <div>Meaningless component!</div>}
        <Counter key={this.state.keyToPass} />
        <Todos todos={this.state.todos} toggle={this.handleToggle} />
        <CreateTodo onTodoCreation={this.handleTodoAppend} />
        <button onClick={() => this.setState({ visible: false, keyToPass: 2 })}>
          Unmount
        </button>
        <button onClick={this.removeFixedElementTodo}>remove</button>
      </div>
    );
  }
}

const root = document.getElementById("root");

// render(<Todo nullify={false} />, root);

const ADD_TODO = "add_todo";
const INC = "inc";

const initialState = {
  todos: [],
  counter: 0
};

const todoReducer = (state, action) => {
  switch (action.type) {
    case ADD_TODO:
      return state.concat([action.payload]);
    default:
      return state;
  }
};

const counterReducer = (state, action) => {
  switch (action.type) {
    case INC:
      return state + 1;
    default:
      return state;
  }
};

const reducer = combineReducers({
  todos: todoReducer,
  counter: counterReducer
});

const store = createStore(reducer, initialState);

store.subscribe(() => console.log(store.getState()));

store.dispatch({
  type: ADD_TODO,
  payload: {
    completed: false,
    id: 2,
    name: "Make coffee!"
  }
});

store.dispatch({
  type: INC
});

store.dispatch({
  type: ADD_TODO,
  payload: {
    completed: false,
    id: 1,
    name: "Where did I go wrong?"
  }
});
