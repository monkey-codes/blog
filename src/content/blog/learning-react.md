---
title: "Learning React"
description: "Notes from learning React, Redux and the surrounding JavaScript ecosystem including ES6, middleware, routing and authentication."
pubDate: 2016-11-17
tags: ["Javascript", "development"]
---

I spent some time diving into the React ecosystem and wanted to capture the key concepts while they're fresh. React on its own is relatively straightforward, but the surrounding tooling — Redux, middleware, routing, authentication — turns it into a proper learning expedition. These are my notes from that journey.

## ES6 Essentials for React

Before writing any React code, it's worth getting comfortable with a handful of ES6 features that show up everywhere. React leans heavily on modern JavaScript, and understanding these patterns removes a lot of friction.

The `const` keyword works like `final` in Java — it signals that a variable won't be reassigned. ES6 modules keep everything in silos by default, so nothing is available unless explicitly imported. The import syntax comes in two flavours:

```javascript
import React from 'react';                     // default export
import SearchBar from './components/search_bar'; // relative path
```

*Destructuring* is particularly useful. You can pull named exports directly out of a module with `import React, { Component } from 'react';`. The same pattern works with objects and function arguments:

```javascript
const { lon, lat } = cityData.city.coord;
```

Arrow functions clean up callback-heavy code. A single argument can omit parentheses, and the implicit return keeps things concise. Object shorthand notation lets you write `{ videos }` instead of `{ videos: videos }`. String interpolation uses backticks and `${var}` instead of concatenation.

A few more patterns worth knowing: default parameter values like `function(state = null, action)`, the spread operator for combining arrays `[1, ...[2, 3, 4]]`, and computed property keys `{ ...state, [newPost.id]: newPost }` for dynamic object construction.

## React Fundamentals

### Components

React has two types of components. *Functional components* are plain functions that receive props and return JSX. *Class components* extend `Component` and have access to state and lifecycle methods. Wherever JSX appears, `import React from 'react'` is required — even if you don't reference `React` directly.

An important distinction: `ReactDOM.render` takes a component _instance_, not the class itself. Writing `<App />` creates the instance.

### State and Props

State is a plain JavaScript object that lives inside a class component. It should only be assigned directly in the constructor — everywhere else you use `setState`, which triggers a re-render. The general pattern is that the most parent component fetches data, and that data flows down to children through props.

*Controlled components* tie an input's value to a state property, making React the single source of truth for form data. For lists, each item needs a unique `key` prop so React can efficiently track changes.

A practical example — a search bar component with local state:

```javascript
class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = { term: '' };
  }

  render() {
    return (
      <input
        value={this.state.term}
        onChange={event => this.setState({ term: event.target.value })}
      />
    );
  }
}
```

### Context

React provides a *context* mechanism for implicitly passing data from parent to child without threading props through every level. It exists, but the official guidance is clear: don't abuse it. Explicit prop passing is almost always the better choice.

## Redux

Redux introduces a different mental model for managing state. Instead of scattering state across components, you keep it in a single plain JavaScript object — the *store*.

### Reducers

*Reducers* are pure functions that return a piece of application state. Each reducer receives the current state and an action, then returns the new state. Two critical rules: never return `undefined` (use default parameter values), and always return a fresh object rather than mutating the existing state.

### Actions and Action Creators

*Actions* are plain objects that describe what happened. *Action creators* are functions that produce these objects. When an action is dispatched, it's automatically sent to every reducer — each one decides whether it cares about that particular action type.

### Containers

*Containers* (also called *smart components*) are React components with a direct connection to the Redux store. The `connect` function from `react-redux` wires them up. The `mapStateToProps` function defines which pieces of Redux state the component needs:

```javascript
function mapStateToProps(state) {
  return { posts: state.posts };
}

export default connect(mapStateToProps)(PostsIndex);
```

It's worth noting that there's no inherent connection between React component state and Redux state. Redux state gets mapped to component props, not state.

## Middleware

Redux middleware sits between the moment an action is dispatched and the moment it reaches the reducers. It can inspect, modify, log, or even stop actions entirely.

### Redux Promise

The `redux-promise` middleware intercepts actions where the payload is a Promise. It holds the action back, waits for the Promise to resolve, and then dispatches a new action with the resolved value as the payload. For HTTP requests, `axios` is the typical choice over jQuery — it's focused, lightweight, and returns Promises.

### Redux Form

`redux-form` takes form state and stores it directly on the application state tree. This means form validation, submission status, and field values all live in the Redux store alongside your domain data.

### Thunk

`redux-thunk` gives action creators direct access to the `dispatch` method. Instead of returning a plain action object, an action creator can return a function. This is essential for asynchronous workflows:

```javascript
export function fetchPosts() {
  return (dispatch) => {
    axios.get('/api/posts').then(response => {
      dispatch({ type: FETCH_POSTS, payload: response.data });
    });
  };
}
```

## React Router

React Router handles navigation in single-page applications. For programmatic navigation (redirecting after a form submission, for example), there are two approaches: accessing the router through `contextTypes` and calling `this.context.router.push('/path')`, or importing `browserHistory` directly and calling `browserHistory.push('/path')`.

## Higher-Order Components

A *higher-order component* (HOC) is a function that takes an existing component and returns a new, enhanced version of it. The `connect` function from `react-redux` and the `Provider` component are both examples of this pattern. The general boilerplate looks like:

```javascript
function requireAuth(ComposedComponent) {
  class Authentication extends Component {
    // enhancement logic here
    render() {
      return <ComposedComponent {...this.props} />;
    }
  }
  return Authentication;
}
```

This pattern is useful for cross-cutting concerns like authentication checks or data fetching that multiple components need.

## Testing

The testing stack mirrors what you'd find in other ecosystems. *Mocha* serves as the test runner (similar to JUnit), while *Chai* handles assertions (comparable to Mockito's role, though focused on assertions rather than mocking). The `chai-jquery` extension adds DOM-specific matchers, and `jsdom` provides a DOM implementation that runs in Node without a browser. Simulating user interactions — clicks, input changes — is done through a `simulate` helper.

## Authentication

### Cookies vs Tokens

There are two main approaches to authentication in web applications. *Cookie-based* authentication ties sessions to a specific domain and cookies are included automatically with every request. *Token-based* authentication works across any domain but requires manually attaching the token to requests. Tokens offer more flexibility, especially when your API serves multiple clients.

### The Node Stack

A typical authentication backend uses Express as the server framework, with Morgan for logging and `body-parser` for parsing request bodies. Mongoose handles MongoDB interactions, and `bcrypt` takes care of password hashing. Passport provides the authentication framework, with strategies for both JWT (token-based) and Local (username/password) authentication.

One thing to keep in mind: CORS protection is a browser-level concern. The browser enforces same-origin policy, which is why token-based authentication is particularly useful when your frontend and API live on different domains.

## Wrapping Up

The React ecosystem has a lot of moving parts, and it's easy to feel overwhelmed by the sheer number of libraries involved. The core concepts — components, unidirectional data flow, reducers as pure functions — are solid once they click. The middleware layer and authentication patterns take more time to internalize, but they follow logical patterns once you've seen them in action. I found that building small projects with each new concept, rather than trying to absorb everything at once, made the learning curve much more manageable.
