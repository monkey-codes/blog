---
title: "Sequential AJAX and jQuery's promise"
description: ""
pubDate: 2016-01-20
updatedDate: 2018-05-15
#heroImage: "/content/images/2016/01/promise_post_header.jpg"
tags: ["AJAX","jQuery","Javascript"]
---

As the name suggests, **A**synchronous **J**avascript **A**nd **X**ML, AJAX is asynchronous. Usually you don't care when a call completes as long as the callback is invoked upon completion. This style of AJAX is common and a plethora of examples exist on the internet. **But what if you need to ensure that a set of calls are sequential?** I was recently faced with this problem as a result of a fragile API server that would not react well under the load of concurrent connections.

## Promise Basics

In essence, promises hand back the fundamental language constructs of `return` and `throw` that were lost when asynchronous callbacks were introduced. Furthermore it gets you away from the awful nested pyramid of doom structure that you so often see with ajax callbacks. For example, lets say you need to make 3 sequential API calls, each depending on the output of the previous call.

```javascript
 $.getJSON('http://server/call1', function(data1){
    $.getJSON('http://server/call2', data1, function(data2) {
       $.getJSON('http://server/call3', data2, function(data3){
         ...
       });
    });
});

```

Now consider the promise powered version

```javascript
$.getJSON('http://server/call1').then( function(data1) {
   return $.getJSON('http://server/call2', data1);
}).then(function(data2) {
   return $.getJSON('http://server/call3', data2);
}).then(function(data3){
   ...
}).fail(console.log.bind(console));

```

It is easy to see which version will become unwieldy very quickly. What is more, promises provide a convenient way to handle errors in the chain like the 2nd code snippet shows.

Unfortunately the _Promise API_ is not a straightforward concept to grasp and it is easy to fall into [one of these traps.](http://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html) The trick to understanding Promises, as [this blog post](http://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html) so succinctly states, is this:

1.  A jQuery _Promise_ interface has 2 important methods `then` and `fail`. ([Others exist](http://api.jquery.com/category/deferred-object/) but we will only focus on these.)
2.  You can do **3** things from inside a `then` callback:

*   **return** another _Promise_
*   **return** a synchronous value (or `undefined`)
*   **throw** an error.

```javascript
 $.when().then(function(){
  /*
    return anotherPromise();
    or
    //the answer to life the universe and everything
    return 42; 
    or
    throw new Error('toys out of the cot');
  */
}).then(function(data){
  ...
}).fail(console.log.bind(console));

```

In this example it does not matter whether the function returned a _Promise_ or a _value_, the second function will always be passed the resolved value. In other words, whatever `anotherPromise()` resolved to at some point in the future or _42_ if just a synchronous value was returned. Note that `$.when()` will return a [resolved Promise.](https://api.jquery.com/jquery.when/)

## DO NOT FORGET TO RETURN!

```javascript
 $.when().then(function(){
  anotherPromise();
}).then(function(data){
   ...
});

```

In this example the second function will not wait for `anotherPromise` to resolve! instead `data` will be `undefined`, because nothing was returned from the first function passed into `then`. Javascript functions that do not explicitly return actually return `undefined`.

## This Code Monkey's attempt

Below is a somewhat more involved example. Thanks to the team at [JSONPlaceholder](https://jsonplaceholder.typicode.com/) for providing a free public JSON API to test against. The model I will be using for this API consists of three parts: _users_, _albums_, and _photos_. A user has many albums and each album in turn has many photos.

![Class diagram](https://res.cloudinary.com/monkey-codes/image/upload/v1526374060/6b841a95_p2p4hz.png)

The requirement is that we load each model sequentially for a fixed list of users. First we load the user, then all the albums for that user and finally load the photos for each album before we move onto the next user. ( The example only loads users _1, 2 and 3_ and for the sake brevity also _slices_ the album array to the first 3 elements. )

See the Pen [Sequential AJAX using jQuery Promise Factories](http://codepen.io/monkey-codes/pen/adJPgR/) by Monkey Codes ([@monkey-codes](http://codepen.io/monkey-codes)) on [CodePen](http://codepen.io).

The code can be made more compact by inlining the named functions, but I think its more readable this way.

> “ Any fool can write code that a computer can understand. Good programmers write code that humans can understand. ”— Martin Fowler

The heart of the example shows the flat structure of a promise driven solution.

```javascript
  [1, 2, 3].reduce(function(pp, id) {
    return pp.then(loadUser(id))
      .done(log(templates.user))
      .then(loadAlbums())
      .done(log(templates.album))
      .then(loadPhotos())
      .done(log(templates.done));
  }, $.when());

```

First `loadUser(id)` then `loadAlbums()` then `loadPhotos()`. Note that the `done()` [method](https://api.jquery.com/deferred.done/) is simply notified when the promise resolves but does not have to return anything from the callback as in the case of the `then` callback.

The other interesting part of this extract is the use of `reduce` [method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) which is a functional programming concept. The array is reduced to a single value by applying the passed in function to every element. Each time the function is invoked the first argument is the result of the previous invocation of the function, or the initial value for the 1st invocation ( `$.when()` ) if provided. In this example we are simply returning the chained promises for 1 user in the reduce callback function, which is passed into the second invocation of callback function where we chain the promises for the 2nd user at the end of the 1'st user's promise chain and this is repeated for all the users `[1, 2, 3]`.

The same technique is used to `reduce` the _albums_ array linked to a user into a single _promise chain_ to load the _photos_ for each album sequentially

```javascript
  function loadPhotos() {
    return function(user) {
      return user.albums.reduce(function(previousAlbum, album) {
        return previousAlbum.then(function() {
            return $.getJSON(root + '/photos', {
              albumId: album.id
            });
          })
          .then(slice(0, 3))
          .then(accumulate(album, 'photos'))
          .then(log(templates.photo))
          .then(function() {
            return user;
          });
      }, $.when());
    }
  }

```

## Conclusion

Although it is easy to make a mistake using the _Promise API_, for instance, forgetting the return statement which will result in an arduous debugging exercise, the benefits are obvious when you master it. By applying the simple rule outlined in this post you should go a long way without running into any of those subtle problems.

## References

[We have a problem with promises](http://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)
