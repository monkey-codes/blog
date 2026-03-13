---
title: "Boot Your RESTful API Using Spring"
description: "How to build a HATEOAS RESTful API using Spring Boot and Mongo."
pubDate: 2016-02-17
updatedDate: 2018-06-04
#heroImage: "/content/images/2016/03/boot_api_post_header.jpg"
tags: ["API","development","Groovy","Gradle","Spring"]
---

With _microservices_ being a popular approach on greenfield projects and equally used the liven up aging architectures, I wanted to explore what the _Groovy / Spring_ world had to offer in this regard. [Spring Boot](http://projects.spring.io/spring-boot/) is arguably the simplest way to get a lightweight _RESTful_ service off the ground. In this post I will cover the basics on getting a [HATEOAS](https://en.wikipedia.org/wiki/HATEOAS) _RESTful_ service that stores _Person_ entities in a [Mongo](https://www.mongodb.org/) database.

The code can be found on [github.](https://github.com/monkey-codes/spring-boot-restful)

## What is HAL & HATEOAS?

_HATEOAS_ (Hypermedia as the Engine of Application State) is a style of _REST_ application architecture that allows a client to dynamically navigate the related resources through hypermedia links in the body of a response. HAL (Hypertext Application Language) defines a simple format to hyperlink between resources in your API, thus HAL can be used to _implement_ HATEOAS.

## Environment

Having stared at [Maven](https://maven.apache.org/) xml files for many years I felt inclined to see how the other side lives and decided to take [Gradle](http://gradle.org/) for a test drive. It did not take a lot of effort to get the build going but you do need to have a few obvious components installed before you can start.

### Java

Make sure java is installed and on your path. I like to install it in /opt with a symlink `current` pointing to the version. Then stick current into your profile, this allows you to easily switch between versions by just changing the `current` symlink.

```shell
mkdir /opt/java && cd /opt/java

curl -v -j -k -L -H "Cookie: oraclelicense=accept-securebackup-cookie" http://download.oracle.com/otn-pub/java/jdk/8u25-b17/jdk-8u25-linux-x64.tar.gz > jdk-8u25-linux-x64.tar.gz

tar -xvf jdk-8u25-linux-x64.tar.gz
ln -sf /opt/java/jdk1.8.0_71 /opt/java/current
echo 'export JAVA_HOME=/opt/java/current' >> ~/.profile
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.profile
source ~/.profile

```

### SDKMAN!

Nope, its not a [superhero](http://sdkman.io/), but can easily pass for one. You can think of it as RVM for Java or Groovy.

```
curl -s get.sdkman.io | bash
source "/home/vagrant/.sdkman/bin/sdkman-init.sh"
sdk install springboot

```

Now you should have the `spring` command available in your terminal.

### Mongo

[Mongo](https://www.mongodb.org/) is a popular document store that will be used to persist the _Person_ entities.

```shell
mkdir /opt/mongo
cd /opt/mongo
wget wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu1404-3.2.1.tgz
tar -xvf mongodb-linux-x86_64-ubuntu1404-3.2.1.tgz
ln -sf mongodb-linux-x86_64-ubuntu1404-3.2.1 current
mkdir /opt/mongo/data
/opt/mongo/current/bin/mongod --dbpath /opt/mongo/data/

```

## Bootstrapping the project

I always find it easier to tinker with something that is working when you are learning a new technology. [Spring initializr](http://start.spring.io) provides a browser based wizard to generate a project skeleton. Make sure you select _Gradle_ project with the following starters:

*   Rest Repositories
*   MongoDB
*   Actuator

Extract the _generated zip_ archive in your project folder. The project's root folder will contain a set of [Gradle wrapper](https://docs.gradle.org/current/userguide/gradle_wrapper.html) scripts and jar file that provides a convenient way of bootstrapping your _gradle_ build environment. It can be committed with the rest of the project files and will download and cache the version of Gradle used for the project.

To build the project run:

```shell
./gradlew

```

This might take a while the first time since it needs to download Gradle and all the projects dependencies but stay calm and don't panic, the second time will be much faster since all the dependencies are cached locally.

### Hotswapping with Spring-Loaded

This might speed up your development cycle to a certain extent. It will reload classes that have changed without restarting the app. Unfortunately intellij does not recompile automatically, when a source file changes you have to force it to compile (SHIFT + COMMAND + F9 on Mac). Eclipse users don't have this problem.

Download [spring-loaded](http://search.maven.org/remotecontent?filepath=org/springframework/springloaded/1.2.5.RELEASE/springloaded-1.2.5.RELEASE.jar) then start the main app with javaagent:

```
-javaagent:$PATH_TO_JAR/springloaded-1.2.5.RELEASE.jar -noverify

```

## The Code

This example comes straight from [Spring](https://spring.io/guides/gs/accessing-mongodb-data-rest/).

The first step is to create an **Entity** that you would like to expose as a _RESTful_ service.

```groovy
package codes.monkey.people

import org.springframework.data.annotation.Id

class Person {
    @Id
    String id

    String firstName, lastName
}


```

and now for the best part, create _Repository Interface_ and _Spring_ will take care of the rest! No implementation required.

```
package codes.monkey.people
//...

@RepositoryRestResource(collectionResourceRel = 'people', path = 'people')
interface PersonRepository extends MongoRepository<Person, String>{

    List<Person> findByLastName(@Param('name') String name)
}

```

**and that is it folks.** You now have a _HATEOAS RESTful_ API.

The server can be started through `gradlew`

```
 ./gradlew bootRun

```

To test it you can issue a _curl_ command to create a Person.

```shell
curl -i -X POST -H "Content-Type:application/json" -d '{  "firstName" : "Bilbo",  "lastName" : "Baggins" }' http://localhost:8080/people

```

The _RESTful_ resources can be naturally discovered in a true _HATEOAS_ fashion:

```shell
curl http://localhost:8080

```

results in

```javascript
{
  "_links" : {
    "people" : {
      "href" : "http://localhost:8080/people{?page,size,sort}",
      "templated" : true
    },
    "profile" : {
      "href" : "http://localhost:8080/profile"
    }
  }
}

```

Custom search queries like `findByLastName` will be available under `/people/search/findByLastName{?name}`.

## Tweaks

_Spring Boot_ supports configuration changes through properties or yaml files which can be activated through _Spring Profiles_. For example, to change the host that MongoDB run's on, you can edit `application.properties` or `application-$profile.properties` and add the following entry:

```
spring.data.mongodb.host=someotherhost

```

The _Spring Boot_ documentation contains a [list of supported configuration keys.](https://docs.spring.io/spring-boot/docs/current/reference/html/common-application-properties.html)

## Packaging

The Gradle build contains a task to build a single executable jar that contains all of the required dependencies to run the app.

```shell
./gradlew build
java -jar build/libs/spring-boot-restful-0.0.1-SNAPSHOT.jar

```

## Conclusion

Most of this post was taken up by getting the environment configured, that aside, with _Spring Boot_ you really do get a lot in return for your code. As this example shows, a full blown HATEOAS RESTful API with MongoDB backed storage for only a few lines of code by Java standards.

## References

[Accessing MongoDB Data with REST](http://spring.io/guides/gs/accessing-mongodb-data-rest)
