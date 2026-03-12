---
title: "How To Setup a Sonar Time Machine For an Angular Project"
description: "How to extract historical static analysis data from an Angular App into a new SonarQube server."
pubDate: 2020-08-24
heroImage: "/content/images/2020/08/sonarqube_post_header.jpg"
tags: ["development"]
---

## Overview

Code quality governance is not usually of a high priority when a project starts, but as the codebase grows and developers leave or join the team, the need for that may arise. Recently I faced a similar problem. I was interested not only in the immediate quality of the codebase but also in the quality trend since the start of the project. This post describes how to gather historical quality metrics from a pre-existing Angular project and collect it in [SonarQube](https://www.sonarqube.org/).

> “If you can't measure it, you can't improve it.”— Peter Drucker

## Run SonarQube locally

To get started quickly, SonarQube can run locally using Docker. The Dockerized distribution of SonarQube can run with an internal Database.

```
$ docker run --rm -it -p9000:9000 sonarqube:8.4.1-community

```

The UI should be available in the broser at localhost:9000 with a default username and password of _admin:admin_.

## Historical Data

The basic idea is to use `git log` to get one commit from every day since the beginning of the repository and then run the [sonar-scanner](https://www.npmjs.com/package/sonarqube-scanner) for each of those commits by checking it out in sequential order. The sonar analysis provides a `sonar.projectDate` parameter that can be set when performing the analysis, this is essential in telling SonarQube that the analysis being submitted is for a specific day (and not the current date and time).

Since checking out earlier commits of the Angular project won't have the sonar-scanner installed or the sonar-project.properties defined, I opted for installing the sonar-scanner globally and configuring the project parameters through the CLI when running the sonar-scanner.

```
$ npm install -g sonarqube-scanner

```

Picking one commit from every day since the beginning of the repository reduces the time it would take to get historical data into sonar, if you have an older repostiory, once a week may be enough. To pick one commit from every day `git log` can be combined with `awk` and `sort`:

```
$ git log --pretty="%ci %H" | awk '{ print $1,$4}' | awk '{arr[$1]=$2}END{for (a in arr) print a, arr[a]}' | sort
...
2014-09-18 6a3abf2366e2c32ce3460155903262fee01736c8
2014-09-19 afa761646472120edef1f9b01f219f125f20128e
2014-09-20 45f8a5119488d28bf90311b2dd7fc55ee6f7d92a
2014-09-21 e5224d2cb38f8eec93d6eb3dd576d5babdbb97b3
2014-09-24 57b3297bf65fb781848b0a72e84dbbadcb4b57ff
...

```

The command will produce list containing the first commit of every day and the date of the commit. The next step is to check out each of these commits (from oldest to latest) and run the tests with `--code-coverage` followed by `sonar-scanner` with the `-Dsonar.projectDate` set to the date of the commit.

The whole script:

Sample sonarqube dashboard:

![sonar_dashboard](https://res.cloudinary.com/monkey-codes/image/upload/v1598247942/sonarqube/successfulproject.png)

## Conclusion

This post shows a simple, yet effective way to get historical static analysis data into a new SonarQube server. The information may be useful in determining if the internal quality of the codebase is heading in the right direction.

Photo by [Djim Loic](https://unsplash.com/@loic?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/s/photos/clock?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
