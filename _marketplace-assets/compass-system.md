---
classes: wide

title: "UI Kit : Compass System (C++)"
excerpt: "A C++ based compass system is a highly customizable compass UI designed to enhance player navigation in Unreal Engine projects."

header: 
  teaser: assets/images/Marketplace/Compass/0.png

gallery:
  - url: assets/images/Marketplace/Compass/0.png
    image_path: assets/images/Marketplace/Compass/0.png

  - url: assets/images/Marketplace/Compass/1.png
    image_path: assets/images/Marketplace/Compass/1.png

  - url: assets/images/Marketplace/Compass/2.png
    image_path: assets/images/Marketplace/Compass/2.png

  - url: assets/images/Marketplace/Compass/3.png
    image_path: assets/images/Marketplace/Compass/3.png

  - url: assets/images/Marketplace/Compass/4.png
    image_path: assets/images/Marketplace/Compass/4.png

  - url: assets/images/Marketplace/Compass/5.png
    image_path: assets/images/Marketplace/Compass/5.png

  - url: assets/images/Marketplace/Compass/6.png
    image_path: assets/images/Marketplace/Compass/6.png

  - url: assets/images/Marketplace/Compass/8.png
    image_path: assets/images/Marketplace/Compass/8.png

  - url: assets/images/Marketplace/Compass/9.png
    image_path: assets/images/Marketplace/Compass/9.png

tags:
  - marketplace-assets
  - unrealengine
  - ue5
---

## Video

{% include video id="OKWOXDhjOFU" provider="youtube" %}

## Screenshots

{% include gallery %}

## Fully customizable Compass System

A C++ based compass system is a highly customizable compass UI designed to enhance player navigation in Unreal Engine projects.

Key Features:

* Toggleable
  * The system allows you to toggle the compass on and off as needed.
* Vertical position indicators
  * Easily identify whether a location or object is above or below the player.
* Reactive to mysteries 
  * Reacts to hidden or mysterious areas, alerting players when they are near secrets or puzzles.
* Friend and Enemy Indicators
* Landmarks indicator
* Quest indicator
* Implemented in C++ for better performance.

### Simple :
You can see the location of the actors and the directions. 
  <figure style="width: 700px" class="align-center">
  <a href="/assets/images/Marketplace/Compass/Simple.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Compass/Simple.png" alt=""></a>
  </figure> 

### Complex :
In addition to the simple version, you can also see whether the actors are above or below you and how far away they are from you. 
  <figure style="width: 700px" class="align-center">
  <a href="/assets/images/Marketplace/Compass/Complex.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Compass/Complex.png" alt=""></a>
  </figure> 

## How-To :
Just one component (BP_Compass) you need to add to your character and that's all.

<figure style="width: 300px" class="align-center">
  <a href="/assets/images/Marketplace/Compass/T.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Compass/T.png" alt=""></a>
  <figcaption></figcaption>
</figure> 

* You can modify all assets via DA_Widget_Simple and DA_Widget_Complex. (These files are derived from the UDataAsset class.)
  * DA_Widget_Simple
  <figure style="width: 500px" class="align-center">
  <a href="/assets/images/Marketplace/Compass/DA_Widget_Simple.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Compass/DA_Widget_Simple.png" alt=""></a>
  </figure>
  
  * DA_Widget_Complex
  <figure style="width: 500px" class="align-center">
  <a href="/assets/images/Marketplace/Compass/DA_Widget_Complex.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Compass/DA_Widget_Complex.png" alt=""></a>
  </figure>  

* You can modify the compass attributes in BP_Compass.
  <figure style="width: 500px" class="align-center">
  <a href="/assets/images/Marketplace/Compass/BP_Compass.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Compass/BP_Compass.png" alt=""></a>
  </figure> 
    
