import type { FypPost } from './types'

// Real, verified-streaming 3Speak posts (each carries its json_metadata.video
// block, so extractHero gets the HLS source directly). Injected at the top of
// page 1 during the beta so autoplay can be exercised — the live testapi feed's
// own "video" posts are synthetic seed data with no real file behind them.
// Toggle with VITE_SAMPLE_VIDEOS=false. Regenerate via scripts if they expire.
export const SAMPLE_VIDEOS: FypPost[] = [
  {
    "author": "sagarkothari88",
    "permlink": "d3e0cc27",
    "title": "HiveSuite Adds Inline Replies & Rich Notifications ⚡ #opensource #hive",
    "body": "[![](https://i.ecency.com/DQmZf8RQWmPQ4j5Pf2GsTk9RcQ3UhQyAkKQvLTM4dyZ11nC/thumb_1782129036798.jpg)](https://3speak.tv/watch?v=sagarkothari88/d3e0cc27) ▶️ [Watch on 3Speak](https://3speak.tv/watch?v=sagarkothari88/d3e0cc27)\n\n---\n\nHiveReactKit adds Twitter/X embeds, comment reward popups, mention rendering fixes, and meme creation tools.\n\nEver opened a notification just to figure out what the heck someone was even talking about? Yeah, those days are over. HiveSuite notifications now come with context, inline replies, and a full composer that follows you around like a loyal blockchain puppy. 🐕\n\n\n## 📬 Rich Notification Previews\n\nNotifications used to be the equivalent of a mystery box. Now they actually *tell you things*. We added rich content previews directly inside notification rows, so you'll see:\n\n- Post title\n- Comment title (when available)\n- The first few lines of content\n\nThat means you can understand what's going on **without** opening the full post. We also implemented batched JSON-RPC loading with shared caching, so previews load fast and we stop spamming the API with duplicate requests. Fewer calls, faster browsing, happier nodes.\n\n![Notification Content Preview](https://i",
    "category": "hive-139531",
    "created": "2026-07-01T06:03:09",
    "json_metadata": {
      "image": [
        "https://i.ecency.com/DQmZf8RQWmPQ4j5Pf2GsTk9RcQ3UhQyAkKQvLTM4dyZ11nC/thumb_1782129036798.jpg"
      ],
      "tags": [
        "hive-139531",
        "india",
        "threespeak",
        "hivedev",
        "neoxian",
        "pimp",
        "pob",
        "bee",
        "waiv",
        "sports",
        "hivesuite"
      ],
      "app": "3speak/0.3.0",
      "video": {
        "info": {
          "file": null,
          "ipfs": null,
          "lang": "en",
          "title": "HiveSuite Adds Inline Replies & Rich Notifications ⚡ #opensource #hive",
          "author": "sagarkothari88",
          "duration": 69.766667,
          "filesize": 36544190,
          "permlink": "d3e0cc27",
          "platform": "3speak",
          "video_v2": "ipfs://QmcJ8hWo3k46a57KK6GjkGuX72cFxtushxzqS7miSvH2FR/manifest.m3u8",
          "sourceMap": [
            {
              "url": "ipfs://QmcJ8hWo3k46a57KK6GjkGuX72cFxtushxzqS7miSvH2FR/manifest.m3u8",
              "type": "video",
              "format": "m3u8"
            },
            {
              "url": "https://i.ecency.com/DQmZf8RQWmPQ4j5Pf2GsTk9RcQ3UhQyAkKQvLTM4dyZ11nC/thumb_1782129036798.jpg",
              "type": "thumbnail"
            }
          ],
          "firstUpload": false,
          "ipfsThumbnail": null
        },
        "content": {
          "tags": [
            "hive-139531",
            "india",
            "threespeak",
            "hivedev",
            "neoxian",
            "pimp",
            "pob",
            "bee",
            "waiv",
            "sports",
            "hivesuite"
          ],
          "description": "HiveReactKit adds Twitter/X embeds, comment reward popups, mention rendering fixes, and meme creation tools.\n\nEver opened a notification just to figure out what the heck someone was even talking about? Yeah, those days are over. HiveSuite notifications now come with context, inline replies, and a full composer that follows you around like a loyal blockchain puppy. 🐕\n\n\n## 📬 Rich Notification Previews\n\nNotifications used to be the equivalent of a mystery box. Now they actually *tell you things*. We added rich content previews directly inside notification rows, so you'll see:\n\n- Post title\n- Comment title (when available)\n- The first few lines of content\n\nThat means you can understand what's going on **without** opening the full post. We also implemented batched JSON-RPC loading with shared caching, so previews load fast and we stop spamming the API with duplicate requests. Fewer calls, faster browsing, happier nodes.\n\n![Notification Content Preview](https://i.ecency.com/DQmUnHTRczWtsqjwqKf5iJVeFDCHoS7SJUQgd5hXgfQSzb3/image.png)\n\n![Rich Notification Rows](https://i.ecency.com/DQmQJfvxLkkfk3jHzGpvtqG7mdctd9gCsTn1ewCnJ4XdHiy/screenshot_2026_06_09_at_4.05.17_pm.png)\n\n## 💬 Inline Reply System\n\nThis is the big one. You can now reply directly from notifications — replies, mentions, and comments — without leaving the screen. And we didn't just bolt on a tiny text box. We embedded the **entire** HiveSuite composer.\n\nThat means images, videos, audio, GIFs, emoji, polls, templates, mentions, beneficiaries, tags, and reward settings. All of it. Right there. In your notifications. 🤯\n\n![Inline Reply Composer](https://i.ecency.com/DQmfTPFvhNThkJi5XFcs4wG8wwBd9ZjwkisxnDVoGxb6ZHy/image.png)\n\n![Notification Reply Experience](https://i.ecency.com/DQmWei1K4SpwqRi39KiRhHbag6nAiEUbWuNf5XgfzMTJJVP/screenshot_2026_06_09_at_4.04.22_pm.png)\n\n## 📱 Mobile & Desktop, Each Done Right\n\nBecause shipping the same UI to every device is a crime, we tailored the reply experience per platform.\n\n**Mobile** gets a dedicated bottom-sheet composer with smooth open/close animations, keyboard-safe scrolling, tap-to-dismiss, and optimized touch interactions. **Desktop** keeps a clean inline expandable composer right beneath the notification row, so you can see the conversation while you type.\n\n![Mobile Reply Composer]![Image](https://i.ecency.com/DQmQToCYGD4smnT41pJ3rhMNJTdYj1MS96egwa7GiL4niSp/screenshot_2026_06_09_at_4.06.18_pm.png)\n\n![Desktop Inline Replying](https://i.ecency.com/DQmWei1K4SpwqRi39KiRhHbag6nAiEUbWuNf5XgfzMTJJVP/screenshot_2026_06_09_at_4.04.22_pm.png)\n\n## 🏷️ Smart Tag Handling & Reply Metadata\n\nReplies now automatically carry forward tags from the parent post, shown as editable chips before you publish. We also added automatic tag processing: lowercasing, deduplication, Hive tag-limit enforcement, and metadata-safe formatting. Sanitized tags get baked right into the reply metadata, which means better compatibility across the entire Hive ecosystem. Clean metadata = happy frontends everywhere.\n\n![Tag Inheritance System](https://i.ecency.com/DQmPEuWiiTAJ8HthJxKqHcLqEKo3Tad7KURS54XAiTuq3PE/screenshot_2026_06_09_at_4.08.04_pm.png)\n\n## 🔄 Reply Lifecycle & Notification Refresh\n\nAfter a successful reply, notification feeds refresh automatically — your new comment shows up instantly, no manual reload required. We also built a unified `closeReply()` workflow that handles every dismissal scenario: cancel actions, close buttons, backdrop taps, and mobile swipe gestures. No more ghost composers haunting your state. 👻\n\n![Automatic Notification Refresh](https://i.ecency.com/DQmaHwsQhuVArMXs2mihRm4AT3MUWUwQUxVR99McnpFkVXd/image.png)\n\n## 🚀 What's Next\n\nWe're just getting started. Expect even more streamlined communication tools, faster workflows, and scalable social features that make discovering and discussing content on Hive ridiculously smooth. Got a feature you're dreaming about? Drop it in the comments — the community steers this ship. 🐝\n\n---\n\n##### More Links\n\n| | | |\n|---|---|---|\n[![](https://images.ecency.com/70x0/https://hsnaps.sagarkothari88.one/logo.png)](https://hivesuite.app/) | [![](https://images.ecency.com/70x0/https://cdn-icons-png.freepik.com/512/9720/9720387.png?uid=R157450845&ga=GA1.1.352572717.1773017077)](https://vote.hive.uno/@sagarkothari88) | [![](https://images.ecency.com/70x0/https://cdn-icons-png.freepik.com/512/3670/3670157.png?uid=R157450845&ga=GA1.1.352572717.1773017077)](https://discord.gg/WEKa8JKg7W) |\n| [HiveSuite App](https://hivesuite.app/) | [Vote as Witness](https://vote.hive.uno/@sagarkothari88) | [Support via Discord](https://discord.gg/WEKa8JKg7W) |"
        }
      }
    },
    "pending_payout": 2.842,
    "author_reputation": 77.2,
    "children": 1,
    "community": "hive-139531",
    "community_title": "HiveDevs",
    "url": "/hive-139531/@sagarkothari88/d3e0cc27",
    "active_votes": [
      {
        "voter": "team",
        "rshares": 31072857830
      },
      {
        "voter": "kenny-crane",
        "rshares": 598065575591
      },
      {
        "voter": "garagebill",
        "rshares": 22026410277
      },
      {
        "voter": "allyinspirit",
        "rshares": 1773376239
      },
      {
        "voter": "pixiehunter",
        "rshares": 1320068922
      },
      {
        "voter": "kenistyles",
        "rshares": 1014420386
      },
      {
        "voter": "scottermonkey",
        "rshares": 7465899452
      },
      {
        "voter": "moondancer762",
        "rshares": 5596019616
      },
      {
        "voter": "sebcam",
        "rshares": 493444284
      },
      {
        "voter": "redes",
        "rshares": 6267210377202
      },
      {
        "voter": "tiamaria",
        "rshares": 19508241672
      },
      {
        "voter": "aware007",
        "rshares": 785082299
      },
      {
        "voter": "noemilunastorta",
        "rshares": 194640163369
      },
      {
        "voter": "freebornsociety",
        "rshares": 20986255891
      },
      {
        "voter": "tibra",
        "rshares": 963739166
      },
      {
        "voter": "thecrazygm",
        "rshares": 373267438342
      },
      {
        "voter": "mes",
        "rshares": 523339489561
      },
      {
        "voter": "bearone",
        "rshares": 16131166718
      },
      {
        "voter": "numundo",
        "rshares": 1206810045
      },
      {
        "voter": "walkerland",
        "rshares": 19026734564
      },
      {
        "voter": "heart-to-heart",
        "rshares": 9621608770
      },
      {
        "voter": "oneray",
        "rshares": 88967087320
      },
      {
        "voter": "vimukthi",
        "rshares": 839633207
      },
      {
        "voter": "amitsharma",
        "rshares": 124503055189
      },
      {
        "voter": "holisticmom",
        "rshares": 13103589457
      },
      {
        "voter": "redrica",
        "rshares": 1109809434
      },
      {
        "voter": "ahlawat",
        "rshares": 898074115
      },
      {
        "voter": "shonariver",
        "rshares": 1140971878
      },
      {
        "voter": "karinxxl",
        "rshares": 39748423915
      },
      {
        "voter": "bluntsmasha",
        "rshares": 913874658
      },
      {
        "voter": "senorcoconut",
        "rshares": 3165197380
      },
      {
        "voter": "crescendoofpeace",
        "rshares": 1107156992
      },
      {
        "voter": "sagescrub",
        "rshares": 713481250
      },
      {
        "voter": "alexanderfluke",
        "rshares": 447915661785
      },
      {
        "voter": "mountainjewel",
        "rshares": 8853283173
      },
      {
        "voter": "irisworld",
        "rshares": 2326377784
      },
      {
        "voter": "bobydimitrov",
        "rshares": 10879959960
      },
      {
        "voter": "tryskele",
        "rshares": 2708360767
      },
      {
        "voter": "viking-ventures",
        "rshares": 1218628456
      },
      {
        "voter": "victorialegend",
        "rshares": 8263061239
      },
      {
        "voter": "fieryfootprints",
        "rshares": 576246045670
      },
      {
        "voter": "green77",
        "rshares": 28515206514
      },
      {
        "voter": "barge",
        "rshares": 971084640
      },
      {
        "voter": "karmadorje",
        "rshares": 2115937255
      },
      {
        "voter": "abrockman",
        "rshares": 1360361454228
      },
      {
        "voter": "riverflows",
        "rshares": 114765618727
      },
      {
        "voter": "thelaundrylady",
        "rshares": 12578682628
      },
      {
        "voter": "digitaldan",
        "rshares": 9080637420
      },
      {
        "voter": "sorprendente",
        "rshares": 3673523649
      },
      {
        "voter": "wildlocusthoney",
        "rshares": 572286670
      }
    ],
    "stats": {
      "gray": false,
      "hide": false,
      "flag_weight": 0.0
    },
    "blacklists": [],
    "fyp": {
      "rank": 1,
      "final_score": 0.9,
      "score_relevance": 0.8,
      "score_recency": 0.7,
      "score_engagement": 0.6,
      "score_credibility": 0.7,
      "community_boost_applied": false,
      "boost_source": null,
      "source": "personalized"
    }
  },
  {
    "author": "sagarkothari88",
    "permlink": "4a09b561",
    "title": "HiveSuite Dev Update: Massive Design System Glow-Up 🎨🚀",
    "body": "[![](https://i.ecency.com/DQmU6g8iF9X3bnTBVkNJ5tzULA1wkZ5yxQLrVFz8N2BkNDo/thumb_1782123462459.jpg)](https://3speak.tv/watch?v=sagarkothari88/4a09b561) ▶️ [Watch on 3Speak](https://3speak.tv/watch?v=sagarkothari88/4a09b561)\n\n---\n\nHiveSuite introduces a shared design system, refreshed navigation, improved feeds, and enhanced community discovery.\n\n# HiveSuite Got a Glow-Up ✨ (And Honestly, It Was Overdue)\n\nWe took a long, hard look at our red-heavy UI, whispered \"this is fine\" while everything was clearly not fine, and then rebuilt the whole visual foundation. Buckle up — this update is a chonky one. 🚀\n\n<!-- GIF: 'this is fine' dog sitting in burning room meme -->\n\n## 🎨 A Shared Design System (Finally!)\n\nWe built a complete shared design system across HiveSuite, standardizing colors, spacing, typography, shadows, and motion. No more eyeballing padding and praying. We swapped the aggressive red tones for calmer, more modern vibes — your retinas can finally relax.\n\nWe also introduced reusable design primitives: cards, buttons, modals, inputs, avatars, badges, and buttery skeleton loaders. The result? Better consistency, faster UI development, and a far more maintainable codebase.\n\n![Uni",
    "category": "hive-139531",
    "created": "2026-06-27T06:02:48",
    "json_metadata": {
      "image": [
        "https://i.ecency.com/DQmU6g8iF9X3bnTBVkNJ5tzULA1wkZ5yxQLrVFz8N2BkNDo/thumb_1782123462459.jpg"
      ],
      "tags": [
        "hive-139531",
        "hive",
        "dev",
        "india",
        "reactjs",
        "witness",
        "playstore",
        "appstore",
        "dapps",
        "hivesuite"
      ],
      "app": "3speak/0.3.0",
      "video": {
        "info": {
          "file": null,
          "ipfs": null,
          "lang": "en",
          "title": "HiveSuite Dev Update: Massive Design System Glow-Up 🎨🚀",
          "author": "sagarkothari88",
          "duration": 68.933333,
          "filesize": 37966053,
          "permlink": "4a09b561",
          "platform": "3speak",
          "video_v2": "ipfs://QmcxyMEYDtwXkHvnGFUYozHZGrB8TC3LUTcYJzBoEJxZaT/manifest.m3u8",
          "sourceMap": [
            {
              "url": "ipfs://QmcxyMEYDtwXkHvnGFUYozHZGrB8TC3LUTcYJzBoEJxZaT/manifest.m3u8",
              "type": "video",
              "format": "m3u8"
            },
            {
              "url": "https://i.ecency.com/DQmU6g8iF9X3bnTBVkNJ5tzULA1wkZ5yxQLrVFz8N2BkNDo/thumb_1782123462459.jpg",
              "type": "thumbnail"
            }
          ],
          "firstUpload": false,
          "ipfsThumbnail": null
        },
        "content": {
          "tags": [
            "hive-139531",
            "hive",
            "dev",
            "india",
            "reactjs",
            "witness",
            "playstore",
            "appstore",
            "dapps",
            "hivesuite"
          ],
          "description": "HiveSuite introduces a shared design system, refreshed navigation, improved feeds, and enhanced community discovery.\n\n# HiveSuite Got a Glow-Up ✨ (And Honestly, It Was Overdue)\n\nWe took a long, hard look at our red-heavy UI, whispered \"this is fine\" while everything was clearly not fine, and then rebuilt the whole visual foundation. Buckle up — this update is a chonky one. 🚀\n\n<!-- GIF: 'this is fine' dog sitting in burning room meme -->\n\n## 🎨 A Shared Design System (Finally!)\n\nWe built a complete shared design system across HiveSuite, standardizing colors, spacing, typography, shadows, and motion. No more eyeballing padding and praying. We swapped the aggressive red tones for calmer, more modern vibes — your retinas can finally relax.\n\nWe also introduced reusable design primitives: cards, buttons, modals, inputs, avatars, badges, and buttery skeleton loaders. The result? Better consistency, faster UI development, and a far more maintainable codebase.\n\n![Unified Component Styling - Profile Growth Tab ](https://i.ecency.com/DQmRzFDgrNocY1sXRe3M8dhRrmrmbtW3hg599KxFTxTBmBK/screenshot_2026_06_08_at_6.31.00_pm.png)\n\n![Updated Design System - comments tab](https://i.ecency.com/DQmUMtG86LcVManTqqMdBLQiWtqLtBmjwdPVdy4zW4ReDbQ/image.png)\n\n![Modernized UI Components - from HiveReactKit](https://i.ecency.com/DQmXDjMresq54Vw12caMeVXXuCMwYC5EdTMfB9mhueqmfB1/image.png)\n\n## 🧭 Navigation & Drawer Redesign\n\nThe left navigation drawer and right profile drawer used to look like distant cousins who never speak. Now they're twins — identical styling, matching widths, consistent spacing, and unified animations.\n\nWe added responsive sizing for mobile, tablet, and desktop, ripped out those heavy blur effects that were tanking usability, and fixed a pile of transform-related rendering gremlins causing modal positioning chaos and overlay layering bugs.\n\n<!-- GIF: spider-man pointing at spider-man meme (the two matching drawers) -->\n\n![Updated Navigation Drawer](https://i.ecency.com/DQmWNo7ysCdVuEYajKp6RL5wHfytMAks875RMWg2hB5y4nE/image.png)\n\n![Responsive Drawer Layouts](https://i.ecency.com/DQmTcEfEGGHd8Uvt4dAzxMisyjfG5fTwmedqyyrosGuMox7/image.png)\n\n## 👤 Profile Drawer & Account Switching\n\nWe added a compact profile card showing Voting Power, Downvote Power, and Resource Credits — all the good stats, right where you need them. The new inline account switcher handles Switch User, Add Account, and Sign Out without drama.\n\nMulti-account reliability got a serious upgrade across Hive Keychain, HiveAuth, and saved-key accounts. Plus automatic expired-session cleanup and clear toast notifications, so you'll actually know when it's time to re-authenticate.\n\n![Updated Navigation Profile Drawer menu](https://i.ecency.com/DQmWNo7ysCdVuEYajKp6RL5wHfytMAks875RMWg2hB5y4nE/image.png)\n\n![Account Switching Experience](https://i.ecency.com/DQmQEvzzaNNqeZY4MrVLMvnFdgD5JuZnBSe42vHVW2bn2Wf/image.png)\n\n## 📜 Feeds & Pagination Improvements\n\nInfinite scrolling has landed on the Blogs and Notifications feeds — keep scrolling, content keeps coming. Desktop Snaps browsing now has synchronized multi-column scrolling for a much smoother discovery experience.\n\nAnd yes, we finally exorcised the double-scrollbar demon, plus scroll-locking and nested scroll conflicts. Scrolling now behaves like a civilized human being.\n\n<!-- GIF: someone scrolling endlessly on phone meme -->\n\n![Infinite Scrolling](https://i.ecency.com/DQmRVGpBSs296qw4WUWdMcgSsvhu5TZNm97ZXiPh9RB2Z6M/screenshot_2026_06_08_at_6.39.32_pm.png)\n\n![Enhanced Skeleton Loading States](https://i.ecency.com/DQmV2fbEMhqpLHVCg39WGdhektGiDwMbjDmeexNX2Pr4yqS/image.png)\n\n## 🔍 Communities & Search Enhancements\n\nCommunity search is now debounced, so we're not hammering the API every time you breathe near your keyboard. We also added stale-response protection, so only the freshest results show up. Community cards got a readability refresh, and community-tagged Snaps are now integrated directly into community experiences. 🐝\n\n![Community Search Improvements](https://i.ecency.com/DQmUm8tJFHj8rKwqvxyqN2ZM1iP3HfETUh7v6iWGw68XNHA/image.png)\n\n![Updated Community Experience](https://i.ecency.com/DQmYMZyGgoHZjxYVMPMyoqFANtZ2KMxtvm2zwwaVGdkPFU4/image.png)\n\n## 🔮 What's Next\n\nWe're just getting warmed up. Expect even more polish, deeper community integrations, and continued performance wins as we keep building a consistent, accessible, and feature-rich experience for the entire Hive ecosystem. Got feedback or feature requests? Hit us up in Discord — we genuinely read everything. 💜\n\n---\n\n##### More Links\n\n| | | |\n|---|---|---|\n[![](https://images.ecency.com/70x0/https://hsnaps.sagarkothari88.one/logo.png)](https://hivesuite.app/) | [![](https://images.ecency.com/70x0/https://cdn-icons-png.freepik.com/512/9720/9720387.png)](https://vote.hive.uno/@sagarkothari88) | [![](https://images.ecency.com/70x0/https://cdn-icons-png.freepik.com/512/3670/3670157.png)](https://discord.gg/WEKa8JKg7W) |\n| [HiveSuite App](https://hivesuite.app/) | [Vote as Witness](https://vote.hive.uno/@sagarkothari88) | [Support via Discord](https://discord.gg/WEKa8JKg7W) |"
        }
      }
    },
    "pending_payout": 2.705,
    "author_reputation": 77.2,
    "children": 5,
    "community": "hive-139531",
    "community_title": "HiveDevs",
    "url": "/hive-139531/@sagarkothari88/4a09b561",
    "active_votes": [
      {
        "voter": "steemychicken1",
        "rshares": 2420511164349
      },
      {
        "voter": "team",
        "rshares": 31040272457
      },
      {
        "voter": "kenny-crane",
        "rshares": 597573291984
      },
      {
        "voter": "garagebill",
        "rshares": 21970774810
      },
      {
        "voter": "pcste",
        "rshares": 8198160687
      },
      {
        "voter": "pixiehunter",
        "rshares": 1319550180
      },
      {
        "voter": "anotherjoe",
        "rshares": 28931350387
      },
      {
        "voter": "escapeamericanow",
        "rshares": 42022184824
      },
      {
        "voter": "moondancer762",
        "rshares": 5591788632
      },
      {
        "voter": "okean123",
        "rshares": 32801441705
      },
      {
        "voter": "fortinbuff",
        "rshares": 1207462029
      },
      {
        "voter": "tiamaria",
        "rshares": 19493019850
      },
      {
        "voter": "freebornsociety",
        "rshares": 20968231350
      },
      {
        "voter": "mes",
        "rshares": 518254594859
      },
      {
        "voter": "bsameep",
        "rshares": 4195039473
      },
      {
        "voter": "joeyarnoldvn",
        "rshares": 951800777
      },
      {
        "voter": "offgridlife",
        "rshares": 168143404600
      },
      {
        "voter": "hardikv",
        "rshares": 2452195796
      },
      {
        "voter": "kiokizz",
        "rshares": 32081643830
      },
      {
        "voter": "captainquack22",
        "rshares": 6360027340814
      },
      {
        "voter": "ashokcan143",
        "rshares": 2504383333
      },
      {
        "voter": "codingdefined",
        "rshares": 120248402508
      },
      {
        "voter": "oneray",
        "rshares": 88881232707
      },
      {
        "voter": "kiobot",
        "rshares": 506536877
      },
      {
        "voter": "vimukthi",
        "rshares": 839354354
      },
      {
        "voter": "amitsharma",
        "rshares": 124371479901
      },
      {
        "voter": "ahlawat",
        "rshares": 16058821107
      },
      {
        "voter": "aafeng",
        "rshares": 2894385671728
      },
      {
        "voter": "etblink",
        "rshares": 118113769115
      },
      {
        "voter": "splash-of-angs63",
        "rshares": 7954387594
      },
      {
        "voter": "jatinhota",
        "rshares": 50488310256
      },
      {
        "voter": "lifecruiser",
        "rshares": 4855032137
      },
      {
        "voter": "steemflow",
        "rshares": 1602660148757
      },
      {
        "voter": "bobinson",
        "rshares": 379294927632
      },
      {
        "voter": "sankysanket18",
        "rshares": 1370826108
      },
      {
        "voter": "vishire",
        "rshares": 1789539147
      },
      {
        "voter": "silenteyes",
        "rshares": 856028824
      },
      {
        "voter": "scipio",
        "rshares": 18914640211
      },
      {
        "voter": "shonyishere",
        "rshares": 1500848356
      },
      {
        "voter": "amarbir",
        "rshares": 440102567
      },
      {
        "voter": "spydo",
        "rshares": 56414880087
      },
      {
        "voter": "frames",
        "rshares": 890658917
      },
      {
        "voter": "alexanderfluke",
        "rshares": 482852450193
      },
      {
        "voter": "bala41288",
        "rshares": 1229446994104
      },
      {
        "voter": "chorock",
        "rshares": 2511815462546
      },
      {
        "voter": "dynamicrypto",
        "rshares": 5282355038
      },
      {
        "voter": "indiaunited",
        "rshares": 1945914604751
      },
      {
        "voter": "victorialegend",
        "rshares": 8256836341
      },
      {
        "voter": "fieryfootprints",
        "rshares": 574982793771
      },
      {
        "voter": "cool08",
        "rshares": 510479672
      }
    ],
    "stats": {
      "gray": false,
      "hide": false,
      "flag_weight": 0.0
    },
    "blacklists": [],
    "fyp": {
      "rank": 2,
      "final_score": 0.85,
      "score_relevance": 0.75,
      "score_recency": 0.7,
      "score_engagement": 0.6,
      "score_credibility": 0.7,
      "community_boost_applied": false,
      "boost_source": null,
      "source": "personalized"
    }
  },
  {
    "author": "renny187",
    "permlink": "tkahehoz",
    "title": "Another Wonderful Experience at Dikkies Supermarket",
    "body": "<center>\n\n[![](https://ipfs-3speak.b-cdn.net/ipfs/bafybeihrwsfts5emnka2zlpjg32jrpvqa73a5psdhonsqlsomx6gw7vz64/)](https://3speak.tv/watch?v=renny187/tkahehoz)\n\n▶️ [Watch on 3Speak](https://3speak.tv/watch?v=renny187/tkahehoz)\n\n</center>\n\n---\n\nI decided to Stop by at Dikkies Supermarket and get some milk to add to the beverages i had at home for my Breakfast this morning.\r\n\r\nI also recorded all the process involved for me to do this and i would like to invite you to watch too and learn.\r\n\r\nI will keep spending HBD and at many other Listed businesses too\r\n\r\nKudos to SpendHBD community!\n\n---\n\n▶️ [3Speak](https://3speak.tv/watch?v=renny187/tkahehoz)\n",
    "category": "hive-106130",
    "created": "2025-04-22T08:41:06",
    "json_metadata": {
      "image": [
        "https://ipfs-3speak.b-cdn.net/ipfs/bafybeihrwsfts5emnka2zlpjg32jrpvqa73a5psdhonsqlsomx6gw7vz64"
      ],
      "tags": [
        "spendhbd",
        "spendtoearn",
        "cashback",
        "mobile",
        "threespeaktv",
        "hive",
        "crypto",
        "distriator"
      ],
      "app": "3speak/0.3.0",
      "video": {
        "info": {
          "file": "ipfs://bafybeie4r33ixwxpypql7x6763fdkhg3zlqip6ordtspb2gohc3wnownyu",
          "ipfs": null,
          "lang": "en",
          "title": "Another Wonderful Experience at Dikkies Supermarket",
          "author": "renny187",
          "duration": 232.766667,
          "filesize": 47238381,
          "permlink": "tkahehoz",
          "platform": "3speak",
          "video_v2": "ipfs://QmYnPnXgp8Ky476yXtQkcPZhTpbZQvybR93Exw9sPnEf3i/manifest.m3u8",
          "sourceMap": [
            {
              "url": "ipfs://QmYnPnXgp8Ky476yXtQkcPZhTpbZQvybR93Exw9sPnEf3i/manifest.m3u8",
              "type": "video",
              "format": "m3u8"
            },
            {
              "url": "ipfs://bafybeihrwsfts5emnka2zlpjg32jrpvqa73a5psdhonsqlsomx6gw7vz64",
              "type": "thumbnail"
            }
          ],
          "firstUpload": false,
          "ipfsThumbnail": null
        },
        "content": {
          "tags": [
            "spendhbd",
            "spendtoearn",
            "cashback",
            "mobile",
            "threespeaktv",
            "hive",
            "crypto",
            "distriator"
          ],
          "description": "I decided to Stop by at Dikkies Supermarket and get some milk to add to the beverages i had at home for my Breakfast this morning.\r\n\r\nI also recorded all the process involved for me to do this and i would like to invite you to watch too and learn.\r\n\r\nI will keep spending HBD and at many other Listed businesses too\r\n\r\nKudos to SpendHBD community!"
        }
      }
    },
    "pending_payout": 0.0,
    "author_reputation": 62.84,
    "children": 1,
    "community": "hive-106130",
    "community_title": "SpendHBD",
    "url": "/hive-106130/@renny187/tkahehoz",
    "active_votes": [
      {
        "voter": "fokusnow",
        "rshares": 1103422181786
      },
      {
        "voter": "emjeak",
        "rshares": 2264678598
      },
      {
        "voter": "threads247",
        "rshares": 4986916585
      },
      {
        "voter": "mikelboy",
        "rshares": 1394076060
      },
      {
        "voter": "dorianblack",
        "rshares": 0
      }
    ],
    "stats": {
      "gray": false,
      "hide": false,
      "flag_weight": 0.0
    },
    "blacklists": [],
    "fyp": {
      "rank": 3,
      "final_score": 0.8,
      "score_relevance": 0.7000000000000001,
      "score_recency": 0.7,
      "score_engagement": 0.6,
      "score_credibility": 0.7,
      "community_boost_applied": false,
      "boost_source": null,
      "source": "personalized"
    }
  },
  {
    "author": "tanzil2024",
    "permlink": "xahfnnna",
    "title": "Beautiful Nature Close to the City Area",
    "body": "<center>\n\n[![](https://ipfs-3speak.b-cdn.net/ipfs/bafybeicmn24246he2os556hm7nqggw6lbckp3fezljb2j6ulx4danyusgi/)](https://3speak.tv/watch?v=tanzil2024/xahfnnna)\n\n▶️ [Watch on 3Speak](https://3speak.tv/watch?v=tanzil2024/xahfnnna)\n\n</center>\n\n---\n\nLast weekend, I went for a small hiking close to the city of Huairou, where I am currently living.  As usual on Sunday, I woke up late in the morning and I went there in the late afternoon and I had plan to come back to my dormitory before the Iftar as it is Ramadan when we muslim people keep fasting throughout the year. As I don't have to eat throughout the day, which is quite soothing for me to have some outdoor activity during this time. Though the weather was not so amazing as often we have here but I don't want to miss the weekend from the opportunity to explore some places.\r\n\r\nAs the weather was not so clear with some air pollution which was not so severe like in previous year experience. The sun lies behind a dusty, hazy sky that has lost its lovely blue color, as you can see in thevideo.  Though most of the time  I enjoy excellent air quality with stunning blue sky but unluckily, I am experiencing a dusty weather in my weekend. Butt",
    "category": "hive-155373",
    "created": "2025-03-18T18:16:06",
    "json_metadata": {
      "image": [
        "https://ipfs-3speak.b-cdn.net/ipfs/bafybeicmn24246he2os556hm7nqggw6lbckp3fezljb2j6ulx4danyusgi"
      ],
      "tags": [
        "3speaktv",
        "threespeaktv",
        "neoxian",
        "pob",
        "pimp",
        "meme",
        "vidoe",
        "nature"
      ],
      "app": "3speak/0.3.0",
      "video": {
        "info": {
          "file": "ipfs://bafybeicon3x73uz7ktyuvz2qmnnyixyywyiw5gbznml3vh5rd3he5al34e",
          "ipfs": null,
          "lang": "en",
          "title": "Beautiful Nature Close to the City Area",
          "author": "tanzil2024",
          "duration": 85.233,
          "filesize": 39032795,
          "permlink": "xahfnnna",
          "platform": "3speak",
          "video_v2": "ipfs://QmNuW5iuwrDjpwDizowCYV5c7yipyYgKLwWTkx5K8bWLdr/manifest.m3u8",
          "sourceMap": [
            {
              "url": "ipfs://QmNuW5iuwrDjpwDizowCYV5c7yipyYgKLwWTkx5K8bWLdr/manifest.m3u8",
              "type": "video",
              "format": "m3u8"
            },
            {
              "url": "ipfs://bafybeicmn24246he2os556hm7nqggw6lbckp3fezljb2j6ulx4danyusgi",
              "type": "thumbnail"
            }
          ],
          "firstUpload": false,
          "ipfsThumbnail": null
        },
        "content": {
          "tags": [
            "3speaktv",
            "threespeaktv",
            "neoxian",
            "pob",
            "pimp",
            "meme",
            "vidoe",
            "nature"
          ],
          "description": "Last weekend, I went for a small hiking close to the city of Huairou, where I am currently living.  As usual on Sunday, I woke up late in the morning and I went there in the late afternoon and I had plan to come back to my dormitory before the Iftar as it is Ramadan when we muslim people keep fasting throughout the year. As I don't have to eat throughout the day, which is quite soothing for me to have some outdoor activity during this time. Though the weather was not so amazing as often we have here but I don't want to miss the weekend from the opportunity to explore some places.\r\n\r\nAs the weather was not so clear with some air pollution which was not so severe like in previous year experience. The sun lies behind a dusty, hazy sky that has lost its lovely blue color, as you can see in thevideo.  Though most of the time  I enjoy excellent air quality with stunning blue sky but unluckily, I am experiencing a dusty weather in my weekend. Butt the natural beauty make the experience an amazing one as you can see the video. The strong wind was also soothing as nowadays the temperature is rising in this northern part of Beijing.\r\n\r\nI hope you enjoy the video in the lakeside area of the Huairou city which is so beautiful and it will be more attractive more cleaner and stunning in the coming spring with crystal blue sky.  If you have any queries, let me know in the comments if you have any questions, and I'll do my best to answer them.\r\n\r\n I sincerely appreciate your time and attention. \r\n Have a wonderful day!"
        }
      }
    },
    "pending_payout": 0.0,
    "author_reputation": 76.52,
    "children": 7,
    "community": "hive-155373",
    "community_title": "Life-n-Thoughts",
    "url": "/hive-155373/@tanzil2024/xahfnnna",
    "active_votes": [
      {
        "voter": "redes",
        "rshares": 3151162735910
      },
      {
        "voter": "funnel",
        "rshares": 13531563803
      },
      {
        "voter": "stefanialexis",
        "rshares": 848123759
      },
      {
        "voter": "joeyarnoldvn",
        "rshares": 454780341
      },
      {
        "voter": "apoloo1",
        "rshares": 19736148597
      },
      {
        "voter": "tattoodjay",
        "rshares": 523473946055
      },
      {
        "voter": "costanza",
        "rshares": 332569106165
      },
      {
        "voter": "onyfest",
        "rshares": 9667814518
      },
      {
        "voter": "yablonsky",
        "rshares": 2017669095357
      },
      {
        "voter": "slobberchops",
        "rshares": 581750359212
      },
      {
        "voter": "gabrielrr17",
        "rshares": 572726178
      },
      {
        "voter": "pardinus",
        "rshares": 41112762546
      },
      {
        "voter": "teamvn",
        "rshares": 7363198895
      },
      {
        "voter": "holovision",
        "rshares": 3723562299
      },
      {
        "voter": "pedrocanella",
        "rshares": 733244236
      },
      {
        "voter": "dosh",
        "rshares": 730496512
      },
      {
        "voter": "sanjeev021",
        "rshares": 409744144
      },
      {
        "voter": "marianaemilia",
        "rshares": 3595746950
      },
      {
        "voter": "gomster",
        "rshares": 943804114
      },
      {
        "voter": "caaio",
        "rshares": 676870700
      },
      {
        "voter": "libertycrypto27",
        "rshares": 383421430908
      },
      {
        "voter": "anjanida",
        "rshares": 8945810545
      },
      {
        "voter": "bastter",
        "rshares": 1988839142
      },
      {
        "voter": "curamax",
        "rshares": 207289669115
      },
      {
        "voter": "lee1938",
        "rshares": 1356968869
      },
      {
        "voter": "memehive",
        "rshares": 188796987
      },
      {
        "voter": "goliathus",
        "rshares": 813130494
      },
      {
        "voter": "hive-world",
        "rshares": 931866392
      },
      {
        "voter": "goldgrifin007",
        "rshares": 6274669260
      },
      {
        "voter": "zaddyboy",
        "rshares": 579908814
      },
      {
        "voter": "seuamiguto",
        "rshares": 482577162
      },
      {
        "voter": "carlosro",
        "rshares": 494143069
      },
      {
        "voter": "brucolac",
        "rshares": 3340380068
      },
      {
        "voter": "brando28",
        "rshares": 543937674
      },
      {
        "voter": "nyxlabs",
        "rshares": 2939522639
      },
      {
        "voter": "nicolimitless",
        "rshares": 980448401
      },
      {
        "voter": "khushboo108",
        "rshares": 1301616203
      },
      {
        "voter": "vitoragnelli",
        "rshares": 491988350
      },
      {
        "voter": "adulruna",
        "rshares": 803971439
      },
      {
        "voter": "emd012",
        "rshares": 523981389
      },
      {
        "voter": "hkinuvaime",
        "rshares": 1006632434
      },
      {
        "voter": "qyses",
        "rshares": 459745813
      },
      {
        "voter": "kojiri",
        "rshares": 649158574
      },
      {
        "voter": "krazeworgen",
        "rshares": 1671953266
      },
      {
        "voter": "jpleron",
        "rshares": 659634959
      },
      {
        "voter": "elfino28",
        "rshares": 1181161405
      },
      {
        "voter": "bteim",
        "rshares": 8325265661
      },
      {
        "voter": "highfist",
        "rshares": 803903999
      },
      {
        "voter": "lolz.meme",
        "rshares": 7213021441
      },
      {
        "voter": "elchaleefatoe15",
        "rshares": 4596302740
      }
    ],
    "stats": {
      "gray": false,
      "hide": false,
      "flag_weight": 0.0
    },
    "blacklists": [],
    "fyp": {
      "rank": 4,
      "final_score": 0.75,
      "score_relevance": 0.65,
      "score_recency": 0.7,
      "score_engagement": 0.6,
      "score_credibility": 0.7,
      "community_boost_applied": false,
      "boost_source": null,
      "source": "personalized"
    }
  },
  {
    "author": "sudutpandang",
    "permlink": "looijfqg",
    "title": "EXPLORE SNORKELING AREA IN RUBIAH ISLAND, ACEH.",
    "body": "<center>\n\n[![](https://ipfs-3speak.b-cdn.net/ipfs/bafkreidaygug56z4kolluq362mfwsor3bdgerbsuqsfrlxsw6gnnn5ikry/)](https://3speak.tv/watch?v=sudutpandang/looijfqg)\n\n▶️ [Watch on 3Speak](https://3speak.tv/watch?v=sudutpandang/looijfqg)\n\n</center>\n\n---\n\n*Hello everyone, how are you today, are you still not satisfied with knowing about beautiful objects? Of course there will be a sense of curiosity about every beautiful place that we have never explored, even places that we have explored, we want to know more about that place.*\r\n\r\n*Well, I often experience that kind of curiosity, so I want to shift a little information from the general to the specific, such as the tourist destination of Sabang Island, of course we all know that this island is a favorite place for tourists to visit, but have people ever discussed that \"Sabang\" is a collection of other islands there?, because in Sabang there is also Kreung Raya Island, Klah Island, even the spectacular Rubiah Island as the most favorite snorkeling area in Sabang.*\r\n\r\n*In this video I want to show you all the snorkeling areas on Rubiah Island. This is the main snorkeling area around Rubiah Island. The water is very clear with beautiful cor",
    "category": "hive-174680",
    "created": "2024-09-17T21:52:06",
    "json_metadata": {
      "image": [
        "https://ipfs-3speak.b-cdn.net/ipfs/bafkreidaygug56z4kolluq362mfwsor3bdgerbsuqsfrlxsw6gnnn5ikry"
      ],
      "tags": [
        "travel",
        "amazingnature",
        "cch",
        "indonesia",
        "posh",
        "3speak",
        "highqualitycuration",
        "campingclubhive",
        "curangel",
        "curation",
        "nature",
        "threespeaktv",
        "threespeak",
        "hive",
        "vlogs"
      ],
      "app": "3speak/0.3.0",
      "video": {
        "info": {
          "file": "ipfs://QmWUNS1ZcVupo47zLfy6hdwND5ddpft15rS5NYsAeHWD23",
          "ipfs": null,
          "lang": "so",
          "title": "EXPLORE SNORKELING AREA IN RUBIAH ISLAND, ACEH.",
          "author": "sudutpandang",
          "duration": 61.806009,
          "filesize": 77413559,
          "permlink": "looijfqg",
          "platform": "3speak",
          "video_v2": "ipfs://Qmdq2NRsshenpDtyYcvR4CiQqxus4AWFio1RhFcRgspitM/manifest.m3u8",
          "sourceMap": [
            {
              "url": "ipfs://Qmdq2NRsshenpDtyYcvR4CiQqxus4AWFio1RhFcRgspitM/manifest.m3u8",
              "type": "video",
              "format": "m3u8"
            },
            {
              "url": "ipfs://bafkreidaygug56z4kolluq362mfwsor3bdgerbsuqsfrlxsw6gnnn5ikry",
              "type": "thumbnail"
            }
          ],
          "firstUpload": false,
          "ipfsThumbnail": null
        },
        "content": {
          "tags": [
            "travel",
            "amazingnature",
            "cch",
            "indonesia",
            "posh",
            "3speak",
            "highqualitycuration",
            "campingclubhive",
            "curangel",
            "curation",
            "nature",
            "threespeaktv",
            "threespeak",
            "hive",
            "vlogs"
          ],
          "description": "*Hello everyone, how are you today, are you still not satisfied with knowing about beautiful objects? Of course there will be a sense of curiosity about every beautiful place that we have never explored, even places that we have explored, we want to know more about that place.*\r\n\r\n*Well, I often experience that kind of curiosity, so I want to shift a little information from the general to the specific, such as the tourist destination of Sabang Island, of course we all know that this island is a favorite place for tourists to visit, but have people ever discussed that \"Sabang\" is a collection of other islands there?, because in Sabang there is also Kreung Raya Island, Klah Island, even the spectacular Rubiah Island as the most favorite snorkeling area in Sabang.*\r\n\r\n*In this video I want to show you all the snorkeling areas on Rubiah Island. This is the main snorkeling area around Rubiah Island. The water is very clear with beautiful coral reefs and various types of colorful fish. You can see various species of tropical fish, starfish, and sometimes turtles.*\r\n\r\n*On this beach, many visitors start snorkeling activities because of its easy access and direct access to the water area rich in marine life. The depth near the beach is relatively shallow, suitable for beginners. Many choose to snorkel near the pier because of the calm currents and the presence of coral reefs and small fish that are easily accessible from here.*\r\n\r\n*Meanwhile, on the west side of the island, there are deeper snorkeling spots and often have larger coral reefs and more diverse fish, although the currents can be a little stronger. Snorkeling activities on Rubiah Island are generally carried out with local guides who are very experienced, so you can enjoy the beauty of the underwater world safely.*\r\n\r\n*Thank you for watching my video, see you again in my next travel videos. Dah, gitu aja..*\r\n\r\n![VID_GIF-Sudutpandang.gif](https://files.peakd.com/file/peakd-hive/sudutpandang/EoCbrAkc1KnfVPh864iL4Qb3Ja7McmGcjgQJEL89cSHNttFvLvEAbc3qxVwgd1tfocp.gif)\r\n\r\nMy Social Media :\r\n**[WordPress](https://sudutpandangjourney.wordpress.com)**\r\n**[Youtube](https://youtube.com/c/sudutpandangjourney)**\r\n**[Dailymotion](https://www.dailymotion.com/sudutpandang)**\r\n**[PageFace](https://m.facebook.com/sudutpandangjournal)**\r\n**[Facebook](https://m.facebook.com/profile.php/?id=100000903027703)**\r\n**[Tiktok](https://www.tiktok.com/@sudutpandangjourney?_t=8jPx0RbUvhv&_r=1)**\r\n**[Snack Video](https://s.snackvideo.com/u/@Sudutpandangjourney/y5jI8UW7)**\r\n**[Instagram](https://www.instagram.com/sudutpandangjourney?igsh=MTQwYTNpb2FtMXY3bQ==)**\r\n**[Twitter](https://twitter.com/sudutpandangddy)**\r\n**[WhatsApp](+6282275809177)**"
        }
      }
    },
    "pending_payout": 0.0,
    "author_reputation": 67.29,
    "children": 4,
    "community": "hive-174680",
    "community_title": "Amazing nature (AN)",
    "url": "/hive-174680/@sudutpandang/looijfqg",
    "active_votes": [
      {
        "voter": "happyphoenix",
        "rshares": 64215270297
      },
      {
        "voter": "simonjay",
        "rshares": 20643698059
      },
      {
        "voter": "sudutpandang",
        "rshares": 358983097
      },
      {
        "voter": "andyblack",
        "rshares": 18354437865
      },
      {
        "voter": "steemporras",
        "rshares": 2730946155
      },
      {
        "voter": "taniagonzalez",
        "rshares": 39215877733
      },
      {
        "voter": "relf87",
        "rshares": 31761186702
      },
      {
        "voter": "lovver",
        "rshares": 9588678026
      },
      {
        "voter": "encuentro",
        "rshares": 5220297318
      }
    ],
    "stats": {
      "gray": false,
      "hide": false,
      "flag_weight": 0.0
    },
    "blacklists": [],
    "fyp": {
      "rank": 5,
      "final_score": 0.7,
      "score_relevance": 0.6000000000000001,
      "score_recency": 0.7,
      "score_engagement": 0.6,
      "score_credibility": 0.7,
      "community_boost_applied": false,
      "boost_source": null,
      "source": "personalized"
    }
  },
  {
    "author": "naniplayergamer",
    "permlink": "gkhntydw",
    "title": "Sitting On A Straw Nest Hammock In A Farm Resort",
    "body": "<center>\n\n[![](https://ipfs-3speak.b-cdn.net/ipfs/bafybeigepo6jeqe4wxtmzg7v7a54flyydous3olt34cpsvh26lieglyayy/)](https://3speak.tv/watch?v=naniplayergamer/gkhntydw)\n\n▶️ [Watch on 3Speak](https://3speak.tv/watch?v=naniplayergamer/gkhntydw)\n\n</center>\n\n---\n\nGood evening, everyone.\r\n\r\nThis morning, my mom and I went to my school to get my report card for this school year, and I am ready to go to the 6th grade soon. After that, we went to the mall to buy some groceries, and when we got back home, we just left our groceries and headed somewhere on the farm. We went to see the new farm resort, which is not very far from our house and is located in the middle of the wilderness. There are not a lot of houses going there, and what we saw was all trees, farm animals, and hearing the sounds of insects. It is very relaxing but it is a little scary because we rarely saw people on our way there. When we got to the farm resort, there were only two guests and us. We ordered food right away because we were already very hungry at that time. While waiting for our food to be served, we walked around and saw some straw-nest hammocks. It was pretty cool, so we tried sitting on one of them. Here's a shor",
    "category": "hive-181335",
    "created": "2024-06-29T12:12:03",
    "json_metadata": {
      "image": [
        "https://ipfs-3speak.b-cdn.net/ipfs/bafybeigepo6jeqe4wxtmzg7v7a54flyydous3olt34cpsvh26lieglyayy"
      ],
      "tags": [
        "travel",
        "amazingnature",
        "threespeaktv",
        "vyb",
        "mydailyblog",
        "aliveandthriving",
        "thisisawesome",
        "philippines",
        "life",
        "discoveryit",
        "naniplayergamer"
      ],
      "app": "3speak/0.3.0",
      "video": {
        "info": {
          "file": "ipfs://QmejPD2r99JJ2JJPWFFkREG1AErGpSDbjaDqLC7qVvbff6",
          "ipfs": null,
          "lang": "en",
          "title": "Sitting On A Straw Nest Hammock In A Farm Resort",
          "author": "naniplayergamer",
          "duration": 7.639365,
          "filesize": 1049702,
          "permlink": "gkhntydw",
          "platform": "3speak",
          "video_v2": "ipfs://QmcWtCqykJXu17dy9eckF8jMBPfJnctyt93e5UTxz9oTLH/manifest.m3u8",
          "sourceMap": [
            {
              "url": "ipfs://QmcWtCqykJXu17dy9eckF8jMBPfJnctyt93e5UTxz9oTLH/manifest.m3u8",
              "type": "video",
              "format": "m3u8"
            },
            {
              "url": "ipfs://bafybeigepo6jeqe4wxtmzg7v7a54flyydous3olt34cpsvh26lieglyayy",
              "type": "thumbnail"
            }
          ],
          "firstUpload": false,
          "ipfsThumbnail": null
        },
        "content": {
          "tags": [
            "travel",
            "amazingnature",
            "threespeaktv",
            "vyb",
            "mydailyblog",
            "aliveandthriving",
            "thisisawesome",
            "philippines",
            "life",
            "discoveryit",
            "naniplayergamer"
          ],
          "description": "Good evening, everyone.\r\n\r\nThis morning, my mom and I went to my school to get my report card for this school year, and I am ready to go to the 6th grade soon. After that, we went to the mall to buy some groceries, and when we got back home, we just left our groceries and headed somewhere on the farm. We went to see the new farm resort, which is not very far from our house and is located in the middle of the wilderness. There are not a lot of houses going there, and what we saw was all trees, farm animals, and hearing the sounds of insects. It is very relaxing but it is a little scary because we rarely saw people on our way there. When we got to the farm resort, there were only two guests and us. We ordered food right away because we were already very hungry at that time. While waiting for our food to be served, we walked around and saw some straw-nest hammocks. It was pretty cool, so we tried sitting on one of them. Here's a short video of me sitting on the straw nest hammock. I hope you enjoy the view. I am not sure if it is playing, maybe it's just my internet but I hope it does.\r\n\r\nThat's all for today. Happy weekend everyone.\r\n\r\nXoxo,\r\n@naniplayergamer\r\nYour 11-year-old friend\r\n\r\nJune 29, 2024\r\nPhilippines\r\n\r\nAll Original Content"
        }
      }
    },
    "pending_payout": 0.0,
    "author_reputation": 64.76,
    "children": 9,
    "community": "hive-181335",
    "community_title": "Threespeak",
    "url": "/hive-181335/@naniplayergamer/gkhntydw",
    "active_votes": [
      {
        "voter": "allmonitors",
        "rshares": 39527018037
      },
      {
        "voter": "jlufer",
        "rshares": 9187050994
      },
      {
        "voter": "dylanhobalart",
        "rshares": 66871091478
      },
      {
        "voter": "noemilunastorta",
        "rshares": 38003537624
      },
      {
        "voter": "bloghound",
        "rshares": 88395920069
      },
      {
        "voter": "arrliinn",
        "rshares": 49644372616
      },
      {
        "voter": "isnochys",
        "rshares": 10422592388
      },
      {
        "voter": "divinekids",
        "rshares": 7472010447
      },
      {
        "voter": "miprimerconcurso",
        "rshares": 6959880325
      },
      {
        "voter": "jim888",
        "rshares": 276062241739
      },
      {
        "voter": "nanobot",
        "rshares": 3320287246
      },
      {
        "voter": "vinzie1",
        "rshares": 18941324630
      },
      {
        "voter": "gaottantacinque",
        "rshares": 859540372
      },
      {
        "voter": "annephilbrick",
        "rshares": 74858023514
      },
      {
        "voter": "gasaeightyfive",
        "rshares": 1046836974
      },
      {
        "voter": "marcocasario",
        "rshares": 78330764510
      },
      {
        "voter": "cribbio",
        "rshares": 2347492056
      },
      {
        "voter": "bpcvoter1",
        "rshares": 173187447
      },
      {
        "voter": "keys-defender",
        "rshares": 9390545296
      },
      {
        "voter": "hive-defender",
        "rshares": 415503911
      },
      {
        "voter": "itsmiessyonpeakd",
        "rshares": 4546319216
      },
      {
        "voter": "theshot2414",
        "rshares": 5053850986
      },
      {
        "voter": "crypto-shots",
        "rshares": 42992668
      },
      {
        "voter": "cryptoshots.nft",
        "rshares": 1456407387
      },
      {
        "voter": "konaqua",
        "rshares": 3990187716
      },
      {
        "voter": "poplar-22",
        "rshares": 11154040933
      },
      {
        "voter": "cryptoshots.play",
        "rshares": 92723733
      },
      {
        "voter": "zehn34",
        "rshares": 3610422806
      },
      {
        "voter": "naniplayergamer",
        "rshares": 26023104868
      },
      {
        "voter": "cryptoshotsdoom",
        "rshares": 0
      },
      {
        "voter": "karina.gpt",
        "rshares": 0
      },
      {
        "voter": "coolmidwestguy",
        "rshares": 41406180519
      },
      {
        "voter": "georgehive",
        "rshares": 227502842573
      },
      {
        "voter": "sisjane",
        "rshares": 828389481
      },
      {
        "voter": "ciberman-76",
        "rshares": 0
      }
    ],
    "stats": {
      "gray": false,
      "hide": false,
      "flag_weight": 0.0
    },
    "blacklists": [],
    "fyp": {
      "rank": 6,
      "final_score": 0.65,
      "score_relevance": 0.55,
      "score_recency": 0.7,
      "score_engagement": 0.6,
      "score_credibility": 0.7,
      "community_boost_applied": false,
      "boost_source": null,
      "source": "personalized"
    }
  }
]
