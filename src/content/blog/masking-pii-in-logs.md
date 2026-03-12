---
title: "Masking PII In Logs"
description: "How to mask Personally Identifiable Information in logs using slf4j and Aspectj"
pubDate: 2020-06-01
heroImage: "/content/images/2020/06/pii_post_header.jpg"
tags: ["development"]
---

## What is PII and why

Personally Identifiable Information or PII is any information that can be used to identify a specific individual, these include but are not limited to names, phone numbers, social security numbers, passport numbers, drivers licenses and emails.

Logs are usually the first port of call for diagnosing production issues. As developers we don't hesitate to sprinkle log messages liberally along the processing path of a request. This often includes private information that was passed in the HTTP Request or loaded from the database. Default toString methods serialize this information and PII ends up as plain text in the logs. With the advent of log aggregation tools like Kibana and Splunk, this information is collected and made searchable through a simple interface, making it an attractive target to attackers.

> “Privacy is not an option, and it shouldn’t be the price we accept for just getting on the Internet.”— Gary Kovacs

We don't have to give up the usefulness of logs to protect customer information. This post will look at 2 potential ways to mask PII in logs:

*   Scanning arguments passed to the Logger that uses template strings.
*   Doing compile-time weaving (AOP) of toString methods.

The [sample code](https://github.com/monkey-codes/logging-mask-pii) is in kotlin but can be adapted to work for Java projects.

## Setup

The basic idea is that all PII fields are annotated as such so that the masking functionality can detect fields that require special treatment.

To perform the masking, a custom `PIIMaskingToStringBuilder` can be built based on the [commons-lang](http://commons.apache.org/proper/commons-lang/) `ReflectionToStringBuilder`. Overriding the `getValue` method provides a convenient hook to scan the field for the `@PII` annotation and, if found, mask the value with the configured `DataMaskingFunction`.

One thing to note about this solution is that any `toString()` implementation on the class is ignored in favour of the custom builder. This means the flexibility around the `toString` implementation is sacrificed for a global way of dealing with PII. Having said that, commons-lang does provide a `@ToStringExclude` annotation that can be used to ignore certain fields on a Class. This is very useful for data structures with circular references.

## Simple approach using log templates

This approach works by creating a [Factory Method](https://en.wikipedia.org/wiki/Factory_method_pattern) for the Logger that delegates to  
slf4j LoggerFactory to get the Logger implementation and then proceeds to [Decorate](https://en.wikipedia.org/wiki/Decorator_pattern) it with Logger that scans arguments to the template log message for fields annotated with `@PII`. Given an argument that does contain sensitive fields, the logger hands off to the `PIIMaskingToStringBuilder` to perform the masking.

This is a simple approach and would be enough to solve the problem in most cases. It has one shortcoming, developers have to be disciplined and not rely on the toString() implementation on the Class. If the above code was changed to:

The `PIIMaskingToStringBuilder` will have no opportunity to scan customer for PII since the string is already created before it is passed to the logger, the output will contain all the sensitive information. Which brings us to the second approach that will work in all scenarios but requires compile-time weaving of an Aspect.

## Weaving aspect into toString

The basic idea is to weave a `PIIAspect` around all the `toString` implementations, scoped to your application package. When `toString` is called, the aspect will look at the target on the `ProceedingJoinPoint` and if any of the fields are annotated with `@PII`, handoff to the `PIIMaskingToStringBuilder` to do the heavy lifting.

Getting compile-time weaving working together with the Kotlin compiler in Maven proved more challenging than what I expected. Eventually, I gave up on using the `aspectj-maven-plugin` and settled on `jcabi-maven-plugin`. The important part to note is that [kotlin kapt](https://kotlinlang.org/docs/reference/kapt.html) had to be configured to support annotation processing.

pom.xml

The compile-time weaving does not automatically work in Intellij, but running `./mvnw spring-boot:run` goal will correctly compile and then weave the aspect before running the app. At the time writing this I could not find any documentation on how to configure the kotlin compiler in IntelliJ to work with AJC.

## Limit scanning scope for PII

To keep performance at acceptable levels, it is important to narrow the scope of the classes that get scanned for PII. The [sample code for this post](https://github.com/monkey-codes/logging-mask-pii) contains a `Configuration` singleton backed by a `pii.properties` that configures which packages to apply PII scanning to.

## Recursive Properties

As mentioned earlier in the post, fields can be excluded from the PII `toString()` implementation using the `@ToStringExclude` annotation provided by commons-lang.

## Data Masking Function

The default `DataMaskingFunction` simply replaces PII with `***`. More [complex options exist](https://www.iri.com/blog/data-protection/data-masking-function-use/) that have added benefits like generating the same scrambled output for a given input so that you can still search by the scrambled output, but that comes at a performance cost.

## Conclusion

As developers, we have to take responsibility for protecting customer's information, and that includes whatever we write to the logs. This post shows how to declaratively mark the fields that contain sensitive information and a way to use this information to mask those fields in the logs.

The source code used in this post is available on [GitHub](https://github.com/monkey-codes/logging-mask-pii).
