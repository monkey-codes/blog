---
title: "Tech Interview CheatSheet -  Lists, Search & Sort"
description: "An overview of Binary Search algorithms, including Bubble, Merge and Quick Sort."
pubDate: 2017-05-16
updatedDate: 2018-06-04
heroImage: "/content/images/2017/05/tech_interview_cheatsheet.jpg"
tags: ["Algorithms","development"]
---

Every developer will, or have at some point, encountered this dreadful experience... the intimidating tech interview. In this series of posts I will cover some of the typical topics that arise in tech interviews, starting with _searching_ and _sorting_ algorithms most commonly applied to _List_ based collections.

> “Before anything else, preparation is they key to success.”— Alexander Graham Bell

## Arrays

_Arrays_ are probably the most common data structure, found in the majority languages used today. Generally 0 based indexes are used (the first element is at index 0).

Mainly 2 types exist:  
**Linear arrays** which are static in size, usually defined during construction.

**Dynamic arrays** that contain extra space reserved for new elements, once it is full elements are copied into a larger array.

Arrays are excellent for looking up values by index, which is performed in constant time, [$O(1)$](https://en.wikipedia.org/wiki/Big_O_notation), but bad for inserting and deleting elements. The cause for this is that elements need to be copied to make space for new elements or to close the gap caused by deletion. Insert and delete operations are performed in linear time $O(n)$  
![array insert](https://res.cloudinary.com/monkey-codes/image/upload/v1494831769/algorithms/array_insert_vjgpaz.gif)

## Linked Lists

The basic building block of a _Linked List_ is a _node_. A _node_ contains a single value and a reference to the next _node_ in the list. This dynamic data structure is optimised for _insert_ and _delete_ operations, which happen in $O(1)$

In contrast to _Arrays_, index based lookup & searching performance is poor, $O(n)$, since potentially the entire list will have to be traversed to find an element.

In a **Doubly linked list**, each _node_ has a reference to the next and previous node. **Circularly linked lists** have their first and last nodes connected.

![linked list](https://res.cloudinary.com/monkey-codes/image/upload/v1494838661/algorithms/linked_list_jncfr9.gif)

## Stacks

A _Stack_ provides quick ( $O(1)$ ) access to the _head_ (first) element and is an example of a **LIFO** (Last In First Out) data structure. Elements are _pushed_ onto the stack and _popped_ off. A _Stack_ can be implemented as a _Linked List_ where the _push_ operation inserts at the _head_ and _pop_ removes from the head.

## Queues

A _Queue_ is an example of a **FIFO** (First In First Out) data structure. The oldest and newest elements are called the _Head_ and _Tail_ respectively. Elements are _Enqueued_ to the _Tail_ of the queue and _Dequeued_ from the _Head_. A _Queue_ can be implemented using a _Linked List_, by keeping track of both the _Head_ and _Tail_.

A _Deque_ is a double ended _Queue_, enqueueing or dequeueing can happen on either end.

_Queues_ have the same performance characteristics as _Linked Lists_, $O(1)$ for enqueue/dequeue but $O(n)$ for searching.

## Searching & Sorting

### Binary Search

Given an array of sorted numbers, and _x_ (the number being searched for). Recursively look at the element in the middle of the array, repeat on the left side if x is smaller than the middle element or on the right if its bigger. For even number arrays you will have to choose whether to use the lower or upper number as the "middle".

Example:  
Given \[1,2,3,4,5,6,7,8\] and _x_ = 10:

1.  Split the array, using the lower element as the middle for even sized arrays.
2.  _Iteration 1_: Middle = 4, 10 > 4, search the upper half \[5,6,7,8\].
3.  _Iteration 2_: Middle = 6, 10 > 6, search the upper half \[7,8\].
4.  _Iteration 3_: Middle = 7, 10 > 7, search \[8\].
5.  _Iteration 4_: 10 > 8, thus the array does not contain the target value x.

> “For interviews, memorize the time efficiency of well know algorithms and learn to spot them”— code monkey

#### Calculating Complexity

When faced with an unknown algorithm, one trick is to use a table that tracks the number of iterations for each increase in the input size of the array. Below is a table that applies this technique to the binary search algorithm. Upon closer inspection it roughly looks like the number of iterations increase when the input size doubles:

$$\\begin{array}{|c|c|}  
\\hline n & 0 & 1 & 2 & 3 & 4 & 5 & 6 & 7 & 8 \\\\ \\hline  
\\text{iterations} & 0 & 1 & 2 & 2 & 3 & 3 & 3 & 3 & 4 \\\\ \\hline  
\\end{array}$$

$$\\begin{align}  
n & \\approx 2^\\text{iterations - 1} \\  
\\text{iterations}& \\approx log\_2 (n) + 1\\  
complexity & \\approx O(log\_2(n)+1) \\  
& \\approx O(log(n))\\  
\\end{align}$$

Simple python implementation (iterative):

### Bubble sort

_Bubble sort_ is the simplest of sorting algorithms and probably the one most developers will naturally come up with when they are first faced with the problem. The algorithm basically compares two adjacent elements and swaps them if the order is wrong. This process is repeated until no more _swaps_ happen. Worst case scenario is when the input is in reverse order, that will result in every element being compared to every other element, $O(n^2)$. On the up side, it is an in place sorting algorithm that requires no extra space, $O(1)$.

### Merge sort

[Merge sort](/analyzing-the-merge-sort-algorithm/) is an example of a _Divide and Conquer_ algorithm. Recursively split the input array until you have arrays with $\\le 2$ elements. Then merge 2 adjacent arrays by comparing the first elements, since each array is already sorted. Rinse and Repeat.

The complexity of the algorithm would roughly be $\\text{no\_comparisons} \\times \\text{no\_iterations}$. The number of comparisons (worst case) is approximately 1 less than the input size. To calculate the number of iterations, the same trick used in _Binary Search_ can be applied, namely map the number of iterations against the input size and try to spot a pattern.

$$  
\\begin{array}{|c|c|}  
\\hline & 2^0 & 2^1 & & 2^2 & & & & 2^3 & \\\\ \\hline  
\\hline n & 1 & 2 & 3 & 4 & 5 & 6 & 7 & 8 & 9 \\\\ \\hline  
iterations & 0 & 1 & 2 & 2 & 3 & 3 & 3 & 3 & 4 \\\\ \\hline  
\\end{array}$$

$$\\begin{align}  
n& \\approx 2^\\text{iterations} \\  
\\text{iterations}& \\approx log(n) \\  
\\text{comparisons}& \\approx n \\  
complexity& \\approx O(\\text{comparisons} \\times \\text{iterations}) \\  
& \\approx O(n \\ log(n)) \\  
\\end{align}$$

### Quick sort

Pick a _pivot_ element at random (convention picks the last number), then move all the numbers less than the pivot to the left of the pivot and all numbers larger to the right. Keep doing this recursively for the lower numbers to the left of the _pivot_ and the higher numbers to the right of the _pivot_.

_Quick Sort_ is an in place sorting algorithm with a space complexity of $(O(1))$.

Worst case time complexity is when the _pivot_ does not split the array roughly in half. If the _pivot_ belongs at the end, then you will end up comparing it to all the other numbers without swapping. This is compounded if the 2nd number has the same scenario. Thus worst case complexity for _Quick Sort_ is the same as _Bubble Sort_, $O(n^2)$. Average case is $O(n\\ log(n))$. _Quick Sort_ does offer some opportunity for optimisation, for example the splits can run in parallel.

In part 2 of this series I will look at [hash functions & maps](/tech-interview-cheatsheet-maps-hashing/).

## References

[https://gist.github.com/TSiege/cbb0507082bb18ff7e4b](https://gist.github.com/TSiege/cbb0507082bb18ff7e4b)
