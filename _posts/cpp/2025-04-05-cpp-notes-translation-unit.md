---
title: "C++ Notes : Translation Unit"
description: Translation unit, internal linkage, external linkage.

categories: [programming, cpp]
tags: [cpp, translation unit, internal linkage, external linkage]     # TAG names should always be lowercase

image:
  path: /assets/img/logo/cpp.png
---

<h1 style="text-align: center; font-size: 52px;">My C++ Notes</h1>
<h2 style="text-align: center; font-size: 26px;">Translation Unit</h2>

---

>These are the notes I took when I was learning c++. I wanted to share them with you in case anyone wants to benefit from them. Also if you think there are any mistakes, please don't hesitate to contact me.
{: .prompt-tip }


---
## Translation Unit

* Consist of SOURCE file after it has processed by PREPROCESSOR.
* Header files are literally included.
* All macros are expanded and conditional compilation is resolved.
* Each translation unit is compiled independently.

## External Linkage

* function or global variable is accessible throughout your program

## Internal Linkage

* ONLY accessible in 1 translation unit

You can explicitly control the linkage by using `extern` and `static` keyword.
Default linkage: 
* non-const -> extern
* const -> intern

```cpp
// global scope.

int i; // extern
extern const int j; // explicitly extern

const int x; // intern 
static int y; // explicitly intern

int f(); // extern 
static int sf(); // explicitly intern 

```

It is better to use `unnamed namespace` for making explicitly intern.

Stack overflow:  [**What is external linkage and internal linkage?**](https://stackoverflow.com/questions/1358400/what-is-external-linkage-and-internal-linkage/1358622#1358622).
