---
name: title-sequence-film
description: 做「影视片头风」的人物回顾 / 致敬短片（参考《流人》Slow Horses 片头：几何块面、青绿奶油橙双色调、颗粒、窄体字、剪影转场），用真实公开素材 + 人物原声 + AI 空镜和配乐，代码逐帧合成。用于：给某个人或某家公司做 60–90 秒的历史回顾、致敬片、人物混剪，要求有电影感和设计感。第一次实战：Jensen Huang × NVIDIA。
---

# 影视片头风回顾片

一条 60–90 秒、16:9 的片子。人物画面全是真实素材，讲故事靠他自己的原声。AI 只负责没有人脸的空镜、纹理和配乐。块面、调色、字卡、剪影都在代码里逐帧合成，所以全片风格统一、时间精确。

## 红线
- **不用 AI 生成真人**：人物画面只用真实素材。
- 人物有负面新闻时，先定片子的立场，默认只讲事业、不碰私事。
- 不用参考片的原配乐；素材来自公开演讲和采访，只做二创致敬。

## 流程

### 0. 拆参考片
- 抽接触表：`ffmpeg -i ref.mp4 -vf "fps=2,scale=320:-1,tile=8x8" sheet.png`。
- 写下这几样：块面形状、调色、人物怎么出现（剪影 / 侧脸）、字体和字卡停多久、节奏、结尾怎么收。
- 截 2–3 张最典型的帧，第 3 步要用。

### 1. 先搭叙事，再找画面
- 让 research agent 列素材清单（演讲、采访、播客、新闻），同时调研最近的相关讨论。
- 骨架用他自己的话：起点 → 关键押注 → 高光 → 内心（恐惧、代价）→ 结尾。字卡只补「年份 + 一个词」。
- 找一句他的招牌台词（比如 "Welcome to GTC"），做成混剪段落：同一句话、不同年份和城市，卡在拍子上。这一段是全片最燃的地方。
- 先想清楚自己的情绪核心是什么，片子要围着它走。

### 2. 下素材、对口型
- `clips/list.tsv`（名字、YouTube id、起、止）→ `yt-dlp --download-sections "*MM:SS-MM:SS"`，只下需要的段。
- faster-whisper（small.en）出逐词时间。音频先用 ffmpeg 解成 numpy 再喂进去，绕开 PyAV 的问题。
- **台词一定按逐词时间切**，凭感觉切会切错。
- 视频流的 start_time 常和音频不一致。抽帧对时间要用渲染器自己的 `-ss`，不要用从头抽的接触表去推算。

### 3. AI 空镜和纹理（GPT Image）
- 参考帧上传当 image reference。
- 场景 prompt 模板：
  `Match the color grade, muted low saturation, soft contrast, grainy printed texture of the reference images (ignore their composition, shapes and text). Scene: <场景>. No people, no text, no logos, no geometric panels, no lines.`
- 纹理板（青绿一张、橙色一张）：`Using the reference images only for color palette, texture and grain (not composition, not shapes, not text): a full-frame abstract grunge texture plate, ...`
- 不要写 shattered glass 或 panels，模型会画真的碎玻璃；块面一律代码切。
- 航拍或地标要写清楚是哪里，避免画出别家公司的楼。

### 4. 配乐（ElevenLabs Music，纯音乐）
- prompt 写：情绪、调性、BPM、前段安静留给人声（"leaves room for spoken voice"），中段起势，一个硬停，结尾安静的钢琴。排除项：`No vocals, no humming, no EDM drop, no trailer braams, no risers.`
- 一次生成两条。**模型不会按你写的秒数走**：拿到后找音乐真正的起势点和硬停点，在剪辑表里用 `MUSIC_SEGS` 倒推偏移，让起势落在混剪段第一拍，硬停落在黑屏上。

### 5. 剪辑表 + 合成
脚本在本 skill 的 `scripts/`，复制到项目的 `build/`，文件名保持不变（render2.py 会 import edl2）：
- `edl2.py`：剪辑表样例（Jensen 那条），按它的格式改。
  - `shot(t0, t1, 版式, hero, b, c, text=(年份, 一句))`
  - 版式：H1–H4（斜切分屏）、FULL、BARS（数据条）、END（结尾）、BLACK
  - 每块画面：`P(src, t, crop, 'tc'|'to', zoom, cx, cy, sync, sil='in'|'out')`
  - 有台词的镜头：`lip(D_xxx)`
  - 台词表：`DIALOG`；音乐分段：`MUSIC_SEGS`
- `render2.py`：逐帧合成。
  - 用法：`python3 -I build/render2.py out.mp4`，先用 `--draft --stills 3.0,12.5,...` 出静帧检查。
  - 自动用 macOS Vision 抠像（需要先 `swiftc -O personmask.swift -o tools/personmask`）。
- `mix2.py`：台词做压缩，有台词时音乐降低，loudnorm 到 −15 LUFS。
- `cover.py`：封面，左边是脸部特写，右边是名字。
- `burn_subs.py`：中英双语字幕烧录，可选加 0.5 秒封面帧并嵌入缩略图；字幕表格式见 `references/cues_example.tsv`。

## 画面规则（每一条都来自实际改片时的反馈）
1. 真实素材全部做双色调映射，只留约 6% 原色。不能鲜艳、不能锐；要偏灰、偏旧，有颗粒。
2. **开场 5 秒内必须看到主角**，不能只有声音配空镜。
3. **不留纯黑块面**。空的块面铺暗青纹理。全片唯一允许的纯黑是故意的黑屏停顿。
4. **中途黑屏一定要有声音**，让下一段的第一句提前进来，否则观众以为片子结束了。
5. **出人脸的镜头要有他的声音，并且口型对上**；对不上就换成不说话的镜头。
6. 重要镜头用**剪影转场**：先是暖色亮底上的深色剪影，0.55 秒后溶回真人。结尾反过来：真人 → 剪影 → 黑 → 名字。
7. 装饰线克制，只在主画面边上留一条细亮边，不加放射线。
8. 字卡写「年份 + 一个词」，用 Bebas Neue 和 Oswald。结尾名字出在纯黑上，不压在人身上。
9. 数据要有出处，直接写在画面上（比如 "SOURCE: BESPOKE INVESTMENT GROUP, VIA REUTERS"）。
10. 去掉台标、主持人和无关路人：裁掉或者换镜头。

## 自查
- 每改一版先出 6–12 张静帧拼成接触表看一遍，再跑全片（1080p 80 秒约 30 分钟）。
- 全片跑完后检查三样：
  - 响度：`ffmpeg -af ebur128=peak=true`，目标 −14 到 −15 LUFS，峰值 ≤ −1 dB。
  - 卡帧：`freezedetect`，除了故意的黑屏和片名卡，不应该有。
  - 每 3 秒一帧的接触表。
- 用 [motion-video-kit](https://github.com/echris6/motion-video-kit) business-motion-film 的 critic 方法，起一个独立 agent 挑问题。critic 报的问题自己要再核对一遍，它会误报。
- **最后一关是人自己看**。大黑块、开头没人、黑屏像结束这类审美问题，critic 基本抓不到。

## 发布
- 封面选一帧脸部特写，用 cover.py 做，嵌进视频第一帧。
- 文案先交代谁、在哪说的，再放原话；结尾用平的事实或自己的经历，不抒情。
- 写工具的时候只写真用了的模型；说不准的事实（比如跑在谁的芯片上）不要写成事实。
