---
title: "STL : std::unique"
description: It's time to share the notes I took while studying C++.

categories: [programming, cpp]
tags: [cpp, stl]     # TAG names should always be lowercase

---

<h1 style="text-align: center; font-size: 52px;">STL</h1>
<h2 style="text-align: center; font-size: 26px;">std::unique</h2>
---

```cpp
#include <algorithm>
```

---
## std::unique

* `std::unique` used to remove `consecutive` duplicate elements from a range. 
* The duplicated elements are moved to the end, therefore deletion doesn't happen.
* For removing, call `container.erase(iter, container_end)

---
### Example 01: Remove only CONSECUTIVE duplicates are removed.

```cpp
std::vector<int> v = {1, 1, 2, 2, 2, 3, 3, 4, 2, 2, 5, 5, 6, 7};

auto new_end = std::unique(v.begin(), v.end());
v.erase(new_end, v.end());

for (int i : v) 
{
    std::cout << i << ' ';
}
// Output: 1 2 3 4 2 5 6 7 
```
Try [**here**](https://onlinegdb.com/Be9a5r6QN).


---
### Example 02: Remove all duplicates with std::unique

```cpp
std::vector<int> v = {1, 1, 2, 2, 2, 3, 3, 4, 2, 2, 5, 5, 6, 7};
std::sort(v.begin(), v.end());
auto new_end = std::unique(v.begin(), v.end());
v.erase(new_end, v.end());

for (int i : v) 
    std::cout << i << ' ';
// Output: 1 2 3 4 5 6 7 
```
Try [**here**](https://onlinegdb.com/kMPJSbgTE).

