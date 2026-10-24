---
title: "Blogging by Voice: Wispr Flow, Markdown, and GitHub Pages"
description: "What happened when I tried writing blog posts by speaking them with Wispr Flow and committing Markdown straight to my Astro site on GitHub."
pubDate: 2026-10-24
draft: true
tags: ["ai"]
---

## Why I Tried This

- The friction of sitting down to type a post
- The hope that speaking could make blogging faster and more natural
  
I've been trying to blog on and off for quite a few years and I've found that it takes quite a lot of effort and friction to sit down, to collect your thoughts, and to refine writing a blog post. Hence these blog posts come out slowly.

My personality makes me want to polish the content a lot more than is necessary for a blog that is really just about capturing the things that I learn and sharing it. In that sense I decided to try using Wispr Flow on my mobile device to dictate a blog post and this post is about capturing my experience. 

## The Setup

- Wispr Flow for dictation
- Writing Markdown directly in GitHub's web editor
- Astro building the site and deploying to GitHub Pages on each commit

The basic setup is that I use Wispr Flow on my mobile device for dictation and have it write a Markdown file directly in a branch on my GitHub repo using my browser. The idea is that once the branch is merged the post will be built and published to my blog post automatically using GitHub Actions. There is definitely some clunkiness over here. Using the browser to open up the GitHub website and then creating a branch and a new file in there feels very unnatural. I would have to investigate alternative more natural options for creating the content and then automating the workflow into GitHub. 

## The Workflow in Practice

- Opening the repo and creating a new `.md` file
- Adding the frontmatter
- Dictating the body
- Committing to publish

- I open a new branch in GitHub on the browser and then create a new Markdown file in the content folder for the blog post.
- I use a Claude session to determine the outline of the blog post, which helps me to collect and organise my thoughts and give the blog post some structure. Then I copy the outline into the newly created Markdown file.
- Then I sequentially move through each section in the Markdown file and dictate, using Wispr Flow, paragraph by paragraph, what I want to say under each section of the outline of the blog post.
- In its most basic form then I would commit and publish although I suspect that this would be very rough and may need an added rework for it to be less rough around the edges. 
 

## What Worked Well

- Getting ideas onto the page quickly
- The conversational tone dictation produces
- No local tooling required

The first thing that works well is that it helps me to get the thoughts out of my head and into a file very quickly and there is also less friction. I tend to overthink what I'm trying to say when typing so with some practise I think speaking will be a lot easier. 

I also think that using my voice and talking may produce a tone in the blog post that is more natural and more human than what my blog posts tend to be like. 

Wispr Flow itself works exceptionally well, given that I have a very strong accent and English is my second language. It deals with it perfectly. I have not noticed it making any mistakes. I even tried speaking Afrikaans in a different session and it picked up the words perfectly. 

## What Didn't Work

- Dictating Markdown syntax and frontmatter
- Fixing transcription quirks
- GitHub's editor feeling basic for longer writing
- Waiting on builds to preview changes

- I tried to create the blog frontmatter snippet in Wispr Flow and have it insert that into the blog post. That did not work at all. It simply repeated the words that I was saying. I would have to investigate how snippets work further.
- Because I'm speaking I also am rambling a bit. I am not quite used to speaking into my phone and dictating. I think that might get better with practise. It does feel a bit awkward at the moment. 

## Tips and Tweaks

- Keep a frontmatter template to copy
- Dictate first, format second
- Wispr Flow settings that helped

- The Wispr Flow free account is pretty much enough to just do one blog post. You'd probably need a paid account to do this seriously.
- Use AI to set up an outline of the blog post before talking. Simply just starting on an empathy file and talking will definitely not work or it did not work for me. 


## Verdict

- Will I keep using this workflow?
- What I'd change
- Who it suits

- Since I wrote this blog post using this method, I think I'm going to keep trying for a while before deciding whether it is the way to go. I think there's something here. I think I might blog more doing this even though the quality of the blog post might be lower than what I used to write.
- Again I think editing directly in the browser on the GitHub website may not be the ideal approach for this.
- I may experiment with a different workflow where I do a rough version of the blog post like this and then have it go through an AI workflow to polish and correct and maybe sharpen the language afterwards. 
