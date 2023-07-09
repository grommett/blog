---
date: '2023-06-31'
tags:
  - 'clean code'
---

# Bit Rot

I've been doing quite a bit of work lately with IBM's Cloud Object Storage. Recently, while reading through the documentation, I ran across the term "bit rot" and I thought to myself, what the hell is that?

## It's Subtle

It turns out that data over time, on certain types of storage devices, begins to have small, non-critical failures. As each failure accumulates the data becomes more and more corrupted until eventually the thing(s) you're storing become a mess.

I'm not talking about a catastrophic failure. Literally, [one bit gets flipped, then two and then three](https://en.wikipedia.org/wiki/Data_degradation) etc. It's incremental, it can be subtle and eventually your data is lost.

There's a similarity with software. Unsurprisingly, [the same term can be used](https://en.wikipedia.org/wiki/Software_rot).

## The Internet Is Speaking To Me

At the same time I was reading about data corruption I was also working in a git repository that is suffering a similar fate. My name is in the `CODEOWNERS.md` file so I bear responsibility.

The thing that has been allowed to languish is the process of adding new code. I know how to do the steps, but do others? It's complex and there are non-standard, unusual ways of doing things. That's a problem if you're understaffed and looking for people to help. Adding new code can be difficult for new comers, which can mean paring sessions, questions in Slack and **_even_** an occasional surprise for the repo elders.

## Never Change A Running System <sup>[**_1_**](#notes)</sup>

It's not that the application code has a ton of bugs, quite the opposite. It's very stable. The **_stability_** of the code is what has allowed things to languish. As a result, some of the rough edges of the process have not been addressed.

## Behavioral Economics. A Way Forward

> My mantra is if you want to get people to do something, make it easy. Remove the obstacles. - Richard Thaler

Institutional knowledge is not good for open/inner source. One approach is to start with a simple set of instructions and let that be your guide.

While I haven't begun to make the changes yet I can see light at the end of the tunnel by simply writing how I'd like the instructions for contributing to be written. From that list of instructions I can see a simpler way forward. And surprisingly it won't be a huge task to make it a reality.

In summary, occasionally review your contribution processes. Observe and adjust things based on common points of friction. Work back from a simple set of instructions.

I'll post back on progress and let you know if any of this self reflection amounted to much.

---

#### Notes

1. [Never change a running system](https://en.wiktionary.org/wiki/never_change_a_running_system)
