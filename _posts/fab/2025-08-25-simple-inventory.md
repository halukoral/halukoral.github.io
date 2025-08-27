---
title: "Game Kit: Inventory System (C++)"
description: "A C++ based inventory system with customizable feature."

categories: [fab]
tags: [ue5, fab, marketplace]     # TAG names should always be lowercase

image:
  path: /assets/img/logo/fab.png
  
gallery:
  - url: assets/img/fab/inventory/1.png
    image_path: assets/img/fab/inventory/1.png
  - url: assets/img/fab/inventory/2.png
    image_path: assets/img/fab/inventory/2.png
  - url: assets/img/fab/inventory/3.png
    image_path: assets/img/fab/inventory/3.png
  - url: assets/img/fab/inventory/4.png
    image_path: assets/img/fab/inventory/4.png 
  - url: assets/img/fab/inventory/5.png
    image_path: assets/img/fab/inventory/5.png  
---

<h1 style="text-align: center; font-size: 52px;">Inventory System</h1>
---

{% include embed/youtube.html id='7OBLGP90T6w' %}

## Screenshots:
---

{% include gallery %}

## Fully customizable inventory System
---
Features:

*  Add item from level to the inventory
*  Remove item from the inventory and place to the level
*  Toggle Inventory menu
*  You can drop partially items or drop all items at once
*  You can store your items on chest.
*  Inventory menu has 3d object viewer

## How-To:
---

### 1. You must create trace channels and Collision presets like this:

  > Edit -> Project Settings -> Collision
  {: .prompt-tip }

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/inventory/T/1.png">
      <img src="/assets/img/fab/inventory/T/1.png"  width="500" alt="">
    </a>
  </figure>

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/inventory/T/2.png">
      <img src="/assets/img/fab/inventory/T/2.png"  width="500" alt="">
    </a>
  </figure>

### 2. Set BP_Item's mesh collision presets like this:

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/inventory/T/3.png">
      <img src="/assets/img/fab/inventory/T/3.png"  width="500" alt="">
    </a>
  </figure>

### 3. Lastly, BPC_Inventory should be like this:

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/inventory/T/4.png">
      <img src="/assets/img/fab/inventory/T/4.png"  width="500" alt="">
    </a>
  </figure>

### 4. To create a new item, you need to create data asset.

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/inventory/T/5.png">
      <img src="/assets/img/fab/inventory/T/5.png"  width="500" alt="">
    </a>
  </figure>

### 5. Select Item Definition for parent

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/inventory/T/6.png">
      <img src="/assets/img/fab/inventory/T/6.png"  width="500" alt="">
    </a>
  </figure>

### 6. Fill the sections

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/inventory/T/7.png">
      <img src="/assets/img/fab/inventory/T/7.png"  width="500" alt="">
    </a>
  </figure>

### 7. You can use this data asset inside of BP_Item

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/inventory/T/8.png">
      <img src="/assets/img/fab/inventory/T/8.png"  width="500" alt="">
    </a>
  </figure>

### 8. You can add item to the chest like this:

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/inventory/T/9.png">
      <img src="/assets/img/fab/inventory/T/9.png"  width="500" alt="">
    </a>
  </figure>