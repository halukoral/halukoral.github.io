---
title: "C++ Tips : String"
description: "string, string::npos, sso, sbo, string_view."

categories: [programming, cpp]
tags: [cpp, string, string::npos, sso, sbo, string_view]
# TAG names should always be lowercase

image:
  path: /assets/img/logo/cpp.png
---

<h1 style="text-align: center; font-size: 52px;">C++ Tips</h1>
<h2 style="text-align: center; font-size: 26px;">std::string, std::string_view</h2>

---
## std::string

* capacity increases but does not decrease.
* if you want to reduce capacity, use shrink_to_fit() 

```cpp
std::string s;

for(100'000)
	s.push_back('A');
// there is more than one reallocation.
// if you know the size, use reserve() first
```

```cpp
#include <iostream>
#include <string>

int main() 
{
	std::string str;
	char arr[] = "Hello World!";

	str.assign(arr, 5);
	std::cout << str << '\n'; // Hello

	std::string s1(12, 'A');
	std::cout << s1 << '\n'; // AAAAAAAAAAAA

	std::string s2{52, 'A'};
	std::cout << s2 << '\n'; // 4A
}
```

---
## std::string::npos

* used to indicate that no position found.
* functions like .find(), .rfind(), .find_first_of() return an index if found.
* otherwise they return `npos`.
* prefer to use `.at()` rather than `operator[]`
* `operator[]` won't thow. if pos > size, the behaviour is undefined.
* `.at()` will throw `std::out_of_range`, if pos >= size.

---
## careful with .c_str()

```cpp
#include <iostream>
#include <string>

int main() 
{
	std::string str = "Hi ";
	auto p = str.c_str();
	str += "Hello World! Hello World! Hello World! Hello World!";

	std::cout << p << '\n'; 
	// the behaviour is undefined, if reallocation happens.
}
```

---
## SSO

* Short String Optimization
* Short strings are stored directly inside the `std::string` without needing mem alloc.
* It saves both mem allocs and cpu cycles.
* Buffer's size depends on compiler and platform.
* SSO is just SBO for strings

```cpp
// std::string looks something like this
struct StringImpl {
    union {
        char* heap_ptr;          // for large strings
        char sso_buffer[15];     // for short strings (implementation-defined size)
    };
    size_t size;
    size_t capacity;
};
```

---
## SBO

* Small Buffer Optimization
* A class stores small data directly inside itself, avoiding heap allocation for small sizes (usually a few bytes).
* It saves both mem allocs and cpu cycles.
* Buffer's size depends on compiler and platform.

---
## How to detect SBO in action?

* Use sizeof(std::function<...>) to check internal buffer size.
* Use tools like Valgrind
* Overload new and delete to log

---
## std::string_view

* `#include <string_view>`
* C++17
* Read-only.
* A non-owning view of a string.
* No allocate/copy memory.
* Just pointing the data.
* Faster, really faster.
* Dangling ref may happen, so be careful!

```cpp
std::string_view sv;
{
    std::string temp = "hello";
    sv = temp;  
} 

// temp is destroyed so undefined behavior happens.
std::cout << sv << "\n";
```

<figure class="align-center" style="text-align: center;">
    <a href="/assets/img/cpp/string/1.png">
        <img src="/assets/img/cpp/string/1.png"  width="900" alt="">
    </a>
</figure>

Prefer to use swap functions for strings and containers. It is very efficient as it only changes pointers. Also use STL algorithms as much as possible.

```cpp
std::string str;
// by this, you can read an entire line of text (including spaces)
getline(std::cin, str);

// Example: str -> Hello World
```