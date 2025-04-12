---
title: "C++ Notes : Trailing Return Type"
description: "Trailing Return Type: auto add(int a, int b) -> int "

categories: [programming, cpp]
tags: [cpp, trailing return type]     # TAG names should always be lowercase

image:
  path: /assets/img/logo/cpp.png
---

<h1 style="text-align: center; font-size: 52px;">My C++ Notes</h1>
<h2 style="text-align: center; font-size: 26px;">Trailing Return Type</h2>

---

>These are the notes I took when I was learning c++. I wanted to share them with you in case anyone wants to benefit from them. Also if you think there are any mistakes, please don't hesitate to contact me.
{: .prompt-tip }


---
## Trailing Return Type

* A way to specify the return type of a function after the parameter list.
* Useful when the return type depends on the types of the parameters

```cpp
auto add(int a, int b) -> int 
{
    return a + b;
}
```

### Why it's important?

* When the return type depends on the parameter types.

```cpp
template <typename T, typename U>
decltype(a * b) multiply(T a, U b) 
{   // ERROR: 'a' and 'b' not yet declared
    return a * b;
}

template <typename T, typename U>
auto multiply(T a, U b) -> decltype(a * b) 
{
    // OK. Because decltype(a * b) needs a and b to already exist in the scope, 
    // which only happens after the parameter list.
    return a * b;
}
```