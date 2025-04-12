---
title: "C++ Tips : decltype"
description: decltype.

categories: [programming, cpp]
tags: [cpp, type deduction, decltype]     # TAG names should always be lowercase

image:
  path: /assets/img/logo/cpp.png
---

<h1 style="text-align: center; font-size: 52px;">My C++ Tips</h1>
<h2 style="text-align: center; font-size: 26px;">decltype</h2>

---
## Decltype

* C++11

* deduce the type of value/expression at compile time.
* unevaluated context (No opcode generated)

---
## decltype(value) && decltype(expression)

* if expr `PR` value, result: `T`
* if expr `L`  value, result: `T&`
* if expr `X`  value, result: `T&`

```cpp
#include <iostream>
#include <type_traits>

int main() 
{
	std::cout << std::boolalpha;

	int x = 10;
	std::cout << std::is_same_v<decltype(x), int> << '\n';
	
	std::cout << std::is_same_v<decltype(++x), int&> << '\n';
	std::cout << std::is_same_v<decltype(x++), int> << '\n';

	std::cout << std::is_same_v<decltype( (x) ), int&> << '\n'; // important (x) -> expression
	std::cout << std::is_same_v<decltype(x + 4 ), int> << '\n';
	
	const int cx = 5;
	std::cout << std::is_same_v<decltype(cx), const int> << '\n';

	const int* ptr = &x;
	std::cout << std::is_same_v<decltype(ptr), const int*> << '\n';

	const int* const cptr = &x;
	std::cout << std::is_same_v<decltype(cptr), const int* const> << '\n';

	int arr[5];
	std::cout << std::is_same_v<decltype(arr), int[5]> << '\n';
	std::cout << std::is_same_v<decltype(arr), int[6]> << '\n'; // FALSE

	int* p = &x;
	std::cout << std::is_same_v<decltype(p), int*> << '\n';
	std::cout << std::is_same_v<decltype(*p), int&> << '\n';
}
```
Try [**here**](https://onlinegdb.com/-ArGQ0DRL).

---
### decltype vs auto

* `auto` deduces the value type
* `decltype` deduces the exact type

```cpp
int x = 5;
int& ref = x;

auto a = ref;          // int
decltype(ref) b = x;   // int&
```
