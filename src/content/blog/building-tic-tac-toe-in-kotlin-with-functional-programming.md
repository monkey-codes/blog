---
title: "Building Tic Tac Toe in Kotlin with Functional Programming"
description: "Explore the basics of functional programming in Kotlin as we dive into building a Tic Tac Toe game. Discover the power of pure functions, immutable state, and learn how to separate side effects from the functional core using an IO monad."
pubDate: 2023-06-12
heroImage: "/content/images/2023/06/tic_tac_toe_header.jpg"
tags: ["development"]
---

By following this blog post, developers will gain a solid understanding of functional programming principles in Kotlin and learn how to apply them effectively to build a Tic Tac Toe game.

The accompanying source code can be found on [GitHub](https://github.com/monkey-codes/fp-kotlin-tictactoe).

## Introduction

Kotlin is not a purely functional programming (FP) language, but offers plenty of features to support it. Immutable collections, data classes, higher order functions and pattern matching to name but a few.

Why use functional programming in the first place? It leads to increased code modularity through _pure functions_, which in turn, leads to better testability, reuse, parallelization and generalization.

## Functional Programming Fundamentals

### 1\. Pure Functions

A _pure function_ can be defined as a function that has no observable _side effects_. A function is said to have a _side effect_ if it does anything other that computing and returning a result.

### 2\. Referential Transparency

A function is said to be _referentially transparent_ if everything it does is represented by what it returns. _Substitution_ can be used to determine if a function is _referentially transparent_. Consider the following:

The `sum` function is _referentially transparent_ because its result can be replaced with the function call itself & vica versa without changing the program. On the other hand consider a function that is not referentially transparent:

### 3\. Immutable Data

_Immutable data_ means that once a value is assigned to a variable, it cannot be modified. Functional programming encourages creating new data structures with modifications instead of modifying existing data. _Immutable data_ aligns with the principles of _pure functions_. Benefits of _immutable data_ include but are not limited to:

*   Enhanced concurrency because the data cannot be modified, making it easy to share among multiple threads.
*   Simplified debugging. The focus can be on understanding the flow of data without worrying about state changes.
*   Predictable behaviour. Makes it easier to reason about code behaviour because it eliminates the possibility of unexpected modification to the data.

## Designing the Game State

![Game state class diagram](https://res.cloudinary.com/monkey-codes/image/upload/v1686552196/tic-tac-toe/tic_tac_toe_class.svg)

The game state can be represented by a 2 dimensional immutable list containing game symbols. A symbol is an enum of either `CROSS`, `NOUGHT` or a `BLANK`.

The `sealed Game` class plus the 3 data constructors `Won`, `Draw` and `InProgress` captures the states that a Game can be in. Note that kotlin's pattern matching can be used with a sealed class hierarchy. All the class members are immutable.

## Implementing Pure Functions

The heart of the game is the `InProgress.make(move)` _pure function_. It creates a copy of the board state with the move applied. The new state is then passed to a _smart constructor_ that determines the state of the game (Won, Draw or InProgress).

Note the return type of the function `Either<GameError, Game>`. Throwing exceptions in functional programming is typically avoided because it breaks _referential transaprency._ Consider the following:

Reasoning about a _referentially transparent_ function is local and does not require a broader context, the same does not hold for a non referentially transparent function (e.g is the expression in a try catch block).

The `Either` type and `either` DSL is provided by the [arrow-kt](https://arrow-kt.io/) library. The sealed `Either` type can either be a `Left` value representing an error that occurred or `Right` if it succeeded. The `either` together with `raise` simplifies using the `Either` type. [More information about the types can be found on the arrow-kt website](https://arrow-kt.io/learn/typed-errors/).

Once the new board state has been created, it is passed to a _smart constructor_ that determines the state of the `Game`.

## Managing Side Effects with the IO Monad

A _side effect_ is an interaction a program has with the external world, like making a network request or reading/writing to a file. While _side effects_ are unavoidable in most real world applications, functional programming seeks to minimize its impact on a functional program. This is achieved by separating _side effects_ from the functional core.

It is always possible to refactor an impure function into 3 parts:

1.  A pure core function
2.  A side-effecting function that provides input to the pure function
3.  A side-effecting function that does something with the pure functions output.

### A detour, what is a monad?

> “The curse of the monad is that once you understand it - you lose the ability to explain it to anybody else.”— Douglas Crockford

A _monad_ is a programming concept that provides a structured way to handle and compose computations or actions. It encapsulates operations, allows sequencing, and maintains a context for computations, enabling better control over effects, error handling, and composition of complex operations.

_Monads_ typically contain 2 primitive monadic combinators, `unit` & `flatMap`. Many other useful combinators can be derived from these primitives. Let's look at a couple of examples:

From the examples above we can extract a few things. A _monad_ is a type of container and you can wrap or _lift_ any type into the _monad_ using the `unit` function. Secondly, computations can be chained on the _monad_ by calling the `flatMap` function. What is the difference between the `IdMonad` and the `OptionMonad`? In both cases we can see that a chain of `flatMap` calls is like an imperative program with statements that assign to variables, _the monad implementation defines what happens at statement boundaries (inbetween `flatMap` statements)_ The `IdMonad` simply unwraps and rewraps the value, on the other hand the `OptionMonad` may terminate early if a `None` is returned.

A more formal definition of a _monad_:

_A monad is an implementation of one of the minimal sets of monadic combinators, satisfiying the laws of associativity and identity._

The miminal sets of combinators are:

*   `unit` & `flatMap`
*   `unit` & `compose`
*   `unit`, `map` & `join`

The _associative law_ deals with ordering and guarantees the outcome will remain the same no matter how `flatMap` operations are nested.

The _identity laws_ are _left identity_ & _right identity_ each dealing with the situation where `unit` is the subject or object of a `flatMap` expression.

### IO Monad

One way functional programs achieve isolating _side effects_ is by having the pure core of the application describe a set of _side effects_ that need to occur, without actually performing the _side effects_. The `IO`monad can then be used to chain these _descriptions of side effects_ together. Outside of the functional core an `Interpreter` can be implemented to perform the described _side effects_.

A simple implementation of an `IO` monad could be:

The implementation allows us to represent the 2 _side effects_ we need for the tic tac to game, namely `stdin` and `stdout`, as an `IO` monad. However there is one problem with the implementation, note how the `flatMap` implemntation nests function calls. Every call to flatMap will add a stack frame. A large number of `flatMap` calls will cause a stack overflow.

A technique called _Trampolining_ converts recursive stack consuming operations into an iterative form. In Kotlin this makes use of `tailrec` functions. For a function to qualify for the `tailrec` optimization, the very last operation in the function has to be a recursive call to the function itself.

To implement _trampolining_ on the `IO` Monad, 3 data constructors are introduced namely `Return`, `Suspend` & `FlatMap`. `Return` represents an IO action that has finished and has a value to return. `Suspend` represents an IO action needs to be executed to produce a result, and finally a `FlatMap` allows us to chain or continue computation by using the result of the 1st computation to produce the 2nd computation.

Note that the `run` method is moved out into an `Interpreter` that ensures that the _trampolining_ technique is applied to the chain of io's.

The `run` method is marked as `tailrec` and every recursive `run` call is the last operation in the method. The 2nd implementation is superior based on how 2 consecutive `flatMap's` are combined in a way that allows the recursive call to `run` to be the last statement of the function.

## Building the User Interface

![Program flow](https://res.cloudinary.com/monkey-codes/image/upload/v1686552667/tic-tac-toe/tic_tac_toe_program_flow.svg)

The basic flow of the program is a recursive loop from an `Screen` IO monad that renders the game state to an `Input` IO monad that parses user input before passing the move to the game to compute the new game state.

The `Screen` builds on top of `stdout` by first converting the `ProgramState` to a string that is then rendered to the console by `stdout`. The `ProgramState` is a type alias for `Either<Pair<Game,GameError>,Game>`.  
Where the `Pair` on the `Left` represents the original game state plus the error generated by the last move if one occurred. On the other hand if the last move was successful, the `Right` value of the the `Either` is the new `Game` state.

`Screen` also takes care of flipping the error state (When the `Either` is of type `Left`) to a valid state after the screen output is generated via the map `{ programState.toMostRecentValidState() }`. This is done because after the error associated with the last move is displayed, the state of the game is reverted to the last valid state.

After the screen is rendered to `stdout` control is passed to the `Input` which builds on top of `stdin`. The `Input` uses kotlin's pattern matching on the sealed `Game` class to determine if the game is still in `InProgress`. Should this be the case, the user input is parsed into a `Move` and passed to the `Game` to compute the new game state. A `mapLeft` on both parsing the move, and making the move ensures that if either of those functions fail (by returning a `Left` constructor on the `Either`) the original game state is preserved (`mapLeft(errorToCurrentState)`). Once the input has been processed, the program loops by peforming recursive call on the program function with the resulting game state.

Zooming out a little bit, it is worth noting that everything in the program is purely functional, the only time side effects occur is once the program is passed to `Interpreter.run(program)`. This clearly demonstrates how side effects are separated from the functional core.

## Testing the Functional Code

Among the benefits of functional programming is simplified testing. The output of a _pure function_ depends entirely on it's input, therefore tests require no mocking, stubbing or any other common testing techniques. The project leverages the _property based testing_ capabilities of the [Kotest](https://kotest.io/) test framework. To test the functional core a set of custom move generators are used to simulate games with different outcomes. For example, to test winning condition:

The final game state is derived by making all the generated moves. Every cell is checked to ensure that it contains the correct symbol and then game state and winner is verified.

Testing side effects with the IO monad is more challenging. While the bulk of the `Screen` and `Input` classes were pure functions and could be tested directly, I chose to test these classes wrapped in their monad form. The challenge here is that you can only chain more computations onto the monad or run it via the Interpreter, there is no easy way to inject input or grab the output for verification. To make these classes more testable, I introduced a `InterpreterContext` which provides the dependencies required by the low level side effects, namely `printMessage` to write to stdout and `readLineFromInput` to read from input. With this abstraction in place it is possible to provide a `TestInterpreterContext` which writes output to memory and reads input from a predefined list. The tests can then be written by actually interpreting the _side effect descriptions_ created by these monads.

## Conclusion

This post covered some of the fundamental concepts in functional programming. We looked at _pure functions_ which have no _side effects_. _Referentially transparent functions_ whose output is entirely determined by its input and can be verified by substitution. _Immutable data_ that is modified by making a copy. Finally we looked at _Monads_ and how to separate _side effects_ from the _functional core_ with an `IO` _Monad_. The post also covered testing of a functional program using [kotest](https://kotest.io/) and _property based testing_.

The concepts discussed in the post primarily comes from [Functional programming in Kotlin by Marco Vermeulen, Rúnar Bjarnason, and Paul Chiusano](https://www.manning.com/books/functional-programming-in-kotlin) and the [arrow-kt library documentation](https://arrow-kt.io/).

To learn functional programming requires a paradigm shift, and the initial learning curve is quite steep. However I believe the benefits are worth the investment. As with anything, practicing will lead to improvement.

The source code used in this post is available on [GitHub](https://github.com/monkey-codes/fp-kotlin-tictactoe).
