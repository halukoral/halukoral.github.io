---
title: "C++ Tips : Type Deduction"
description: Type deduction, Reference Collapsing.

categories: [programming, cpp]
tags: [cpp, type deduction, reference collapsing]     # TAG names should always be lowercase

image:
  path: /assets/img/logo/cpp.png
---

<h1 style="text-align: center; font-size: 52px;">My C++ Tips</h1>
<h2 style="text-align: center; font-size: 26px;">Type Deduction</h2>

---

## What is type deduction?

* Compiler's ability to automatically determine the type of a variable or expression.

### Example:

```cpp
auto i = 10; // int
auto d = 3.14; // double
auto b = i > d; // bool

int ar[] = {1, 2};
auto p1 = ar; // int*


int x = 10;
const int cx = 5;
auto a = x; // int
auto b = cx; // still int , NOT const int

int* const p2 = &x;
auto c = p2; // int*

const int* p3 = &x;
auto d = p3; // const int*

int& r = x;
auto b = r; // int , NOT int&
```

```cpp
int x = 1;
int* p1 = &x;
const auto p2 = p1; // int* const

const int cx = 1;
auto& y = cx; // const int&

int a = 1;
int* const b = &a;
auto& c = b; // int* const&

auto& s = "Hello"; // const char(&)[6]

auto x[]; // error: auto requires initializer
```

---
### The type of a variable can be a reference, but the type of an expression CAN'T

```cpp
int x = 1;
int& r1 = x;
const int& r2 = x;

auto a = r1; // int
auto b = r2; // int

int&& r = 10;
auto c = r; // int
```

---
### Type deduction : ternary operator 

```cpp
int x = 2, y = 4;
double z = 5.5;

auto i = x > 3 ? y : z;
// auto : double
// ternary operator is run-time process but
// type deduction is compile-time process
```

---
### Type deduction : array

```cpp
int arr[5] = {1, 2, 3, 4, 5};
auto p3 = arr; // int*
auto& p4 = arr; // int(&)[5]
```

---
### Type deduction : func pointer

```cpp
using F = int(int);
using FP = int(*)(int);

int foo() { return 0; }

auto fp1 = foo;   // int(*)(int)
auto fp2 = &foo;  // int(*)(int)
// They are same

auto f3 = foo;    // int(*)(int)
auto& f4 = foo;   // int(&)(int)
```

---
### Reference Collapsing

* `&` `&` becomes `&`

* `&` `&&` becomes `&`

* `&&` `&` becomes `&`

* `&&` `&&` becomes `&&`

```cpp
typedef int&  lref;
typedef int&& rref;
int n;

// & & -> &
lref&  r1 = n; // type of r1 is int&

// & && -> &
lref&& r2 = n; // type of r2 is int&

// && & -> &
rref&  r3 = n; // type of r3 is int&

// && && -> &&
rref&& r4 = 1; // type of r4 is int&&
```

#### Why do we need it?

* Reference collapsing enables perfect forwarding by preserving value categories.
* T&& can be called with both lvalue and rvalue.

```cpp
template<typename T>
void wrapper(T&& arg) 
{
    // T&& = forwarding reference
    process(std::forward<T>(arg)); 
}
```
<figure class="align-center" style="text-align: center;">
  <a href="/assets/img/cpp/type_deduction/1.png">
    <img src="/assets/img/cpp/type_deduction/1.png"  width="800" alt="">
  </a>
</figure>

<figure class="align-center" style="text-align: center;">
  <a href="/assets/img/cpp/type_deduction/2.png">
    <img src="/assets/img/cpp/type_deduction/2.png"  width="800" alt="">
  </a>
</figure>
