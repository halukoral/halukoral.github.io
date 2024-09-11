---
title: "Laser System (C++)"
excerpt: "Laser system is completely built using C++ and Niagara."
header:
  image: 
  teaser: assets/images/1.png
sidebar:
  - title: "Laser System"
    image: assets/images/1.png
    image_alt: "Laser System"
    text: "Number of C++ Classes : 2"
gallery:
  - url: assets/images/1.png
    image_path: assets/images/1.png
    alt: "Laser System"
  - url: assets/images/2.png
    image_path: assets/images/2.png
    alt: "Reflectable Laser System"
  - url: assets/images/3.png
    image_path: assets/images/3.png
    alt: "Triggerable Laser System"
tags:
  - marketplace-assets
  - unrealengine
  - ue5
---

{% include video id="sGE26TYSnE0" provider="youtube" %}

## Screenshots

{% include gallery %}

## Fully customizable Laser System

* Implemented in C++ for better performance.

* Beam and impact effects are created in Niagara. You can create your new beam and impact and easily integrate it into the system.

* Laser beams can be reflected from mirror material and also can be used as triggers.

## How-To

1.  You have to create a new trace channel for laser. 

    Edit -> Project Settings -> Collision
    {: style="text-align: center;"}

    <figure style="width: 300px" class="align-center">
      <a href="/assets/images/T/1.jpg"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/T/1.jpg" alt=""></a>
      <figcaption></figcaption>
    </figure> 

2.  You can create a new trace channel for the laser in the Collision panel as shown in the image below. 

    <figure style="width: 500px" class="align-center">
        <a href="/assets/images/T/2.jpg"><img src="/assets/images/T/2.jpg"></a>
    </figure>

3.  These settings are saved in DefaultEngine.ini under CollisionProfile section.

    You need to find out to which GameTraceChannel is set to LineTrace. In my case it is set to ECC_GameTraceChannel1.
    {: .notice--warning}

    ```cpp
    [/Script/Engine.CollisionProfile]
    +DefaultChannelResponses=(Channel=ECC_GameTraceChannel1,DefaultResponse=ECR_Block,bTraceType=True,bStaticObject=False,Name="LaserTrace")
    ```

4.  Finally, replace the value on line 16 of LaserEmitter.h with yours.

    ```cpp
    static ECollisionChannel ECC_LaserTrace	= ECollisionChannel::ECC_GameTraceChannel1;
    ```

And that's it... You can add the BP_LaserEmitter actor to the scene and can set its parameters as you like.

<figure style="width: 500px" class="align-center">
    <a href="/assets/images/T/3.jpg"><img src="/assets/images/T/3.jpg"></a>
</figure>

<figure style="width: 500px" class="align-center">
    <a href="/assets/images/T/44.jpg"><img src="/assets/images/T/4.jpg"></a>
</figure>