---
classes: wide

title: "Portal System (C++)"
excerpt: "A C++ based portal system with customizable feature."

header:
  teaser: assets/images/Marketplace/Portal/1.png

gallery:
  - url: assets/images/Marketplace/Portal/1.png
    image_path: assets/images/Marketplace/Portal/1.png
    
  - url: assets/images/Marketplace/Portal/2.png
    image_path: assets/images/Marketplace/Portal/2.png

  - url: assets/images/Marketplace/Portal/3.png
    image_path: assets/images/Marketplace/Portal/3.png

  - url: assets/images/Marketplace/Portal/4.png
    image_path: assets/images/Marketplace/Portal/4.png

tags:
  - portal
  - marketplace-assets
  - unrealengine
  - ue5
---

## Video

{% include video id="KzYXj3Pxhuk" provider="youtube" %}

## Screenshots

{% include gallery %}

## Fully customizable Portal System

Current Limitations:
* Lumen not supported.
* Recursive rendering is performance killer right now. I want to do a performance update soon.

Features:
* 1:1 Rendering
* Smooth player and objects teleport with velocity
* Smooth 3rd person camera transitions
* Contains Laser System, Lasers can interact with portals
* Cloned character and objects on linked portal
* Projectile pass through the portal
* Recursion support (update for performance coming soon)

## How-To

1.  You must enable "Support global clip plane for Planar reflections"

    Edit -> Project Settings -> Rendering
    {: style="text-align: center;"}

    <figure style="width: 900px" class="align-center">
      <a href="/assets/images/Marketplace/Portal/T/1.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Portal/T/1.png" alt=""></a>
    </figure> 

2.  Set near clip plane to 0.1

    <figure class="align-center">
        <a href="/assets/images/Marketplace/Portal/T/2.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Portal/T/2.png" alt=""></a>
    </figure>

3.  You must create object and trace channels and Collision presets like this:
    Edit -> Project Settings -> Collision
    {: style="text-align: center;"}

    <figure style="width: 300px" class="align-center">
      <a href="/assets/images/Marketplace/Portal/T/3.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Portal/T/3.png" alt=""></a>
    </figure>

    <figure style="width: 300px" class="align-center">
      <a href="/assets/images/Marketplace/Portal/T/4.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Portal/T/4.png" alt=""></a>
    </figure> 
    
    <figure style="width: 300px" class="align-center">
      <a href="/assets/images/Marketplace/Portal/T/5.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Portal/T/4.png" alt=""></a>
    </figure> 

4.  These settings are saved in DefaultEngine.ini under CollisionProfile section.

    You need to find out to which GameTraceChannel is set to your custom traces. In my case it is set to like this.
    {: .notice--warning}

    ```cpp
    [/Script/Engine.CollisionProfile]
    +DefaultChannelResponses=(Channel=ECC_GameTraceChannel1,DefaultResponse=ECR_Block,bTraceType=True,bStaticObject=False,Name="LaserTrace")
    +DefaultChannelResponses=(Channel=ECC_GameTraceChannel2,DefaultResponse=ECR_Ignore,bTraceType=True,bStaticObject=False,Name="PortalTrace")
    +DefaultChannelResponses=(Channel=ECC_GameTraceChannel3,DefaultResponse=ECR_Block,bTraceType=False,bStaticObject=False,Name="PortalWall")
    +DefaultChannelResponses=(Channel=ECC_GameTraceChannel4,DefaultResponse=ECR_Block,bTraceType=False,bStaticObject=False,Name="PortalActor")
    +DefaultChannelResponses=(Channel=ECC_GameTraceChannel5,DefaultResponse=ECR_Block,bTraceType=False,bStaticObject=False,Name="Projectile")    
    ```
5. You can modify all assets via DA_Widget_Simple and DA_Portal. (These files are derived from the UDataAsset class.)
    <figure style="width: 800px" class="align-center">
      <a href="/assets/images/Marketplace/Portal/T/6.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Portal/T/6.png" alt=""></a>
    </figure> 

    <figure style="width: 800px" class="align-center">
      <a href="/assets/images/Marketplace/Portal/T/7.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Portal/T/7.png" alt=""></a>
    </figure> 

6. And that's it... You can set the default pawn class to BP_PortalCharacter.
    <figure style="width: 800px" class="align-center">
      <a href="/assets/images/Marketplace/Portal/T/8.png"><img src="{{ site.url }}{{ site.baseurl }}/assets/images/Marketplace/Portal/T/8.png" alt=""></a>
    </figure> 
