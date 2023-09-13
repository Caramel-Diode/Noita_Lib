# NoitaLib
基于Web Component技术构建的Noita 游戏UI元素工具库
目前法术数据已经跟进至beta版

---
## 引入
### 通过html scrpt元素引入
```html
<script src="noitaLib"></script>
```
### 通过js impot语句引入
```js
// ES6 module
import noitaLib from "noitaLib";
```
## 在`html` 中使用
### 法术
```html
<noita-spell
    spell.id="法术ID"
    spell.name="法术名(伟大汉化)"
    spell.expression="法术查询表达式"
    display="显示模式"
><noita-spell/>
```
### 图标模式
#### 通过 `id/name` 指定单个法术
```html
<noita-spell spell.id="BOMB" display="icon"></noita-spell>
```
![](img/icon%20BOMB.webp)
#### 通过 `expression` 指定多个法术
```html
<noita-spell spell.expression="#type_passive" display="icon"></noita-spell>
```
![](img/icon%20passive.webp)
### 面板模式
#### 通过 `id/name` 指定单个法术
```html
<noita-spell spell.id="BOMB" display="panel"></noita-spell>
```
![](img/panel%20BOMB.webp)
#### 通过 `expression` 指定多个法术
```html
<noita-spell spell.expression="#type_passive" display="panel"></noita-spell>
```
![](img/panel%20passive.webp)

### 法杖
```html
<noita-wand
    wand.name="法杖名"
    wand.shuffle="乱序(true/false)"
    wand.draw="抽取数"
    wand.fire-rate-wait="施放延迟"
    wand.reload-time="充能时间"
    wand.capacity="容量"
    wand.mana-max="法力上限"
    wand.mana-charge-speed="法力恢复速度"
    wand.spread-degrees="散射"
    wand.speed-multiplier="投射速度倍数"
    wand.static-spells="始终施放法术(法术序列表达式)"
    wand.dynamic-spells="填充法术(法术序列表达式)"
    display="显示模式"
><noita-wand/>
```
#### 图标模式
- [ ] 待实现
#### 面板模式
```html
<noita-wand
    display="panel"
    wand.name="幽魂闪光"
    wand.capacity="26"
    wand.draw="1"
    wand.fire-rate-wait="15"
    wand.reload-time="0"
    wand.shuffle="false"
    wand.spread-degrees="0"
    wand.speed-multiplier="1"
    wand.mana-charge-speed="600"
    wand.mana-max="1600"
    wand.static-spells="MANA_REDUCE:-1"
    wand.dynamic-spells="
        BLOOD_MAGIC:2
        BURST_X
        ADD_DEATH_TRIGGER
        CURSE_WITHER_PROJECTILE
        [DIGGER|POWERDIGGER|CHAINSAW]
        NOLLA SPIRAL_SHOT
        LIGHT_BULLET SUMMON_PORTAL:-1
        [
            DIGGER|
            POWERDIGGER|
            MATERIAL_WATER|
            MATERIAL_OIL|
            MATERIAL_BLOOD|
            MATERIAL_ACID|
            MATERIAL_CEMENT
        ]:13
        CHAINSAW
        RESET
    "
></noita-wand>
```
![](img/wand.webp)
## 在 `javascript` 中使用
入口常量: `noitaLib`
```js
noitaLib.spell.queryById("BOMB") //spellData Obj {id: "BOMB", name: "炸弹", description: "召唤一枚对地形破坏力极大的炸弹" ...}
```

法术查询表达式语法和法术序列语法后续补充
未完成 待续...