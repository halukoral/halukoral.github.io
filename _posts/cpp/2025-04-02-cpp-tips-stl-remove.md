---
title: "STL Tips : std::remove(_if)"
description: "std::remove, std::remove_if, std::erase"

categories: [programming, cpp]
tags: [cpp, stl, remove vowels]     # TAG names should always be lowercase

image:
  path: /assets/img/logo/cpp.png
---

<h1 style="text-align: center; font-size: 52px;">STL</h1>
<h2 style="text-align: center; font-size: 26px;">std::remove / std::remove_if / std::erase</h2>
---

```cpp
#include <algorithm>
```
---
## Can STL Algorithms Add/Remove From Containers?

<b>No.</b>

* STL algorithms do not directly add/remove. 
* Because STL algorithms work on iterators, which give access to the elements of the container.

<figure class="align-center" style="text-align: center;">
    <a href="/assets/img/cpp/std_remove/2.png">
        <img src="/assets/img/cpp/std_remove/2.png"  width="700" alt="">
    </a>
</figure>

---
## What about std::remove, std::remove_if, std::unique?

* They don't erase elements from the container. 
* Instead, they rearrange the elements you want to remove to the end. 
* Return the iterator to the new logical end. 
* If you really want to erase the element, then you then need to call container's erase.

---
### Example 01: Delete element from vector with vector's erase.

```cpp
std::vector<int> v = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};

// Removes 5.
v.erase(std::remove(v.begin(), v.end(), 5), v.end());
// Output : 0 1 2 3 4 6 7 8 9

// Removes all odd numbers.
v.erase(std::remove_if(v.begin(), v.end(), [](int val) { return val & 1; }), v.end());
// Output : 0 2 4 6 8
```
Try [**here**](https://onlinegdb.com/HgNDPKrej).

---
### Example 02:

```cpp
int main() 
{
    std::vector<int> v = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    
    auto end = std::remove(v.begin(), v.end(), 3);

    int count = std::distance(v.begin(), end) + std::distance(end, v.end());

    if ( count == v.size() )
    {
        std::cout << "EQUAL\n" ;
    }
}
```

Try [**here**](https://onlinegdb.com/NXyNlhWiz).


---
### Example 03: Delete element from vector with std::erase (with C++20)

```cpp
int main() 
{
    std::vector<int> v = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    
    std::erase(v, 3);

    std::cout << v.size() << '\n';
}
```
Try [**here**](https://onlinegdb.com/C4fKUWgvg).

---
### Example 04 : Remove vowels from a string

```cpp
std::string text = "Hello. This is a test string.\n";

text.erase(
    std::remove_if(text.begin(), text.end(), [](char c) {
        std::string vowels = "aeiouAEIOU";
        return vowels.find(c) != std::string::npos;
    }),
    text.end()
);

std::cout << "String without vowels: " << text << std::endl;
```

Try [**here**](https://onlinegdb.com/ZtwVLJtCbt).

---
### Example 05 : Remove vowels from a string (with C++20)

```cpp
std::string text = "Hello. This is a test string.\n";

std::erase_if(text, [](char c) {
    std::string vowels = "aeiouAEIOU";
    return vowels.find(c) != std::string::npos;
});

std::cout << text << std::endl;
```

Try [**here**](https://onlinegdb.com/wvdbUh-prM).