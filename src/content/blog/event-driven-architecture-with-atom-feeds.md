---
title: "Event Driven Architecture with Atom Feeds"
description: "How to build an event-driven architecture, including event sourcing, without the need for messaging infrastructure using Atom feeds."
pubDate: 2021-04-13
heroImage: "/content/images/2021/04/event-driven-architecture-post-header-2.jpeg"
tags: ["development","Spring"]
---

## Overview

This post will look at how to create an event-driven architecture using a cafe as an example. The system is composed out of 4 microservices: _waiter_, _kitchen_, _stockroom_, and _cashier_. Each service uses [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) with the [Axon Framework](https://axoniq.io/product-overview/axon-framework) doing most of the heavy lifting. [Atom feeds](https://en.wikipedia.org/wiki/Atom_\(Web_standard\)) facilitate integration between the services.

## Overall System Architecture

Each service hosts its Atom feed and publishes public events to it. Consumers can periodically pull events from the Atom feed and keeps track of their progress. Producers have no knowledge of which services are consuming its Atom feed.  
![](https://res.cloudinary.com/monkey-codes/image/upload/v1617767992/event-driven-architecture-cafe/event-driven-cafe-architecture.png)

## Internal Service Architecture

Services employ CQRS and commands are the primary way of interacting with the domain model. Commands are issued via the CommandGateway provided by Axon. A command can be used to create a new aggregate or target an existing aggregate.

![](https://res.cloudinary.com/monkey-codes/image/upload/v1618283606/event-driven-architecture-cafe/service-architecture.png)

### Domain Model & Event Sourcing

State changes inside of the aggregate happen by applying new events as part of handling a command. In the example below the state of the aggregate is updated when handling an event. The _id_ is set when handling the _WaiterHiredEvent_ and orders taken by the waiter are updated when handling the _OrderTakenEvent_. When a command targets an existing aggregate, Axon will hydrate the aggregate by replaying past events in order until the current state is reached.

New events are usually applied in the command handler method, but in complex aggregates, new events can also be applied in reaction to another event. In this case, Axon is smart enough to ignore those events while hydrating the aggregate. This prevents the events from repeatedly being applied when the aggregate is being hydrated.

### Aggregate Testing

Unit testing an aggregate requires no knowledge about the structure of the aggregate itself. Tests typically define the events that have happened to obtain the desired state, then issue a command and assert that the expected events were raised. This pattern means that tests are rarely affected if the structure of the underlying aggregate changes.

### Sagas

Sagas can be used to manage a process that spans multiple aggregates, usually with a time delay. In the cafe example, the _kitchen service_ contains 2 aggregates, an _OrderQueue_ and a _Cook_. Orders taken by the waiter are queued until a Cook becomes available to prepare the order. The _OrderPreparationSaga_ manages this process. The saga starts when an _OrderQueuedEvent_ is received and immediately issues a _PrepareOrderCommand_ to the _Cook_. If the _Cook_ rejects the command because he is already busy with another order, the saga waits for an _OrderPreparationCompletedEvent_ before trying to issue the command again. In the case that the _OrderPreparationCompletedEvent_ is for the order managed by this saga, it proceeds to issue a _DequeueOrderCommand_ to the _OrderQueue_. Upon receiving the corresponding _OrderDequeuedEvent_ the saga ends.

![](https://res.cloudinary.com/monkey-codes/image/upload/v1617861272/event-driven-architecture-cafe/order-preparation-saga.svg)

To simplify the diagram commands and events are passed directly from source to target, in reality, commands are sent via the Axon _CommandGateway_ and events are delivered via an _EventBus_.

### Saga Testing

Similar to aggregate testing, a saga test is not concerned with the structure of the saga itself. The setup defines events published by different aggregates linked to the saga and then asserts on the state or commands dispatched by the saga.

### Projections and the Query Model

To build a query model an event handler is used to project domain events into the desired shape of the model. These event handlers come in 2 forms, strongly consistent or eventually consistent. In Axon terms, strongly consistent handlers are called _subscription processors_ and eventually, consistent handlers are called _tracking processors_.

By default Axon uses eventually consistent tracking processors. The big difference is that with a subscription processor the handler is called in the same transaction that is committing the domain events. That means that if the processor fails the transaction rolls back and the domain event is not persisted. With tracking processors, the error will be logged and Axon will retry to deliver the event. Ultimately that means that a tracking processor can get stuck until the issue is resolved.

In the cafe example, 2 query model projections exist. The first is to add entries to the Atom feed of the domain events that should be made public. I make the distinction between private domain events and public events because changing the latter will have an impact on services consuming the feed, but more on that later. The 2nd query model is to record recent activity that will be pushed to the UI.

### Adapting HTTP Requests To Commands & Queries

As mentioned earlier each service applies CQRS. A Mutating HTTP API request is converted into a _Command_ and sent to the _CommandGateway_. Similarly, a query HTTP API Request is converted into a _Query_ and sent to the _QueryGateway_. In both cases, Axon takes care of resolving the correct _Aggregate_ or _QueryHandler_ to handle the request.

A typical problem with eventually consistent query models is how to update the UI when the query model changes. Making a query API request immediately after a successful command API request does not mean that the query model has been updated yet. Polling the query endpoint may work but is not a very elegant solution. A _SubscriptionQuery_ is an Axon feature that allows interested parties to be notified of changes to the model backing the query. Combining this feature with [server-sent events](https://en.wikipedia.org/wiki/Server-sent_events) enables the server to push changes in the query model to the browser.

Note that the above example will not work if you scale out the service, in that case, a [distributed querybus is needed.](https://stackoverflow.com/questions/58010157/subscription-queries-in-a-multi-node-environment)

## Service Choreography Through Events

Instead of having 1 process that orchestrates the order lifecycle, choreography refers to the idea that each service plays its part by reacting to external events and publishing what it did. This type of architecture leads to loosely coupled services and overall a more robust system. For example, consider what happens when a service goes down. In a traditional system, the calling service will need a retry mechanism or resort to failing the whole transaction. With events, the service that is down will have a backlog of events to process once it comes online again, simply delaying the completion of the process. No failed transaction or lost data.

### Public vs Private Events

In the cafe example, a clear distinction is made between public and private events. Private events refer to the domain events that back event sourcing and that are not necessarily published on the Atom feed. The events are private to that service. The Axon framework supports event evolution through the concept of _Upcasters_. Whenever a new version of an event is created, an _Upcaster_ is created alongside it. The role of the _Upcaster_ is to upgrade the previous version of the event to the current version, allowing aggregates to be hydrated from an event stream that contains older versions of the event. This can be thought of as a map operation on the event stream.

Public events are published on the Atom feed and consumed by other services. More care needs to be taken when evolving public events since one cannot expect all consumers to upgrade at the same time. A simple solution to the problem is to always make backward-compatible changes (think adding instead of renaming or deleting attributes). That may not always be possible. Borrowing from Axon _Upcasters_ and extending the idea to include _Downcasters_ offers another solution. A _Downcaster_ converts an event to its previous version.

The Atom feed contains the version of every event in the form of a custom MIME type like `application/vnd.cafe.order-taken-event-v2+json`. The _Downcaster_ functionality can be exposed as an API call to the producing service with content negotiation to downgrade an event to its previous version(s). The net result is that when a consumer encounters an event version that it does not yet support, it pays the penalty of an extra API call to downgrade the event until such time that it can upgrade to the latest version. The same can be done in the opposite direction by exposing the _Upcasters_ in an API. Bringing a new service online that is interested in the event history of another service, can be developed against the latest versions of every event. When consuming the older events from the Atom feed, the consumer can request the latest version of an old event through a similar API call.

One thing to note is that similar to the domain event stream, the Atom feed is immutable. Historic events are not changed when a new version of the event is created.

### Producing An Atom Feed

As mentioned earlier, the Atom feed is just a query model projection of the domain events. Each service decides which events are public and whether the shape of the event will be the same. The projecting event handler simply copies the data from the domain event to the public event and persists it.

The controller that exposes the feed has more work to do. The events are ordered from the most recent event at the top and are always accessible at a fixed URL (e.g `/feed`). Once the number of events at the head of the feed is larger than the page size for the feed, those events are archived and given a fixed URL. You can think of it as pagination in reverse. The URL`/feed/0` will contain the oldest events in the service. When the 2nd full page is archived it will be available at `/feed/1`. The contents of the head page (`/feed`) will change until it reaches the page size, then it is archived. This means that the page number adjacent to the head page will increase with every new page (`/feed` -> `/feed/{N}` -> `/feed/{N-1}` ... `/feed/0`).

### Consuming An Atom Feed

Consumers pull events from producers. It is the responsibility of the consumer to keep track of the last processed event. The basic process is to periodically access the head of the producer's feed at `/feed`. Then walk down the page until the last processed event is found, potentially navigating back into archived pages. Once the event is found, you read forward from that point until you reach the most recent event at the top of the head page.

When a consumer encounters an event that it is interested in, the event is translated into a _Command_, copying the required state from the event, and sent via the _CommandGateway_ to the target _Aggregate_.

## Conclusion

This post covers the basics of creating an event-driven architecture without the need for dedicated messaging infrastructure. Using Atom feeds serves as a simple mechanism to integrate microservices, yet I believe it leaves the option open to move to a more advanced messaging infrastructure. From a service point of view, the only thing that changes is the adapter between external events and internal commands.

The source code used in this post is available on [GitHub](https://github.com/monkey-codes/event-driven-architecture-cafe).
