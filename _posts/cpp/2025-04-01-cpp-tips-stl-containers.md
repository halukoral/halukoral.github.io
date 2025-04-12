---
title: "STL Tips"
description: Containers.

categories: [programming, cpp]
tags: [cpp, stl, containers]     # TAG names should always be lowercase

image:
  path: /assets/img/logo/cpp.png
---

<h1 style="text-align: center; font-size: 52px;">STL</h1>
<h2 style="text-align: center; font-size: 26px;">Containers</h2>
---

STL stands for Standard Template Library in C++. A set of template-based classes and functions.

<figure class="align-center" style="text-align: center;">
    <a href="/assets/img/cpp/std_remove/1.png">
        <img src="/assets/img/cpp/std_remove/1.png"  width="700" alt="">
    </a>
</figure>

---
## Sequence Containers

Members can be accessed sequentially.

* C-array
* `std::array (C++11)`
    * Fixed-size array

* `std::vector`
    * Dynamic array.
    * Fast rand access
    * Efficient: add to end

* `std::deque`
    * Double-ended queue.
    * Efficient: add/remove both begin, end.

* `std::list`
    * Double linked list.
    * Efficient: add/remove anywhere
    * No rand access

* `std::forward_list (C++11)`
    * Single linked list.
    * less memory since 1-way

---
## Associative Containers

Searching is fast `O(log n)` since members are `sorted`.

* `std::set`
    * elements are unique.

* `std::multiset`
    * duplicated elements are allowed.

* `std::map`
    * store elements with key-value pairs
    * keys are unique

* `std::multipmap`
    * duplicated keys are allowed.

---
## Unordered Associative Containers (C++11)

`Unsorted` but searching is still fast since hashed. 
Average : `O(1)`
Worst : `O(n)`

* `std::unordered_set`
* `std::unordered_multiset`
* `std::unordered_map`
* `std::unordered_multipmap`

---
## Container Containers

Special interfaces for sequential containers.

* `std::stack` (LIFO)
* `std::queue` (FIFO)
* `std::priority_queue`
