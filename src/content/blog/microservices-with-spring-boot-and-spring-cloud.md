---
title: "Microservices with Spring Boot and Spring Cloud"
description: "An overview of building microservices with Spring Boot covering RESTful API design, Swagger, Actuator and Spring Cloud components like Eureka, Feign, Zuul and Zipkin."
pubDate: 2018-01-09
tags: ["Spring", "development", "API"]
---

Microservices architecture breaks a monolithic application into small, independently deployable services. Each service owns its data, runs in its own process, and communicates over lightweight protocols -- typically HTTP. The trade-off is operational complexity, but the gains in scalability, independent deployment, and team autonomy are significant for the right kind of system.

Spring Boot and Spring Cloud provide a mature ecosystem for building and operating microservices on the JVM. This post is a reference overview covering RESTful API design, documentation, monitoring, and the key Spring Cloud components that tie everything together.

## RESTful API Design with Spring Boot

A well-designed REST API starts with a clear _service definition_ -- the request/response format, resource structure, and endpoint conventions. Spring Boot makes this straightforward with `@RestController`, which combines `@Controller` and `@ResponseBody` so that return values are automatically serialized via message converters.

Jackson handles JSON serialization out of the box. For sane date formatting, I'd recommend disabling timestamp serialization early on:

```properties
spring.jackson.serialization.write-dates-as-timestamps=false
```

Use `@RequestBody` to deserialize incoming JSON into a domain object, and return appropriate HTTP status codes. For a `POST` that creates a resource, the correct response is `201 Created` with a `Location` header pointing to the new resource:

```java
@PostMapping("/users")
public ResponseEntity<Object> create(@RequestBody User user) {
    User savedUser = repository.save(user);
    URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(savedUser.getId())
            .toUri();
    return ResponseEntity.created(location).build();
}
```

`ServletUriComponentsBuilder` constructs the URI from the current request context, which keeps things clean and avoids hardcoding paths.

### Error Handling and Validation

Spring provides two useful mechanisms for consistent error responses. `@ResponseStatus` on custom exception classes maps exceptions to HTTP status codes. `@ControllerAdvice` provides global exception handling across all controllers -- a good place to standardize error response bodies.

For input validation, annotate `@RequestBody` parameters with `@Valid` and use `javax.validation.constraints` annotations on model fields. Spring returns a `400 Bad Request` automatically when validation fails.

### Content Negotiation and HATEOAS

The `Accept` header drives content negotiation. JSON works out of the box; adding `jackson-dataformat-xml` to your dependencies enables XML support without any code changes. For localization, configure a `LocaleResolver` and `ResourceBundleMessageSource`, then use the `Accept-Language` header to serve localized messages.

Spring HATEOAS adds hypermedia links to responses using `Resource` wrappers and `ControllerLinkBuilder`. This moves your API closer to the top of the _Richardson Maturity Model_ -- Level 3, where responses include links that guide the client through available actions.

### Versioning

There's no perfect API versioning strategy. The common approaches are URL path versioning (`/v1/users`), query parameters (`?version=1`), custom headers (`X-API-VERSION`), and MIME type versioning (`Accept: application/vnd.company.v1+json`). Header-based approaches are cleaner but make caching harder. URL versioning pollutes the URI space but is the most visible and debuggable. Pick a strategy and stick with it before building out your API.

### Filtering Response Properties

Use `@JsonIgnore` on fields for static filtering -- properties that should never be exposed. For dynamic filtering where different endpoints return different subsets of fields, use `@JsonFilter` with a `SimpleBeanPropertyFilter` configured in the controller.

## API Documentation with Swagger

Swagger generates interactive API documentation from your code. Add `springfox-swagger2` and `springfox-swagger-ui` to your dependencies, annotate your configuration class with `@EnableSwagger2`, and provide a `Docket` bean to customize what gets documented.

The raw API specification is available at `/v2/api-docs` as JSON, and the interactive UI lives at `/swagger-ui.html`. You can enrich the documentation with `@ApiModel` and `@ApiModelProperty` annotations on your domain classes to describe fields, constraints, and example values.

## Monitoring with Actuator

Spring Boot Actuator exposes operational endpoints for health checks, metrics, environment details, and more. Add `spring-boot-starter-actuator` and optionally `spring-data-rest-hal-browser` for a browsable interface at the application root.

By default, only a few endpoints are exposed. To expose all of them:

```properties
management.endpoints.web.expose=*
```

The `/actuator` path lists available endpoints. Metrics support tag-based filtering for drilling into specific measurements. One important note: actuator endpoints should be secured in production -- they expose internals like environment variables and configuration properties.

## Spring Cloud Components

Spring Cloud provides the infrastructure layer for a microservices architecture. Here's how the key components fit together.

### Centralized Configuration with Config Server

`@EnableConfigServer` turns a Spring Boot application into a configuration server backed by a Git repository. Services fetch their configuration at startup, which means you can manage all environment-specific properties in one place.

Configuration files follow a naming convention: `limits-service.properties` for defaults, `limits-service-dev.properties` for the dev profile. Profile-specific properties take priority over defaults.

On the client side, rename `application.properties` to `bootstrap.properties` so that config is loaded before the application context starts. Configuration can be refreshed at runtime via the actuator `/refresh` endpoint, and Spring Cloud Bus broadcasts updates to all service instances simultaneously.

### Service Discovery with Eureka

Eureka handles service registration and discovery. The server runs with `@EnableEurekaServer`, and each service registers itself using `@EnableDiscoveryClient` with a simple configuration:

```properties
eureka.client.service-url.default-zone=http://localhost:8761/eureka
```

Once registered, services refer to each other by name rather than host and port. This decouples services from specific deployment locations and enables dynamic scaling.

### Declarative REST Clients with Feign

Feign simplifies service-to-service HTTP calls. Instead of wiring up `RestTemplate` with URL construction and response mapping, you define a proxy interface annotated with `@FeignClient` and Spring generates the implementation.

Enable it with `@EnableFeignClients` on your application class. One gotcha: `@PathVariable` in Feign proxy interfaces requires the explicit `value` attribute -- it doesn't infer the name from the parameter like regular Spring MVC controllers do.

### Client-Side Load Balancing with Ribbon

Ribbon distributes requests across multiple instances of a service. Add `@RibbonClient` to your Feign proxy, and Ribbon handles the load balancing. It can work with a hardcoded list of instances or -- more usefully -- integrate with Eureka to discover instances dynamically.

### API Gateway with Zuul

Zuul sits at the edge of your microservices architecture and provides routing, filtering, and cross-cutting concerns like authentication and logging. Enable it with `@EnableZuulProxy`.

Requests route through the gateway using the pattern `http://localhost:8765/{application-name}/{uri}`. You can implement `ZuulFilter` for pre-routing, post-routing, and error handling logic. Service-to-service calls can also route through the gateway via Feign, giving you a single point for traffic management.

## Distributed Tracing with Sleuth and Zipkin

In a microservices architecture, a single user request can touch half a dozen services. Debugging failures or latency issues across those boundaries is painful without distributed tracing.

Spring Cloud Sleuth assigns a unique trace ID to each request and propagates it across service calls. The trace ID appears in log output automatically, so you can correlate log entries across services. Sleuth integrates with Zipkin, which collects timing data and provides a UI for visualizing request flows.

A common setup pipes trace data through RabbitMQ to decouple services from the Zipkin server:

```bash
$ RABBIT_ADDRESSES=127.0.0.1 java -jar zipkin-server.jar
```

Configure a `AlwaysSampler` bean during development to capture every request. In production, you'd typically sample a percentage to reduce overhead.

## Conclusion

Spring Boot and Spring Cloud handle a lot of the heavy lifting for microservices. The combination of Eureka for discovery, Feign for inter-service communication, Zuul for edge routing, and Sleuth with Zipkin for tracing covers the core infrastructure concerns. The important thing is getting the fundamentals right first -- clean API design, proper status codes, validation, and documentation -- before layering on the distributed systems tooling.

### References

- [Spring Microservices (in28minutes)](https://github.com/in28minutes/spring-microservices)
- [Martin Fowler - Microservices](https://martinfowler.com/microservices/)
- [The Twelve-Factor App](https://12factor.net/)
- [The 12 Factor App: A Java Developer's Perspective (DZone)](https://dzone.com/articles/the-12-factor-app-a-java-developers-perspective)
