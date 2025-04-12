---
title: "C++ Tips : std::vector"
description: "std::vector"

categories: [programming, cpp]
tags: [cpp, ctad, std::vector]
# TAG names should always be lowercase

image:
  path: /assets/img/logo/cpp.png
---

<h1 style="text-align: center; font-size: 52px;">C++ Tips</h1>
<h2 style="text-align: center; font-size: 26px;">std::vector</h2>

---
## std::vector

```cpp
template<T, A = std::allocator<T>>
class Vector 
{
public:
	void push_back(const T&); 	// l-value
	void push_back(T&&); 		// r-value

	template<typename ...Args>
	void emplace_back(Args&& ...args); // Args&& universal ref
}
```
* Default allocator used by all STL containers if no user-defined provided.
* Dynamic and contiguous.
* Fast random access. `operator[]` , `.at()`
* Add elements via `push_back()` or `emplace_back()`
* If vector is destroyed, then elements dtor will also be called.
	* Valid for all containers.

---
## push_back() vs emplace_back()

* `push_back()`
	* Takes an already constructed object.
	* Rollback if push_back() throws. (No insertion.)
	* No return value
* `emplace_back()`
	* Forwards arguments to the constructor of the class using std::forward
	* Object is `constructed` through `allocator_traits::construct`.

---
## Tip-01

* Non-member iterator func == Member iterator func
	* Meaning, `std::crbegin(vec)` is equal to `vec.crbegin()`
* `size() == 0` for all moved containers

---
## Tip-02

```cpp
class A { A(int); }

vector<A> avec(100);
//syntax-error : A does not have def ctor
```

---
## Tip-03

```cpp
vector<int> x(10);
// x.size() -> 10

vector<int> y{10};
// y.size() -> 1, {} is a initializer-list

vector<int> z(10,5);
// size() -> 10 and all elements are 5

vector<int> t{10,5};
// size() -> 2 and elements are 10 and 5
```

---
## Tip-04 : CTAD

* vector supports CTAD (Class Template Argument Deduction)

```cpp
vector ivec{1,3,5};
// equals to -> vector<int> ivec{1,3,5};
```

---
## Tip-05 : Different containers can't convert implicitly

```cpp
std::list<int> x {1,3,5};

std::vector<int> y { x };
// syntax-error

std::vector<int> y { x.begin(), x.end() };
// OK
```

---
## Tip-06

```cpp
int a[] {1,3,5};

// before modern c++
std::vector<int> ivec( a, a + sizeof(a) / sizeof(*a) );

// after modern c++
std::vector<int> ivec2( std::begin(a), std::end(a) );

// std::size(y) == y.size()
// no distinct
```

---
## Tip-07 : Prefer stl algorithms instead of raw loop

```cpp
for(auto iter = vec.begin(); iter != vec.end(); ++iter) {...}

for(auto x : vec) {...}
// x -> *iter

for(size_t i{}; i < vec.size(); ++i) 
{
	vec.at(i);
	// if index is invalid, exception is thrown
}
```

---
## Tip-07

```cpp
std::vector<std::string> x { "A", "B" };
std::vector<std::string> y;

y.push_back( std::move(x[0]) );
y.push_back( std::move(x[1]) );

std::cout << x.size() << '\n';
// x.size() -> 2
std::cout << (x[0].empty() ? "EMPTY" : x[0]);
// Output : EMPTY
```

---
## vector::resize

```cpp

vector<int> x{1,2,3};

x.resize(5); // 1,2,3,0,0

x.resize(2); // 1,2

x.resize(6,4); // 1,2,4,4,4,4

x.resize(0) // clears the vector
// x.clear() == x.resize(0)
```

---
## vector::assign

```cpp

vector<char> c;
c.assign(5, 'a');

string s(6, 'b');

c.assign(s.begin(), s.end());
// b, b, b, b, b, b

c.assign( {'a', 'b' });
// a, b

```

---
## vector::insert

* returns iterator that points inserted value

```cpp

vector<int> i(2,10); // 10, 10

i.insert(i.begin(), 25); // 25, 10, 10

i.insert(i.begin(), 2, 50); // 50, 50, 25, 10, 10

i.insert(i.end(), {1,2,3}); // 50, 50, 25, 10, 10, 1, 2, 3

int a[] {4,5,6};

i.insert(i.begin(), a, a + size(a));
// 50, 50, 25, 10, 10, 1, 2, 3, 4, 5, 6

```

---
## vector::erase

* returns iterator pointing that followed the last element erased.

```cpp

vector<int> x{1,2,3,4,5};

// erase the first 3 elements:
x.erase ( x.begin(), x.begin() + 3 );

```

---
## vector::swap

```cpp

vector<string> a (100, "A");
vector<string> b (100, "B");

std::swap(a,b); // same with a.swap(b);
// no string copy. 
// just pointers swapped.

```

---
## vector::pop_back()

* O(1)
* Removes the last element

---
## vector::max_size

* O(1)
* Returns the maximum num of elems the container is able to hold.