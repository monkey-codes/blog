---
title: "Dockerize a Spring Boot Application"
description: "A brief exploration of Docker and how it can be used to setup a complex application with several components."
pubDate: 2016-03-13
updatedDate: 2018-06-04
#heroImage: "/content/images/2016/03/docker_post_header.jpg"
tags: ["Docker","development","Gradle","Spring"]
---

This post will cover the basic concepts of _Docker_ and _Docker Compose_ and how it can be applied to setup the [Spring Boot Application](/boot-your-restful-api-using-spring/) created in part one of the series.

## What is Docker?

_Docker_ allows an application and all its dependencies to be packaged in a _Container_ that will always run the same regardless of the environment it's deployed in. The term "dependencies" here refers to the components an application needs to run, like _Java_, _OS packages_ or libraries like _ImageMagick_, any other files or folders, basically anything that can installed on a server. The big difference between _Docker_ and a _Virtual Machine_ is that _Docker Containers_ share the host operating system kernel, therefore it's lightweight, starts quickly and makes efficient use of RAM.

## Docker Concepts

### Docker Image

A _Docker Image_ acts as a blueprint or template for a _Docker Container_. For example `docker run ubuntu` will create a **new** _Docker Container_ based on the **ubuntu** _Docker Image_. The container does not modify the image in any way unless changes are explicitly committed. New images can easily be created by inheriting from existing images, online repositories like [Docker Hub](https://hub.docker.com/) makes it easy to share and find images created by the community.

### Dockerfile

The preferred way to create a _Docker Image_ is with a script known as a _Dockerfile_. Alternatively the required changes can be made through running a shell on a container and then committing it to an image. _Dockerfiles_ have the advantage of providing the ability to automate image creation and the syntax is simple, clear and self explanatory. The below example will create an image based on **ubuntu** and will run the `echo "Hello docker!"` command when a container is created from this image.

```
#Sample Dockerfile
FROM ubuntu
CMD "echo" "Hello docker!"

```

### Docker Container

A _Docker Container_ [is a running instance](http://stackoverflow.com/questions/23735149/docker-image-vs-container) of a _Docker Image_ and there can be many running instances of the same image. A _Docker Volume_ can be used to persist changes to the file system in a _Docker Container_. Every time a `docker run <image>` command is run a **new** container is created from the given image. _Docker Containers_ that expose ports can be mapped to a port on the host where the _Docker Daemon_ is running with `docker run -p 8080:80 <name|id>`.

### Docker Volumes

Changes an application makes to the filesystem (like writing log or database files) will not persist beyond the lifecycle of a _Docker Container_ unless these files are written to a mounted _Volume_. A _Volume_ remains available after a _Docker Container_ that uses it is destroyed.

To create a data _Volume_ for _Mongo_ and then start it run:

```
docker volume create --name data-mongo
docker run -v data-mongo:/data/db mongo

```

Then to backup the _Mongo_ data into the current working directory:

```
docker run --rm -v data-mongo:/data/mongo -v $(pwd):/backup busybox tar cvf /backup/mongo-data.tar /data

```

`docker volume inspect <name|id>` will show the mount point of the _Volume_. On OSX this mount point will reference a folder in the VirtualBox VM started by _Docker Machine_ and not a local folder.

### Docker Daemon

This is the process that manages _Docker Containers_. Since _Docker_ makes use of Linux kernel features the _Docker Daemon_ has to run on a virtual machine when using OSX. The [Docker Machine](https://docs.docker.com/machine/) utility can be used to setup a virtual machine on OSX. It also configures the OSX terminal (or iTerm) with environment variables that tells the `docker` cli where the _Docker Daemon_ is running.

### Docker Image Repository

_Image Repositories_ act as the _github_ of _Docker Images_. Images can be pushed and pulled from these repositories and both [public](https://hub.docker.com/) and [private](https://quay.io) repositories exist.

### Docker Compose

_Docker Compose_ [is a tool](https://docs.docker.com/compose/) that simplifies the configuration of multi _Container_ applications. A single yaml file can be used to define all the required _Containers_, configure the networking between them, and the _Volumes_ for persistence. A `docker-compose up` command will build and start all the containers defined in the `docker-compose.yml` file.

## Basic Docker Commands

*   `docker run <image>` Creates a new _Container_ each time it is run.
*   `docker start <name|id>` Starts an existing _Container_.
*   `docker stop <name|id>` Stops an existing _Container_.
*   `docker ps [-a include stopped containers]` List all _Containers_ created.
*   `docker rm <name|id>` Remove a _Container_.
*   `docker rm $(docker ps -aq)` Delete all _Containers_.
*   `docker images` Lists built and dowloaded _Images_.
*   `docker rmi node` remove _Image_ named 'node'
*   `docker exec -t -i <name|id> /bin/bash` Get a shell in a running _Container_.
*   `docker volume ls` Lists the created data _Volumes_.
*   `docker build -t <name> .` Build an _Image_ from a _Dockerfile_ in the current directory.

## Building a Docker Image With Gradle

To build a _Docker Image_ out of the [Spring Boot Application](/boot-your-restful-api-using-spring/) built in part one of this series, the [gradle docker plugin](https://github.com/Transmode/gradle-docker) can be added to the `gradle.build` file.

```
 ...
dependencies {
  ...
  classpath('se.transmode.gradle:gradle-docker:1.2')
  ...
}
...

apply plugin: 'docker'
task buildDocker(type: Docker, dependsOn: build) {
	push = false
	applicationName = "monkey-codes/${jar.baseName}"
	dockerfile = file('src/main/docker/Dockerfile')
	doFirst {
		copy {
			from jar
			into stageDir
		}
	}
}


```

Next step is to add the `src/main/docker/Dockerfile` that contains the [instructions](https://spring.io/guides/gs/spring-boot-docker/) for _Docker_ to build the _Image_ for the application.

```
FROM java:8
ADD spring-boot-restful-0.0.1-SNAPSHOT.jar app.jar
RUN bash -c 'touch /app.jar'
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]

```

With this setup the application _Image_ can be built with:

```
./gradlew buildDocker

```

Then launched with:

```
docker run --rm monkey-codes/spring-boot-restful

```

The application still needs _Mongo_, _Prometheus_ and _Grafana_ to function, that is where _Docker Compose_ comes in handy.

## Assembling All The Parts

Create a new _Docker Compose_ file in `src/main/docker/docker-compose.yml`

```yaml
version: '2'
volumes:
  data-mongo:
    external:
      name: spring-boot-restful-data-mongo
  data-prometheus:
    external:
      name: spring-boot-restful-data-prometheus
  data-grafana:
    external:
      name: spring-boot-restful-data-grafana
  data-grafana:
      external:
        name: spring-boot-restful-data-grafana
  data-logging:
    external:
      name: spring-boot-restful-data-logs
  data-elasticsearch:
      external:
        name: spring-boot-restful-data-elasticsearch
services:

  web:
    image: monkey-codes/spring-boot-restful
    container_name: web
    ports:
     - "80:8080"
    links:
     - db
     - fluentd

  db:
    image: mongo
    container_name: db
    volumes:
      - data-mongo:/data/db

  prometheus:
    build: ./prometheus
    image: prometheus
    container_name: prometheus
    volumes:
      - data-prometheus:/prometheus
    ports:
     - "9090:9090"
    links:
     - web

  grafana:
    image: grafana/grafana
    container_name: grafana
    volumes:
     - data-grafana:/var/lib/grafana
    ports:
     - "3000:3000"
    links:
     - prometheus

  fluentd:
      build: ./fluentd
      container_name: fluentd
      volumes:
       - data-logging:/fluentd/log
      ports:
       - "24224:24224"
      links:
       - elasticsearch

  elasticsearch:
    image: elasticsearch
    container_name: elasticsearch
    volumes:
      - data-elasticsearch:/usr/share/elasticsearch/data

  kibana:
    image: kibana
    container_name: kibana
    ports:
     - "5601:5601"
    environment:
      - ELASTICSEARCH_URL=http://elasticsearch:9200
    links:
     - elasticsearch


```

The configuration has two parts `volumes` and `services`. The `volumes` section shows the data _Volumes_ required by the application to persist data. Launching the application will prompt for these _Volumes_ to be created if they do not exist. The `services` section defines all the components of the application. The options defined for each service include, **ports** that need to be forwarded from the host, **volumes** that need to be mounted, and **links** that define dependencies between the `services`. _Docker Compose_ maintains a [complete reference](https://docs.docker.com/compose/compose-file/) of all the available options.

**Links** are by far the most interesting option, it exposes the dependency under a host name with the same name as the service. For example, the **web** service can connect to the **db** link by using `mongodb://db`.

The components of this application include:

*   **web** - The [Spring Boot Application](/boot-your-restful-api-using-spring/) created in part one.
*   **db** - The mongo _Container_ that persists the application data.
*   **prometheus** - Time series database that collects information from _Spring Actuator_.
*   **grafana** - Create dashboards from the application data collected by _Prometheus_
*   **fluentd** - Collect all application logs and push it into _Elasticsearch_.
*   **elasticsearch** - Store application logs.
*   **kibana** - Provide an interface into the log data stored in _Elasticsearch_

The combination of **fluentd**, **elasticsearch** and **kibana** act as an [alternative](http://docs.fluentd.org/articles/free-alternative-to-splunk-by-fluentd) to [Splunk](http://www.splunk.com/).

## Conclusion

> “But it works on my machine”— Confused Developer

_Docker_ is a powerful tool that will reduce issues caused by differences in development and production environments, by defining _Docker Images_ that can be shared between the environments. Furthermore I believe it can be used as a tool to standardize development environments across team members and reduce the time new recruits need to get up and running.

The code described in this post is available at [github.](https://github.com/monkey-codes/spring-boot-restful)

## Sources

_Data volume containers_ -  
[http://stackoverflow.com/questions/18496940/how-to-deal-with-persistent-storage-e-g-databases-in-docker](http://stackoverflow.com/questions/18496940/how-to-deal-with-persistent-storage-e-g-databases-in-docker)

_Fluentd for logging example with docker-compose_  
[https://github.com/j-fuentes/compose-fluentd](https://github.com/j-fuentes/compose-fluentd)  
[http://www.fluentd.org/architecture](http://www.fluentd.org/architecture)

_Docker Machine_  
[https://docs.docker.com/machine/](https://docs.docker.com/machine/)

_Spring Boot Docker_  
[https://spring.io/guides/gs/spring-boot-docker/](https://spring.io/guides/gs/spring-boot-docker/)
