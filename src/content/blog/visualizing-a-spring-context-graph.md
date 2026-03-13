---
title: "Visualizing a Spring Context Graph"
description: "How to examine the runtime state of a Spring context with the help of an object graph."
pubDate: 2016-03-29
updatedDate: 2018-06-04
#heroImage: "/content/images/2016/03/spring_graph_post_header.jpg"
tags: ["Spring","development"]
---

Lack of package design can lead to unintended large _Spring contexts_ due to the ease of using component scanning. This post will look at how to visualize the runtime state of a _Spring application context_ with a view to refactoring application _package_ design. Good _package_ design will simplify both application composition configuration and integration testing through scanning _module_ orientated packages.

## Background - Uninvited Guests At The Party

_Spring_ significantly improved the _context_ configuration part of the framework since the early XML based versions. Once component scanning was introduced it greatly reduced the amount of manual configuration. Scanning a _package_ would include all the annotated _components_ contained therein and voila, the application is all wired up. The **problem** with this powerful feature arises when little thought goes into **how components are packaged (grouped) together**. Adding a new _component_ to an existing _package_ means that it will be loaded wherever that _package_ is scanned and that is not always desired. The configuration "smell" is usually observed in a lot of _exclusion filters_ where a package is scanned.

## Spring Graph - Identifying The Gate Crashers

[Spring Graph](https://github.com/monkey-codes/spring-graph) was developed to help with identifying unwanted _components_ by visualizing the runtime state of a _Spring application context_ in the form of an [Object Graph](https://en.wikipedia.org/wiki/Graph_theory).

### Setup

The dependencies are not hosted on a public maven repository, using this will require [checking out](https://github.com/monkey-codes/spring-graph) the project and building it using gradle ([Node](https://nodejs.org/en/) and [Grunt](https://gruntjs.com/) also needs to be installed).

```
git clone git@github.com:monkey-codes/spring-graph.git
cd spring-graph && ./gradlew install

```

This will install a few JAR's in the local maven repository under `codes.monkey.springgraph:spring-graph-*`

The `spring-graph-web` artifact doubles as a **Spring Boot Starter**, simply adding it to the classpath of a _Spring Boot Application_ will automatically configure it.

**Spring MVC Applications** require a manual setup, below is an example of a basic MVC configuration in Groovy.

```java
package codes.monkey.sampleapp

import codes.monkey.springgraph.SpringGraphAutoConfiguration
// other imports ...
@Import(SpringGraphAutoConfiguration)
@Configuration
class MVC extends WebMvcConfigurationSupport {

    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        String staticPathPattern = '/**'
        if (!registry.hasMappingForPattern(staticPathPattern)) {
            registry.addResourceHandler(staticPathPattern,)
                    registry.addResourceHandler(staticPathPattern)
                            .addResourceLocations('classpath:/public/')
        }
    }
}

```

### Usage

[Spring Graph](https://github.com/monkey-codes/spring-graph) will add a few URL's to the application:

*   `http://${host}:${port}/${context}/spring-graph-ui/index.html` - Renders the current application's context graph using [visjs](http://visjs.org/). Large contexts might take some time to render.
*   `http://${host}:${port}/${context}/spring-graph-ui/api/visjs` - Context graph data exposed in a [visjs](http://visjs.org/) JSON format.
*   `http://${host}:${port}/${context}/spring-graph-ui/api/dot` - Graph data in [DOT](https://en.wikipedia.org/wiki/DOT_\(graph_description_language\)) format.
*   `http://${host}:${port}/${context}/spring-graph-ui/image/png` - Generates a PNG from the graph data. **Note that the [Graphviz](http://www.graphviz.org) binary needs to be installed and on the PATH for this functionality to work.**
*   `http://${host}:${port}/${context}/spring-graph-ui/image/svg` - Same as above but in SVG format.

### Screenshots

The context graph in the [visjs](http://visjs.org/) interface

![Spring Graph UI](https://monkey-codes.github.io/spring-graph/images/sample-ui.png)

The context graph as a generated PNG

![Sample PNG](https://monkey-codes.github.io/spring-graph/images/sample.png)

## Unusual Suspects

Armed with the graph information a developer, with good knowledge of the application, might be able to identify unwanted _components_ that are being included in the _context_. In my experience an unwanted _component_ usually shows up because it has been added to an existing _package_ that is being scanned. A classic example of this is when _packages_ are used to group _components_ together by **type** instead of by the **functionality** it supports. The aim should be to group _components_ that work together in the same _package_. The package then represents a _module_, a group of _components_ that work together to achieve a specific goal.

Consider the following oversimplified package designs:

### Grouped By Type

![Package by type](https://monkey-codes.github.io/spring-graph/images/sample-pkg1.svg)

It is clear to see that scanning the `controllers`, `services` and `models` _packages_ will over time include more _components_ as the application grows. To avoid loading unwanted _components_ one has to rely on exclusion filters to ensure that the _components_ are only loaded where it's needed. IMHO packaging _components_ together by the role that it plays is rarely a useful grouping. This design also shows its shortcomings when certain functionality needs to be extracted. Imagine having to load the search functionality in a separate _context (or application)_, each dependency will have to be cherry picked from the individual _packages_.

### Grouped By Functionality

![Package by type](https://monkey-codes.github.io/spring-graph/images/sample-pkg2.svg)  
The 2nd package structure simplifies application configuration. Only _modules (packages)_ that are required by the application are scanned. Over time only new _components_ that are added to a _module_, as it evolves, will be automatically included. The chances of including unwanted _components_ by accident are far less. This design also holds better under the challenge of separating out a _module_, all related _components_ are grouped in a single _package_.

## Conclusion

The same principles that apply to good object orientated design also applies to package design. Classes in a package should be [cohesive](https://en.wikipedia.org/wiki/Cohesion_\(computer_science\)) while [coupling](https://en.wikipedia.org/wiki/Coupling_\(computer_programming\)) between packages should be loose.
