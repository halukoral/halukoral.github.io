---
title: "C++ interviews questions - Part 01"
description: C++ questions I encountered in interviews for game developer job postings.

categories: [programming, cpp, interview questions]
tags: [cpp]     # TAG names should always be lowercase

---

<h1 style="text-align: center; font-size: 52px;">C++ Interview Questions</h1>
<h2 style="text-align: center; font-size: 26px;">Part 01</h2>

---
## Q1: What is virtual destructor()? Why we need it?

Without it, deleting a derived class object through a base-class ptr results in undefined behavior (UB) because the derived class destructor is never called, leading to resource leaks.

Always declare a destructor as virtual if a class has at least one virtual function or is meant to be inherited.

```cpp
class A {
public:
    ~A() { std::cout << "A dtor\n"; }
};

class B : public A {
public:
    ~B() { std::cout << "B dtor\n"; }
};

int main() 
{
    A* a = new B();
    delete a; // Only Base destructor called, Derived destructor missed
}
```

Try [**here**](https://onlinegdb.com/pi5Uk_X_i).


---
## Q2: How will you take a decision of choosing array vs linked list for a particular implementation?

* for quick access, prefer array
* for frequent insert/remove, prefer linked list

<figure class="align-center" style="text-align: center;">
    <a href="/assets/img/cpp/q-01/1.png">
        <img src="/assets/img/cpp/q-01/1.png"  width="700" alt="">
    </a>
</figure>

---
## Q3: What is smart pointers? Why we need it?

* C++11
* RAII pattern
* With them, manage the lifetime of dynamically allocated memory automatically.
* Without them, you have to be careful. If you forget to `delete`, you get a mem leak.
* Reducing the chances of memory leaks and dangling pointers.

### std::unique_ptr 

* Exclusive ownership. Only 1 can own the resource.
* Object deleted when it goes out of scope.

### std::shared_ptr

* Shared ownership. Multiple can own the resource.
* Ref counted. Object deleted when ref count == 0

### std::weak_ptr

* for breaking reference cycle.
* does not increase the ref count.

### What is Cyclic References?

```cpp
struct B;

struct A { std::shared_ptr<B> bptr; };
struct B { std::shared_ptr<A> aptr; };

int main() 
{
    std::shared_ptr<A> a = std::make_shared<A>();
    std::shared_ptr<B> b = std::make_shared<B>();

    a->bptr = b;
    b->aptr = a;  // circular reference

    // memory for A and B is never freed!
}

```

#### Solution:

```cpp
struct B;

// decide who owns who 
struct A { std::shared_ptr<B> bptr; };
struct B { std::weak_ptr<A> aptr; };
```

#### Example: weak_ptr

* taken directly from [**cppreference.com**](https://en.cppreference.com/w/cpp/memory/weak_ptr).

```cpp
#include <iostream>
#include <memory>
 
std::weak_ptr<int> gw;
 
void observe()
{
    std::cout << "gw.use_count() == " << gw.use_count() << "; ";
    // we have to make a copy of shared pointer before usage:
    if (std::shared_ptr<int> spt = gw.lock())
        std::cout << "*spt == " << *spt << '\n';
    else
        std::cout << "gw is expired\n";
}
 
int main()
{
    {
        auto sp = std::make_shared<int>(42);
        gw = sp;
 
        observe();
    }
 
    observe();
}
```

---
## Q4: Smart pointers as a function argument?

<figure class="align-center" style="text-align: center;">
    <a href="/assets/img/cpp/q-01/2.png">
        <img src="/assets/img/cpp/q-01/2.png"  width="700" alt="">
    </a>
</figure>

```cpp

void TransferOwnership(std::unique_ptr<int> ptr) {
    std::cout << "Value: " << *ptr << "\n";
}

void ReadOnly(const std::unique_ptr<int>& ptr) {
    std::cout << "Read: " << *ptr << "\n";
}

void ProcessShared(std::shared_ptr<int> ptr) {
    std::cout << "Shared Value: " << *ptr << "\n";
    // ref count increased
}

void ProcessSharedRef(const std::shared_ptr<int>& ptr) {
    std::cout << "By ref: " << *ptr << "\n";
    // ref count WILL NOT increased
}

void CheckWeak(std::weak_ptr<int> weak) {
    if (auto locked = weak.lock()) 
        std::cout << "Value: " << *locked << "\n";
    else
        std::cout << "Pointer expired.\n";
}

int main() {
    std::unique_ptr<int> myPtr = std::make_unique<int>(42);
    TransferOwnership(std::move(myPtr));  // Ownership is transferred
    return 0;
}

```