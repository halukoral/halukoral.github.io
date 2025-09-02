---
title: "Game Kit: quest System (C++)"
description: "A C++ based quest system with customizable feature."

categories: [fab]
tags: [ue5, fab, marketplace]     # TAG names should always be lowercase

image:
  path: /assets/img/logo/fab.png
  
gallery:
  - url: assets/img/fab/quest/1.png
    image_path: assets/img/fab/quest/1.png
  - url: assets/img/fab/quest/2.png
    image_path: assets/img/fab/quest/2.png
  - url: assets/img/fab/quest/3.png
    image_path: assets/img/fab/quest/3.png
  - url: assets/img/fab/quest/4.png
    image_path: assets/img/fab/quest/4.png 
---

<h1 style="text-align: center; font-size: 52px;">Quest System</h1>
---

{% include embed/youtube.html id='JztrQeeuIb8' %}

## Screenshots:
---

{% include gallery %}

## Fully customizable Quest System
---


## How-To:
---

### 1. Set game mode to GM_Quest

  Default pawn should be BP_QuestSystemCharacter. If you want to use your own character then you must add BPC_QuestManager to your character.

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/quest/T/1.png">
      <img src="/assets/img/fab/quest/T/1.png"  width="500" alt="">
    </a>
  </figure>

### 2. You can add quests via DT_Quest (data table)

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/quest/T/2.png">
      <img src="/assets/img/fab/quest/T/2.png"  width="500" alt="">
    </a>
  </figure>

### 3. For now, you can get the quest from the BP_QuestGiver

  You should place the BP_QuestGiver to the level and set the QuestID on the BP_QuestGiver. Please note that it must be the same as the QuestID in DT_Quest.

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/quest/T/3.png">
      <img src="/assets/img/fab/quest/T/3.png"  width="500" alt="">
    </a>
  </figure>

### 4. if your quest's type is collect item then you should us BP_Collectable as a parent class.

  Again, You should place the BP_Collectable to the level and set objectiveID inside of BP_Collectible. Please note that it must be the same as the objectiveID in DT_Quest.

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/quest/T/4.png">
      <img src="/assets/img/fab/quest/T/4.png"  width="500" alt="">
    </a>
  </figure>

### 5. if your quest's type is reach the location then you should use BP_Destination as a parent class for this quest.

  The above applies here as well.

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/quest/T/5.png">
      <img src="/assets/img/fab/quest/T/5.png"  width="500" alt="">
    </a>
  </figure>

### 6. Press TAB to see quest logs.

  <figure class="align-center" style="text-align: center;">
    <a href="/assets/img/fab/quest/T/6.png">
      <img src="/assets/img/fab/quest/T/6.png"  width="500" alt="">
    </a>
  </figure>
