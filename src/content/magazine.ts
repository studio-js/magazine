import type { Article, CategoryDefinition, IssueProject, Note, SiteContent } from "../types";

export const articles = [
  {
    "slug": "quiet-images-after-the-opening",
    "title": {
      "ko": "오프닝이 끝난 뒤 이미지가 남는 방식",
      "en": "How Images Remain After the Opening"
    },
    "subtitle": {
      "ko": "사람들이 빠져나간 뒤 작품은 더 낮은 목소리로 보인다. 이 글은 전시가 이벤트에서 경험으로 바뀌는 순간을 따라간다.",
      "en": "What remains longer than the bright first impression of a show is often a small distance."
    },
    "deck": {
      "ko": "사람들이 빠져나간 뒤 작품은 더 낮은 목소리로 보인다. 이 글은 전시가 이벤트에서 경험으로 바뀌는 순간을 따라간다.",
      "en": "After the crowd leaves, the work appears in a lower voice. This essay follows the moment an exhibition shifts from event to experience."
    },
    "category": "art",
    "subcategoryKey": "exhibitions",
    "subcategoryKeys": [
      "exhibitions"
    ],
    "subcategory": {
      "ko": "전시",
      "en": "Exhibitions"
    },
    "date": "2026-05-02",
    "issue": "Issue 01",
    "readTime": {
      "ko": "6분 읽기",
      "en": "6 min read"
    },
    "location": {
      "ko": "서울",
      "en": "Seoul"
    },
    "heroClass": "image-atelier",
    "heroImage": "",
    "hideHeroImage": false,
    "tags": {
      "ko": [
        "전시",
        "이미지",
        "시선"
      ],
      "en": [
        "Exhibition",
        "Image",
        "Gaze"
      ]
    },
    "excerpt": {
      "ko": "사람들이 빠져나간 뒤 작품은 더 낮은 목소리로 보인다. 이 글은 전시가 이벤트에서 경험으로 바뀌는 순간을 따라간다.",
      "en": "Seeing a show is closer to remembering the work afterward than standing in front of it."
    },
    "quote": {
      "ko": "좋은 이미지는 즉시 이해되지 않고, 천천히 돌아오는 방식으로 오래 남는다.",
      "en": "A good image lasts not by being understood immediately, but by returning slowly."
    },
    "railMode": "default",
    "railClass": "image-atelier",
    "railImage": "",
    "hideRailImage": false,
    "railTitle": {
      "ko": "행사가 끝난 전시장",
      "en": "The Gallery After the Event"
    },
    "railText": {
      "ko": "오프닝의 전시장은 작품보다 사람의 움직임으로 먼저 기억된다. 잔과 대화, 짧은 인사, 벽 앞에서 멈추는 몸들이 공간의 첫 이미지를 만든다.",
      "en": "An opening is remembered first through movement rather than work: glasses, conversations, short greetings, bodies pausing before a wall."
    },
    "sections": [
      {
        "heading": {
          "ko": "행사가 끝난 전시장",
          "en": "The Gallery After the Event"
        },
        "paragraphs": {
          "ko": [
            "오프닝의 전시장은 작품보다 사람의 움직임으로 먼저 기억된다. 잔과 대화, 짧은 인사, 벽 앞에서 멈추는 몸들이 공간의 첫 이미지를 만든다.",
            "다음 날 다시 찾은 전시장에는 다른 밀도가 있다. 작품은 더 선명해지기보다 오히려 조용해지고, 관람자는 이미지와 자신의 거리감을 새로 재기 시작한다."
          ],
          "en": [
            "An opening is remembered first through movement rather than work: glasses, conversations, short greetings, bodies pausing before a wall.",
            "When revisited the next day, the gallery has another density. The work becomes quieter rather than clearer, and the viewer begins to measure distance again."
          ]
        },
        "railClass": "image-atelier",
        "railImage": "",
        "hideRailImage": false
      },
      {
        "heading": {
          "ko": "기억되는 이미지",
          "en": "The Image That Is Remembered"
        },
        "paragraphs": {
          "ko": [
            "어떤 이미지는 너무 많은 설명을 요구하지 않는다. 대신 관람자가 이미지를 떠난 뒤 자신의 언어로 다시 조립할 여지를 남긴다.",
            "그래서 전시는 기록 사진보다 느린 기억에 가깝다. 이미지의 윤곽은 시간이 지나며 흐려지지만, 이상하게도 감각의 온도는 더 또렷해진다."
          ],
          "en": [
            "Some images do not demand much explanation. They leave room for the viewer to reconstruct them later in their own language.",
            "An exhibition is therefore closer to slow memory than documentation. The outline fades with time, but the temperature of the sensation becomes clearer."
          ]
        },
        "railClass": "image-atelier",
        "railImage": "",
        "hideRailImage": false
      }
    ]
  },
  {
    "slug": "artist-desk-as-studio-map",
    "title": {
      "ko": "작업대는 작가의 가장 작은 지도다",
      "en": "The Desk Is the Artist's Smallest Map"
    },
    "subtitle": {
      "ko": "스튜디오의 중심은 완성작이 아니라 매일 손이 닿는 작업대일 때가 많다. 그 표면은 생각이 이동한 흔적을 담는다.",
      "en": "Scattered tools, paper, and marked corners reveal the direction of work."
    },
    "deck": {
      "ko": "스튜디오의 중심은 완성작이 아니라 매일 손이 닿는 작업대일 때가 많다. 그 표면은 생각이 이동한 흔적을 담는다.",
      "en": "The center of a studio is often not the finished work but the desk touched every day. Its surface stores the trace of thought in motion."
    },
    "category": "art",
    "subcategoryKey": "artists",
    "subcategoryKeys": [
      "artists"
    ],
    "subcategory": {
      "ko": "작가",
      "en": "Artists"
    },
    "date": "2026-04-26",
    "issue": "Issue 01",
    "readTime": {
      "ko": "5분 읽기",
      "en": "5 min read"
    },
    "location": {
      "ko": "성수",
      "en": "Seongsu"
    },
    "heroClass": "image-field",
    "heroImage": "",
    "hideHeroImage": false,
    "tags": {
      "ko": [
        "스튜디오",
        "작업",
        "도구"
      ],
      "en": [
        "Studio",
        "Work",
        "Tools"
      ]
    },
    "excerpt": {
      "ko": "스튜디오의 중심은 완성작이 아니라 매일 손이 닿는 작업대일 때가 많다. 그 표면은 생각이 이동한 흔적을 담는다.",
      "en": "The arrangement of a desk shows what an artist holds onto and what they postpone."
    },
    "quote": {
      "ko": "완성된 작품보다 솔직한 것은 아직 정리되지 않은 작업대일지도 모른다.",
      "en": "An unresolved desk may be more honest than a finished work."
    },
    "railMode": "default",
    "railClass": "image-field",
    "railImage": "",
    "hideRailImage": false,
    "railTitle": {
      "ko": "표면의 질서",
      "en": "Order on the Surface"
    },
    "railText": {
      "ko": "작업대는 정돈되어 있지 않아도 질서를 가진다. 자주 쓰는 도구는 손에 가까이 놓이고, 아직 결정되지 않은 종이는 시야의 가장자리에 남는다.",
      "en": "A desk can have order without being tidy. Frequently used tools stay near the hand, while undecided paper remains at the edge of sight."
    },
    "sections": [
      {
        "heading": {
          "ko": "표면의 질서",
          "en": "Order on the Surface"
        },
        "paragraphs": {
          "ko": [
            "작업대는 정돈되어 있지 않아도 질서를 가진다. 자주 쓰는 도구는 손에 가까이 놓이고, 아직 결정되지 않은 종이는 시야의 가장자리에 남는다.",
            "그 질서는 외부인이 한 번에 읽기 어렵다. 하지만 작가에게는 각각의 위치가 다음 행동을 부르는 표시가 된다."
          ],
          "en": [
            "A desk can have order without being tidy. Frequently used tools stay near the hand, while undecided paper remains at the edge of sight.",
            "That order is difficult for an outsider to read at once. For the artist, each position becomes a sign that calls the next action."
          ]
        },
        "railClass": "image-field",
        "railImage": "",
        "hideRailImage": false
      },
      {
        "heading": {
          "ko": "작업의 방향",
          "en": "Direction of Work"
        },
        "paragraphs": {
          "ko": [
            "스튜디오를 이해하는 가장 빠른 방법은 완성작을 묻기보다 작업대를 보는 것이다. 그곳에는 선택과 망설임이 동시에 남아 있다.",
            "좋은 작업대는 결과를 과시하지 않는다. 대신 아직 끝나지 않은 생각이 어떤 방향으로 움직이는지 조용히 드러낸다."
          ],
          "en": [
            "The quickest way to understand a studio is to look at the desk rather than ask about the finished work. Choice and hesitation remain there together.",
            "A good desk does not display results. It quietly reveals where unfinished thought is moving."
          ]
        },
        "railClass": "image-field",
        "railImage": "",
        "hideRailImage": false
      }
    ]
  },
  {
    "slug": "ai-interface-without-performance",
    "title": {
      "ko": "과시하지 않는 AI 인터페이스",
      "en": "An AI Interface Without Performance"
    },
    "subtitle": {
      "ko": "AI 제품은 종종 능력을 보여주기 위해 너무 많은 표정을 짓는다. 그러나 사용자가 다시 찾는 인터페이스는 결과보다 과정의 부담을 줄여준다.",
      "en": "A flow that interrupts less lasts longer than a screen that tries to look smart."
    },
    "deck": {
      "ko": "AI 제품은 종종 능력을 보여주기 위해 너무 많은 표정을 짓는다. 그러나 사용자가 다시 찾는 인터페이스는 결과보다 과정의 부담을 줄여준다.",
      "en": "AI products often make too many gestures to prove capability. The interface people return to reduces the burden of the process rather than showing off results."
    },
    "category": "tech",
    "subcategoryKey": "ai",
    "subcategoryKeys": [
      "ai"
    ],
    "subcategory": {
      "ko": "AI",
      "en": "AI"
    },
    "date": "2026-04-18",
    "issue": "Issue 01",
    "readTime": {
      "ko": "7분 읽기",
      "en": "7 min read"
    },
    "location": {
      "ko": "온라인",
      "en": "Online"
    },
    "heroClass": "image-signal",
    "heroImage": "",
    "hideHeroImage": false,
    "tags": {
      "ko": [
        "AI",
        "UX",
        "도구"
      ],
      "en": [
        "AI",
        "UX",
        "Tool"
      ]
    },
    "excerpt": {
      "ko": "AI 제품은 종종 능력을 보여주기 위해 너무 많은 표정을 짓는다. 그러나 사용자가 다시 찾는 인터페이스는 결과보다 과정의 부담을 줄여준다.",
      "en": "A good AI interface shortens the time users spend noticing the technology."
    },
    "quote": {
      "ko": "지능을 보여주려는 화면보다 사용자의 판단을 편하게 만드는 화면이 더 현대적이다.",
      "en": "A screen that eases judgment is more contemporary than one that performs intelligence."
    },
    "railMode": "default",
    "railClass": "image-signal",
    "railImage": "",
    "hideRailImage": false,
    "railTitle": {
      "ko": "능력의 소음",
      "en": "The Noise of Capability"
    },
    "railText": {
      "ko": "AI 인터페이스는 종종 자신이 얼마나 많은 일을 할 수 있는지 먼저 보여주려 한다. 예시 프롬프트, 움직이는 배지, 끝없이 열리는 제안은 처음에는 인상적이지만 금세 피로해진다.",
      "en": "AI interfaces often try to show capability first. Prompt examples, moving badges, and endless suggestions are impressive at first but quickly become tiring."
    },
    "sections": [
      {
        "heading": {
          "ko": "능력의 소음",
          "en": "The Noise of Capability"
        },
        "paragraphs": {
          "ko": [
            "AI 인터페이스는 종종 자신이 얼마나 많은 일을 할 수 있는지 먼저 보여주려 한다. 예시 프롬프트, 움직이는 배지, 끝없이 열리는 제안은 처음에는 인상적이지만 금세 피로해진다.",
            "사용자가 원하는 것은 기술의 설명이 아니라 자신의 문제를 덜 복잡하게 만드는 흐름이다. 화면은 똑똑해 보이기보다 조용히 정확해야 한다."
          ],
          "en": [
            "AI interfaces often try to show capability first. Prompt examples, moving badges, and endless suggestions are impressive at first but quickly become tiring.",
            "Users do not need an explanation of the technology. They need a flow that makes their problem less complex. The screen should be quietly precise rather than visibly smart."
          ]
        },
        "railClass": "image-signal",
        "railImage": "",
        "hideRailImage": false
      },
      {
        "heading": {
          "ko": "좋은 흐름",
          "en": "A Better Flow"
        },
        "paragraphs": {
          "ko": [
            "좋은 AI 도구는 사용자가 질문을 바꾸고, 결과를 의심하고, 다시 요청하는 과정을 자연스럽게 만든다. 한 번에 정답을 주는 것보다 판단의 단계를 잘 보이게 하는 편이 중요하다.",
            "인터페이스의 감각은 애니메이션보다 리듬에서 나온다. 기다리는 시간, 수정하는 위치, 결과를 비교하는 방식이 제품의 인상을 만든다."
          ],
          "en": [
            "A good AI tool makes it natural to revise a question, doubt a result, and ask again. Revealing the stages of judgment matters more than delivering a single answer.",
            "The feeling of an interface comes from rhythm rather than animation: waiting time, places to revise, and ways to compare outcomes."
          ]
        },
        "railClass": "image-signal",
        "railImage": "",
        "hideRailImage": false
      }
    ]
  },
  {
    "slug": "data-dashboard-as-reading-room",
    "title": {
      "ko": "데이터 대시보드를 읽는 방처럼 만들기",
      "en": "Making a Data Dashboard Feel Like a Reading Room"
    },
    "subtitle": {
      "ko": "좋은 대시보드는 정보의 양보다 시선의 순서를 먼저 설계한다. 데이터는 화면에서 문장처럼 읽힐 수 있어야 한다.",
      "en": "Designing a structure that can be looked at longer, instead of showing more numbers."
    },
    "deck": {
      "ko": "좋은 대시보드는 정보의 양보다 시선의 순서를 먼저 설계한다. 데이터는 화면에서 문장처럼 읽힐 수 있어야 한다.",
      "en": "A good dashboard designs the order of attention before the amount of information. Data should be readable on screen like sentences."
    },
    "category": "tech",
    "subcategoryKey": "systems",
    "subcategoryKeys": [
      "systems"
    ],
    "subcategory": {
      "ko": "시스템",
      "en": "Systems"
    },
    "date": "2026-04-08",
    "issue": "Issue 01",
    "readTime": {
      "ko": "6분 읽기",
      "en": "6 min read"
    },
    "location": {
      "ko": "베를린",
      "en": "Berlin"
    },
    "heroClass": "image-atelier",
    "heroImage": "",
    "hideHeroImage": false,
    "tags": {
      "ko": [
        "데이터",
        "시스템",
        "UX"
      ],
      "en": [
        "Data",
        "System",
        "UX"
      ]
    },
    "excerpt": {
      "ko": "좋은 대시보드는 정보의 양보다 시선의 순서를 먼저 설계한다. 데이터는 화면에서 문장처럼 읽힐 수 있어야 한다.",
      "en": "The point of a dashboard is not to show every metric at once, but to move the viewer toward the next question."
    },
    "quote": {
      "ko": "숫자는 차갑지만 숫자를 읽는 순서는 충분히 따뜻하게 설계할 수 있다.",
      "en": "Numbers are cold, but the order in which they are read can be designed with warmth."
    },
    "railMode": "default",
    "railClass": "image-atelier",
    "railImage": "",
    "hideRailImage": false,
    "railTitle": {
      "ko": "정보의 온도",
      "en": "The Temperature of Information"
    },
    "railText": {
      "ko": "대시보드는 자주 업무의 긴장과 연결된다. 그래서 화면이 복잡할수록 사용자는 더 빨리 지친다. 숫자의 정확성만큼 중요한 것은 보는 사람이 길을 잃지 않는 구조다.",
      "en": "Dashboards are often tied to workplace tension. The more complex the screen, the quicker the user becomes tired. Structure matters as much as numerical accuracy."
    },
    "sections": [
      {
        "heading": {
          "ko": "정보의 온도",
          "en": "The Temperature of Information"
        },
        "paragraphs": {
          "ko": [
            "대시보드는 자주 업무의 긴장과 연결된다. 그래서 화면이 복잡할수록 사용자는 더 빨리 지친다. 숫자의 정확성만큼 중요한 것은 보는 사람이 길을 잃지 않는 구조다.",
            "읽는 방처럼 설계된 화면은 조용한 층위를 가진다. 가장 중요한 수치가 먼저 보이고, 세부 지표는 사용자가 필요할 때 자연스럽게 가까워진다."
          ],
          "en": [
            "Dashboards are often tied to workplace tension. The more complex the screen, the quicker the user becomes tired. Structure matters as much as numerical accuracy.",
            "A screen designed like a reading room has quiet layers. The most important figures appear first, while details come closer when needed."
          ]
        },
        "railClass": "image-atelier",
        "railImage": "",
        "hideRailImage": false
      },
      {
        "heading": {
          "ko": "질문의 순서",
          "en": "The Order of Questions"
        },
        "paragraphs": {
          "ko": [
            "데이터는 스스로 결론이 되지 않는다. 좋은 시각화는 사용자가 다음에 어떤 질문을 해야 하는지 알려준다.\n\n\nasdasdasd",
            "그래서 대시보드의 디자인은 그래프 선택보다 편집에 가깝다. 무엇을 크게 두고, 무엇을 뒤로 미룰지 정하는 일이 핵심이다."
          ],
          "en": [
            "Data is not a conclusion on its own. Good visualization suggests what question should be asked next.",
            "Dashboard design is therefore closer to editing than choosing charts. The key is deciding what comes forward and what stays behind."
          ]
        },
        "railClass": "image-atelier",
        "railImage": "",
        "hideRailImage": false
      }
    ]
  },
  {
    "slug": "brand-system-with-room-to-breathe",
    "title": {
      "ko": "숨 쉴 공간이 있는 브랜드 시스템",
      "en": "A Brand System With Room to Breathe"
    },
    "subtitle": {
      "ko": "브랜드 시스템은 모든 것을 통제하기 위해 존재하지 않는다. 좋은 시스템은 상황이 달라져도 같은 태도를 유지하게 한다.",
      "en": "A structure that allows variation lasts longer than perfect rules."
    },
    "deck": {
      "ko": "브랜드 시스템은 모든 것을 통제하기 위해 존재하지 않는다. 좋은 시스템은 상황이 달라져도 같은 태도를 유지하게 한다.",
      "en": "A brand system does not exist to control everything. A good system keeps the same attitude across changing situations."
    },
    "category": "design",
    "subcategoryKey": "brand",
    "subcategoryKeys": [
      "brand"
    ],
    "subcategory": {
      "ko": "브랜드",
      "en": "Brand"
    },
    "date": "2026-03-30",
    "issue": "Issue 01",
    "readTime": {
      "ko": "6분 읽기",
      "en": "6 min read"
    },
    "location": {
      "ko": "도쿄",
      "en": "Tokyo"
    },
    "heroClass": "image-interface",
    "heroImage": "",
    "hideHeroImage": false,
    "tags": {
      "ko": [
        "브랜드",
        "시스템",
        "그래픽"
      ],
      "en": [
        "Brand",
        "System",
        "Graphic"
      ]
    },
    "excerpt": {
      "ko": "브랜드 시스템은 모든 것을 통제하기 위해 존재하지 않는다. 좋은 시스템은 상황이 달라져도 같은 태도를 유지하게 한다.",
      "en": "A brand system is less a set of rules than a repeatable attitude."
    },
    "quote": {
      "ko": "너무 완벽한 시스템은 실제 사용이 시작되는 순간 가장 먼저 깨진다.",
      "en": "An overly perfect system is often the first thing to break when real use begins."
    },
    "railMode": "default",
    "railClass": "image-interface",
    "railImage": "",
    "hideRailImage": false,
    "railTitle": {
      "ko": "규칙과 여백",
      "en": "Rules and Margins"
    },
    "railText": {
      "ko": "좋은 브랜드 가이드는 금지 목록보다 판단 기준을 제공한다. 모든 포스터와 화면을 같은 방식으로 만들 필요는 없지만, 같은 목소리로 느껴져야 한다.",
      "en": "A good brand guide provides criteria rather than a list of prohibitions. Not every poster or screen must look the same, but they should feel like the same voice."
    },
    "sections": [
      {
        "heading": {
          "ko": "규칙과 여백",
          "en": "Rules and Margins"
        },
        "paragraphs": {
          "ko": [
            "좋은 브랜드 가이드는 금지 목록보다 판단 기준을 제공한다. 모든 포스터와 화면을 같은 방식으로 만들 필요는 없지만, 같은 목소리로 느껴져야 한다.",
            "여백은 단순히 비어 있는 공간이 아니다. 시스템이 새로운 상황을 받아들일 수 있게 만드는 완충지대다."
          ],
          "en": [
            "A good brand guide provides criteria rather than a list of prohibitions. Not every poster or screen must look the same, but they should feel like the same voice.",
            "Whitespace is not simply empty space. It is a buffer that lets the system accept new situations."
          ]
        },
        "railClass": "image-interface",
        "railImage": "",
        "hideRailImage": false
      },
      {
        "heading": {
          "ko": "변주 가능한 태도",
          "en": "An Attitude That Can Vary"
        },
        "paragraphs": {
          "ko": [
            "브랜드가 오래 유지되려면 예외를 견딜 수 있어야 한다. 현실의 콘텐츠는 늘 가이드라인보다 복잡하기 때문이다.",
            "좋은 시스템은 예외를 실패로 보지 않는다. 오히려 어떤 변주까지 같은 세계 안에 들어올 수 있는지 보여주는 기준이 된다."
          ],
          "en": [
            "For a brand to last, it must withstand exceptions. Real content is always more complex than guidelines.",
            "A good system does not treat exceptions as failure. It becomes the measure for what variations can still belong to the same world."
          ]
        },
        "railClass": "image-interface",
        "railImage": "",
        "hideRailImage": false
      }
    ]
  },
  {
    "slug": "chair-prototype-and-its-shadow",
    "title": {
      "ko": "의자의 그림자가 먼저 말하는 것",
      "en": "What a Chair's Shadow Says First"
    },
    "subtitle": {
      "ko": "의자를 보는 일은 앉는 기능만 확인하는 일이 아니다. 등받이의 기울기, 다리의 간격, 좌판의 두께가 방 안에 어떤 무게를 남기는지 읽는 일이다.",
      "en": "A form can be read first in the darkness it leaves on the floor."
    },
    "deck": {
      "ko": "의자를 보는 일은 앉는 기능만 확인하는 일이 아니다. 등받이의 기울기, 다리의 간격, 좌판의 두께가 방 안에 어떤 무게를 남기는지 읽는 일이다.",
      "en": "Reading a chair is not only checking how it supports the body. It is reading the weight its back, legs, and seat leave in a room."
    },
    "category": "design",
    "subcategoryKey": "product",
    "subcategoryKeys": [
      "product"
    ],
    "subcategory": {
      "ko": "제품",
      "en": "Product"
    },
    "date": "2026-03-21",
    "issue": "Issue 01",
    "readTime": {
      "ko": "5분 읽기",
      "en": "5 min read"
    },
    "location": {
      "ko": "밀라노",
      "en": "Milan"
    },
    "heroClass": "image-material",
    "heroImage": "",
    "hideHeroImage": false,
    "tags": {
      "ko": [
        "제품",
        "비례",
        "재료"
      ],
      "en": [
        "Product",
        "Proportion",
        "Material"
      ]
    },
    "excerpt": {
      "ko": "의자를 보는 일은 앉는 기능만 확인하는 일이 아니다. 등받이의 기울기, 다리의 간격, 좌판의 두께가 방 안에 어떤 무게를 남기는지 읽는 일이다.",
      "en": "A chair's silhouette reveals both the body it expects and the atmosphere it creates."
    },
    "quote": {
      "ko": "좋은 의자는 스스로를 크게 말하지 않고, 주변의 공기를 조금 다르게 만든다.",
      "en": "A good chair does not speak loudly; it slightly changes the air around it."
    },
    "railMode": "default",
    "railClass": "image-material",
    "railImage": "",
    "hideRailImage": false,
    "railTitle": {
      "ko": "실루엣의 무게",
      "en": "The Weight of a Silhouette"
    },
    "railText": {
      "ko": "의자의 비례는 가까이서보다 한 발 물러섰을 때 더 분명해진다. 등받이의 높이, 좌판의 깊이, 다리 사이의 간격이 하나의 실루엣으로 묶이기 때문이다.",
      "en": "A chair's proportion becomes clearer from a step away. Back height, seat depth, and leg spacing gather into one silhouette."
    },
    "sections": [
      {
        "heading": {
          "ko": "실루엣의 무게",
          "en": "The Weight of a Silhouette"
        },
        "paragraphs": {
          "ko": [
            "의자의 비례는 가까이서보다 한 발 물러섰을 때 더 분명해진다. 등받이의 높이, 좌판의 깊이, 다리 사이의 간격이 하나의 실루엣으로 묶이기 때문이다.",
            "잘 만든 의자는 장식을 앞세우지 않는다. 대신 방 안에서 어느 정도의 존재감을 가져야 하는지 정확히 알고 있는 물건처럼 보인다."
          ],
          "en": [
            "A chair's proportion becomes clearer from a step away. Back height, seat depth, and leg spacing gather into one silhouette.",
            "A well-made chair does not lead with ornament. It appears to know exactly how much presence it should hold in a room."
          ]
        },
        "railClass": "image-material",
        "railImage": "",
        "hideRailImage": false
      },
      {
        "heading": {
          "ko": "그림자의 비례",
          "en": "The Proportion of Shadow"
        },
        "paragraphs": {
          "ko": [
            "의자는 정면보다 그림자에서 비례가 더 잘 보일 때가 있다. 등받이의 기울기, 다리의 간격, 좌판의 두께가 한 번에 단순한 형태로 압축된다.",
            "좋은 제품 디자인은 사용자의 몸을 생각하지만, 동시에 공간 안에서 어떤 그림자를 남길지도 생각한다."
          ],
          "en": [
            "A chair's proportion can be clearer in its shadow than from the front. The tilt of the back, spacing of legs, and thickness of the seat compress into a simple form.",
            "Good product design considers the user's body, but also the shadow it leaves in a room."
          ]
        },
        "railClass": "image-material",
        "railImage": "",
        "hideRailImage": false
      }
    ]
  },
  {
    "slug": "slow-thinking-in-fast-tools",
    "title": {
      "ko": "빠른 도구 안에서 느리게 생각하기",
      "en": "Thinking Slowly Inside Fast Tools"
    },
    "subtitle": {
      "ko": "생산성의 속도는 사유의 속도와 늘 같지 않다.",
      "en": "The speed of productivity is not always the speed of thought."
    },
    "deck": {
      "ko": "도구는 점점 빨라지지만 좋은 판단은 여전히 느린 시간을 요구한다. 이 글은 빠른 인터페이스 안에서 느린 사유를 지키는 방법을 묻는다.",
      "en": "Tools become faster, but good judgment still requires slow time. This essay asks how slow thought can survive inside fast interfaces."
    },
    "category": "philosophy",
    "subcategoryKey": "time",
    "subcategoryKeys": [
      "time",
      "thought",
      "body"
    ],
    "subcategory": {
      "ko": "시간",
      "en": "Time"
    },
    "date": "2026-03-12",
    "issue": "Issue 01",
    "readTime": {
      "ko": "7분 읽기",
      "en": "7 min read"
    },
    "location": {
      "ko": "서울",
      "en": "Seoul"
    },
    "heroClass": "image-thought",
    "heroImage": "",
    "hideHeroImage": false,
    "tags": {
      "ko": [
        "시간",
        "도구",
        "사유"
      ],
      "en": [
        "Time",
        "Tools",
        "Thought"
      ]
    },
    "excerpt": {
      "ko": "빠른 도구가 늘 좋은 생각을 만들지는 않는다. 때로는 멈춤이 기능보다 중요하다.",
      "en": "Fast tools do not always create better thought. Sometimes pause matters more than features."
    },
    "quote": {
      "ko": "우리는 더 빨리 만들 수 있게 되었지만, 더 잘 판단하는 방법은 아직 배워야 한다.",
      "en": "We can make faster now, but we still need to learn how to judge better."
    },
    "railMode": "default",
    "railClass": "image-thought",
    "railImage": "",
    "hideRailImage": false,
    "railTitle": {
      "ko": "속도의 착각",
      "en": "The Illusion of Speed"
    },
    "railText": {
      "ko": "빠른 도구는 결과를 빨리 보여준다. 그러나 결과가 빨리 나타난다고 해서 생각도 빠르게 완성되는 것은 아니다.",
      "en": "Fast tools show results quickly. But a quick result does not mean thought has been completed quickly."
    },
    "sections": [
      {
        "heading": {
          "ko": "속도의 착각",
          "en": "The Illusion of Speed"
        },
        "paragraphs": {
          "ko": [
            "빠른 도구는 결과를 빨리 보여준다. 그러나 결과가 빨리 나타난다고 해서 생각도 빠르게 완성되는 것은 아니다.",
            "오히려 너무 빠른 화면은 사용자가 자신의 판단을 건너뛰게 만들 수 있다. 선택의 이유가 만들어지기 전에 다음 결과가 도착하기 때문이다."
          ],
          "en": [
            "Fast tools show results quickly. But a quick result does not mean thought has been completed quickly.",
            "A screen that is too fast can make users skip their own judgment because the next result arrives before a reason for choice is formed."
          ]
        },
        "railClass": "image-thought",
        "railImage": "",
        "hideRailImage": false
      },
      {
        "heading": {
          "ko": "멈춤의 기능",
          "en": "The Function of Pause"
        },
        "paragraphs": {
          "ko": [
            "느림은 생산성의 반대가 아니다. 좋은 멈춤은 다음 행동의 정확도를 높이고, 불필요한 반복을 줄인다.",
            "도구가 진짜로 현대적이려면 속도만 제공해서는 부족하다. 사용자가 생각할 수 있는 간격을 함께 설계해야 한다."
          ],
          "en": [
            "Slowness is not the opposite of productivity. A good pause increases the accuracy of the next action and reduces unnecessary repetition.",
            "For a tool to be truly contemporary, speed is not enough. It must also design intervals in which the user can think."
          ]
        },
        "railClass": "image-thought",
        "railImage": "",
        "hideRailImage": false
      }
    ]
  },
  {
    "slug": "ethics-of-default-settings",
    "title": {
      "ko": "기본값의 윤리",
      "en": "The Ethics of Default Settings"
    },
    "subtitle": {
      "ko": "사용자가 선택하지 않은 선택도 디자인의 책임 안에 있다.",
      "en": "Choices users did not make still belong to design responsibility."
    },
    "deck": {
      "ko": "기본값은 중립적이지 않다. 알림, 공개 범위, 추천 방식은 사용자의 시간을 어떤 방향으로 흐르게 할지 미리 정한다.",
      "en": "Defaults are not neutral. Notifications, visibility, and recommendation modes pre-decide the direction of a user's time."
    },
    "category": "philosophy",
    "subcategoryKey": "ethics",
    "subcategoryKeys": [
      "ethics",
      "thought",
      "body"
    ],
    "subcategory": {
      "ko": "윤리",
      "en": "Ethics"
    },
    "date": "2026-03-04",
    "issue": "Issue 01",
    "readTime": {
      "ko": "6분 읽기",
      "en": "6 min read"
    },
    "location": {
      "ko": "온라인",
      "en": "Online"
    },
    "heroClass": "image-library",
    "heroImage": "",
    "hideHeroImage": false,
    "tags": {
      "ko": [
        "윤리",
        "디자인",
        "기본값"
      ],
      "en": [
        "Ethics",
        "Design",
        "Defaults"
      ]
    },
    "excerpt": {
      "ko": "기본값은 작은 설정처럼 보이지만 사용자의 행동을 가장 오래 바꾼다.",
      "en": "Defaults look like small settings, yet they change behavior for the longest time."
    },
    "quote": {
      "ko": "사용자가 아무것도 하지 않았을 때 시스템이 무엇을 하는지가 디자인의 태도를 보여준다.",
      "en": "What a system does when the user does nothing reveals the attitude of its design."
    },
    "railMode": "default",
    "railClass": "image-library",
    "railImage": "",
    "hideRailImage": false,
    "railTitle": {
      "ko": "중립처럼 보이는 선택",
      "en": "A Choice That Looks Neutral"
    },
    "railText": {
      "ko": "대부분의 사용자는 모든 설정을 검토하지 않는다. 그래서 기본값은 사실상 가장 강력한 제안이 된다.",
      "en": "Most users do not review every setting. Defaults therefore become the strongest proposal a product makes."
    },
    "sections": [
      {
        "heading": {
          "ko": "중립처럼 보이는 선택",
          "en": "A Choice That Looks Neutral"
        },
        "paragraphs": {
          "ko": [
            "대부분의 사용자는 모든 설정을 검토하지 않는다. 그래서 기본값은 사실상 가장 강력한 제안이 된다.",
            "알림이 켜져 있는지, 계정이 공개인지, 추천이 자동으로 시작되는지는 사용자의 생활 리듬과 정보 환경을 바꾼다."
          ],
          "en": [
            "Most users do not review every setting. Defaults therefore become the strongest proposal a product makes.",
            "Whether notifications are on, accounts are public, or recommendations begin automatically changes the rhythm of life and the information environment."
          ]
        },
        "railClass": "image-library",
        "railImage": "",
        "hideRailImage": false
      },
      {
        "heading": {
          "ko": "책임의 위치",
          "en": "Where Responsibility Sits"
        },
        "paragraphs": {
          "ko": [
            "디자인은 선택지를 제공하는 일만으로 끝나지 않는다. 어떤 선택지를 기본으로 둘지 정하는 순간 이미 판단은 시작된다.",
            "좋은 기본값은 기업의 지표보다 사용자의 회복 가능성을 먼저 생각한다. 사용자가 나중에 바꿀 수 있다는 말은 충분한 면책이 아니다."
          ],
          "en": [
            "Design does not end with offering options. Judgment begins the moment one option is chosen as the default.",
            "A good default considers the user's capacity to recover before company metrics. Saying users can change it later is not enough."
          ]
        },
        "railClass": "image-library",
        "railImage": "",
        "hideRailImage": false
      }
    ]
  }
] satisfies Article[];

export const categories: CategoryDefinition[] = [
  {
    key: "art",
    label: { ko: "예술", en: "Art" },
    description: {
      ko: "전시장 이후에도 남는 이미지와 작업실의 물성을 따라갑니다.",
      en: "Images that remain after the gallery and the material traces of studio practice."
    },
    subcategories: [
      { key: "exhibitions", label: { ko: "전시", en: "Exhibitions" } },
      { key: "artists", label: { ko: "작가", en: "Artists" } },
      { key: "images", label: { ko: "이미지", en: "Images" } },
      { key: "sound", label: { ko: "사운드", en: "Sound" } },
      { key: "architecture", label: { ko: "건축", en: "Architecture" } }
    ]
  },
  {
    key: "tech",
    label: { ko: "테크", en: "Tech" },
    description: {
      ko: "기술이 똑똑해 보이는 순간보다 덜 방해하는 구조를 봅니다.",
      en: "Less interested in smart performance than in structures that interrupt less."
    },
    subcategories: [
      { key: "ai", label: { ko: "AI", en: "AI" } },
      { key: "interface", label: { ko: "인터페이스", en: "Interface" } },
      { key: "tools", label: { ko: "도구", en: "Tools" } },
      { key: "systems", label: { ko: "시스템", en: "Systems" } }
    ]
  },
  {
    key: "design",
    label: { ko: "디자인", en: "Design" },
    description: {
      ko: "제품의 그림자와 브랜드 시스템의 여백처럼 작동하는 형태를 읽습니다.",
      en: "Forms at work, from the shadow of a product to the margins of a brand system."
    },
    subcategories: [
      { key: "graphic", label: { ko: "그래픽", en: "Graphic" } },
      { key: "product", label: { ko: "제품", en: "Product" } },
      { key: "space", label: { ko: "공간", en: "Space" } },
      { key: "brand", label: { ko: "브랜드", en: "Brand" } }
    ]
  },
  {
    key: "beauty",
    label: { ko: "뷰티", en: "Beauty" },
    description: {
      ko: "피부, 색, 향, 루틴이 만드는 감각의 표면을 읽습니다.",
      en: "Skin, color, scent, and routines as surfaces of daily perception."
    },
    subcategories: [
      { key: "skincare", label: { ko: "스킨케어", en: "Skincare" } },
      { key: "makeup", label: { ko: "메이크업", en: "Makeup" } },
      { key: "fragrance", label: { ko: "향", en: "Fragrance" } },
      { key: "haircare", label: { ko: "헤어케어", en: "Haircare" } }
    ]
  },
  {
    key: "philosophy",
    label: { ko: "철학", en: "Philosophy" },
    description: {
      ko: "속도, 기본값, 윤리처럼 화면 뒤에 숨어 있는 판단을 묻습니다.",
      en: "Judgments hidden behind screens: speed, defaults, ethics, and time."
    },
    subcategories: [
      { key: "thought", label: { ko: "사유", en: "Thought" } },
      { key: "ethics", label: { ko: "윤리", en: "Ethics" } },
      { key: "time", label: { ko: "시간", en: "Time" } },
      { key: "body", label: { ko: "몸", en: "Body" } }
    ]
  }
];

export const notes: Note[] = [
  {
    date: "May 02",
    title: { ko: "작업실의 표면에서 시작한 편집", en: "An edit that begins on the studio surface" },
    body: {
      ko: "완성된 작품보다 그 앞의 표면을 봅니다. 책상, 대시보드, 의자의 그림자, 기본값처럼 생각이 아직 굳기 전의 장면들입니다.",
      en: "This edit looks at surfaces before completion: desks, dashboards, chair shadows, and defaults before thought hardens."
    }
  },
  {
    date: "Apr 26",
    title: { ko: "좋은 인터페이스의 낮은 목소리", en: "The lower voice of a good interface" },
    body: {
      ko: "강한 제스처보다 오래 남는 것은 정확한 간격입니다. 기술 글들은 능력보다 부담을 덜어내는 화면을 먼저 묻습니다.",
      en: "Precise intervals last longer than strong gestures. The technology essays ask for screens that reduce burden before proving capability."
    }
  },
  {
    date: "Apr 18",
    title: { ko: "목록은 가장 조용한 이미지다", en: "A list is the quietest image" },
    body: {
      ko: "색인은 단순히 이동을 돕는 장치가 아닙니다. 제목의 길이, 날짜의 간격, 반복되는 선이 읽는 속도를 만듭니다.",
      en: "An index is not only navigation. Title length, date spacing, and repeated rules create the speed of reading."
    }
  }
];

export const issueProjects: IssueProject[] = [
  {
    number: "No. 03",
    title: { ko: "Soft Indexes", en: "Soft Indexes" },
    subtitle: {
      ko: "목록과 표지가 서로를 읽게 만드는 세 번째 디지털 에디션",
      en: "A third digital edition where lists and covers learn to read one another."
    },
    deck: {
      ko: "세 번째 이슈는 인덱스, 표지, 검색 화면, 리듬 있는 목록을 독립된 편집 장면으로 다룹니다. 무엇을 먼저 보여줄지보다 어떤 속도로 발견하게 할지를 묻습니다.",
      en: "The third issue treats indexes, covers, search screens, and rhythmic lists as independent editorial scenes. It asks less what should be shown first than at what speed discovery should happen."
    },
    date: { ko: "2026년 7월", en: "July 2026" },
    format: { ko: "온라인 에디션 / 5개 피처", en: "Online edition / 5 features" },
    availability: { ko: "오픈 액세스", en: "Open access" },
    coverCredit: {
      ko: "커버 이미지: 편집부가 구성한 색인 표면 스터디",
      en: "Cover image: an editorial study of an index surface."
    },
    editorNote: {
      ko: "이번 호는 읽는 사람을 빠르게 이동시키는 대신 조금 더 정확히 머물게 하는 색인을 상상합니다. 목록, 검색창, 표지, 캡션은 단순한 부속물이 아니라 발행본 전체의 속도를 결정하는 장치입니다.",
      en: "This issue imagines an index that keeps readers in place with greater precision instead of moving them faster. Lists, search bars, covers, and captions are not accessories but devices that set the edition's speed."
    },
    credits: [
      { label: { ko: "편집", en: "Editor" }, value: { ko: "The Thing Editorial Desk", en: "The Thing Editorial Desk" } },
      { label: { ko: "이미지 시스템", en: "Image System" }, value: { ko: "Index Surface Unit", en: "Index Surface Unit" } },
      { label: { ko: "리서치", en: "Research" }, value: { ko: "서울 / 코펜하겐 원격 노트", en: "Seoul / Copenhagen remote notes" } }
    ],
    features: [
      {
        slug: "cover-as-index",
        role: { ko: "Cover Essay", en: "Cover Essay" },
        title: { ko: "표지는 가장 작은 목차다", en: "A Cover Is the Smallest Contents Page" },
        intro: {
          ko: "표지를 대표 이미지가 아니라 읽기 순서를 정하는 장치로 봅니다.",
          en: "The cover is treated as a device for ordering reading, not a representative image."
        },
        excerpt: {
          ko: "한 장의 표지는 발행본 전체의 제목, 속도, 밀도를 한 번에 압축합니다. 이 글은 표지를 가장 작은 목차로 다시 읽습니다.",
          en: "A single cover compresses title, speed, and density at once. This essay rereads the cover as the smallest table of contents."
        },
        body: {
          ko: [
            "표지는 가장 먼저 보이지만 가장 나중에 이해되는 면입니다. 이번 호는 커버 이미지를 독자의 시선을 붙잡는 광고판이 아니라 읽는 순서를 정리하는 작은 목차로 다룹니다.",
            "이미지의 중앙보다 가장자리, 제목보다 간격, 강한 색보다 남겨진 여백이 더 많은 정보를 운반할 수 있습니다. 표지가 조용할수록 다음 장면의 리듬은 또렷해집니다."
          ],
          en: [
            "A cover is seen first and understood last. This issue treats the cover image not as a billboard for attention but as a small table of contents for reading order.",
            "Edges can carry more information than centers, intervals more than titles, and remaining space more than strong color. The quieter the cover, the clearer the rhythm of the next scene becomes."
          ]
        },
        credit: { ko: "Cover / Index Surface Unit", en: "Cover / Index Surface Unit" },
        location: { ko: "Editorial", en: "Editorial" },
        readTime: { ko: "에세이", en: "Essay" },
        heroClass: "image-library"
      },
      {
        slug: "search-without-hurry",
        role: { ko: "Interface Note", en: "Interface Note" },
        title: { ko: "서두르지 않는 검색창", en: "The Search Bar That Does Not Hurry" },
        intro: {
          ko: "검색은 답을 당기는 기능보다 질문을 다듬는 편집면에 가깝습니다.",
          en: "Search is closer to an editorial surface for refining questions than a function that pulls answers."
        },
        excerpt: {
          ko: "자동완성, 빈 상태, 결과 개수의 표현이 읽는 사람의 판단 시간을 어떻게 바꾸는지 살핍니다.",
          en: "Autocomplete, empty states, and result counts are examined as ways of changing the reader's judgment time."
        },
        body: {
          ko: [
            "검색창은 빠르게 답을 제시하는 곳처럼 보이지만, 좋은 검색 화면은 질문을 조금 더 정확하게 만들 시간을 줍니다. 자동완성의 언어와 결과 없음의 문장은 모두 편집된 안내입니다.",
            "이 장면은 검색을 성능의 문제가 아니라 독자의 호흡을 정하는 인터페이스의 문제로 옮깁니다. 빠른 반응보다 덜 서두르는 피드백이 더 오래 남습니다."
          ],
          en: [
            "A search bar appears to offer quick answers, but a good search screen gives a question time to become more precise. Autocomplete language and empty-state sentences are both edited guidance.",
            "This scene moves search from a performance problem to an interface problem that sets the reader's breath. Feedback that hurries less often lasts longer."
          ]
        },
        credit: { ko: "Interface / Reading Systems", en: "Interface / Reading Systems" },
        location: { ko: "Search room", en: "Search room" },
        readTime: { ko: "노트", en: "Note" },
        heroClass: "image-interface"
      },
      {
        slug: "ledger-of-images",
        role: { ko: "Portfolio", en: "Portfolio" },
        title: { ko: "이미지 장부", en: "Ledger of Images" },
        intro: {
          ko: "이미지를 카드가 아니라 반복되는 회계 장부처럼 배열합니다.",
          en: "Images are arranged like a repeated ledger rather than isolated cards."
        },
        excerpt: {
          ko: "사진, 캡션, 번호, 여백이 같은 규칙으로 반복될 때 이미지 목록은 하나의 긴 문장처럼 읽힙니다.",
          en: "When photographs, captions, numbers, and space repeat under one rule, an image list reads like one long sentence."
        },
        body: {
          ko: [
            "이미지 목록은 화려한 그리드가 아니라 규칙이 드러나는 장부가 될 수 있습니다. 같은 크기, 같은 캡션 거리, 같은 번호 체계는 개별 이미지를 하나의 흐름 안에 묶습니다.",
            "포트폴리오의 목표는 많은 장면을 보여주는 것이 아니라 다음 이미지로 넘어가는 이유를 만드는 것입니다. 반복은 지루함이 아니라 신뢰의 방식이 됩니다."
          ],
          en: [
            "An image list can be a ledger where rules become visible rather than a spectacular grid. Shared size, caption distance, and numbering bind separate images into one flow.",
            "The goal of a portfolio is not to show many scenes, but to create a reason to move to the next image. Repetition becomes a form of trust rather than boredom."
          ]
        },
        credit: { ko: "Images / Editorial Desk", en: "Images / Editorial Desk" },
        location: { ko: "12 plates", en: "12 plates" },
        readTime: { ko: "시각 노트", en: "Visual note" },
        heroClass: "image-field"
      },
      {
        slug: "caption-temperature",
        role: { ko: "Dossier", en: "Dossier" },
        title: { ko: "캡션의 온도", en: "The Temperature of Captions" },
        intro: {
          ko: "캡션이 이미지의 방향과 독자의 거리를 조절하는 방식을 기록합니다.",
          en: "A record of how captions adjust the direction of an image and the reader's distance."
        },
        excerpt: {
          ko: "건조한 정보, 편집자의 개입, 물성의 묘사가 각기 다른 온도로 이미지 아래에 놓입니다.",
          en: "Dry information, editorial intervention, and material description sit beneath images at different temperatures."
        },
        body: {
          ko: [
            "캡션은 이미지의 설명문이 아니라 이미지가 과하게 말하지 않도록 잡아주는 무게추입니다. 너무 가까우면 이미지를 닫고, 너무 멀면 독자를 떠나게 합니다.",
            "이번 파일은 캡션의 길이, 고유명사의 위치, 날짜와 장소의 순서를 나란히 놓고 읽습니다. 작은 문장이 이미지의 온도를 바꾸는 순간을 모았습니다."
          ],
          en: [
            "A caption is not an image explanation but a counterweight that keeps an image from speaking too much. Too close, it closes the image; too far, it lets the reader leave.",
            "This file reads caption length, proper-name placement, and the order of date and place side by side. It collects the moments when a small sentence changes an image's temperature."
          ]
        },
        credit: { ko: "Dossier / Caption Desk", en: "Dossier / Caption Desk" },
        location: { ko: "Caption table", en: "Caption table" },
        readTime: { ko: "파일", en: "File" },
        heroClass: "image-material"
      },
      {
        slug: "after-index",
        role: { ko: "Afterword", en: "Afterword" },
        title: { ko: "색인 이후의 독자", en: "The Reader After the Index" },
        intro: {
          ko: "잘 만든 색인은 독자를 빠르게 끝내게 하지 않고 다시 돌아오게 합니다.",
          en: "A well-made index does not help readers finish quickly; it makes them return."
        },
        excerpt: {
          ko: "이슈의 마지막 장은 발견, 재방문, 저장의 리듬을 편집의 책임으로 닫습니다.",
          en: "The final chapter closes discovery, return, and saving as editorial responsibilities."
        },
        body: {
          ko: [
            "좋은 색인은 길을 줄이는 장치가 아닙니다. 독자가 왜 여기서 멈췄는지, 왜 다시 돌아올 수 있는지를 남겨두는 장치입니다.",
            "이번 호는 목록을 기능이 아니라 태도로 읽습니다. 빠른 이동보다 정확한 재방문을 가능하게 하는 것이 디지털 발행본의 오래 남는 형식입니다."
          ],
          en: [
            "A good index is not a shortcut. It leaves behind why a reader stopped here and why they might return later.",
            "This issue reads lists as an attitude rather than a feature. Enabling accurate return instead of faster movement is the more durable form of a digital edition."
          ]
        },
        credit: { ko: "Afterword / Editorial Desk", en: "Afterword / Editorial Desk" },
        location: { ko: "Closing", en: "Closing" },
        readTime: { ko: "후기", en: "Afterword" },
        heroClass: "image-thought"
      }
    ]
  },
  {
    number: "No. 02",
    title: { ko: "Rooms for Defaults", en: "Rooms for Defaults" },
    subtitle: {
      ko: "보이지 않는 선택이 생활의 리듬을 바꾸는 두 번째 디지털 에디션",
      en: "A second digital edition on invisible choices changing the rhythm of living."
    },
    deck: {
      ko: "두 번째 이슈는 기본 설정, 알림, 추천, 빈 화면을 작은 방처럼 배열합니다. 기능의 크기보다 선택의 방향이 어떻게 감각을 바꾸는지 살핍니다.",
      en: "The second issue arranges defaults, notifications, recommendations, and empty states as small rooms. It studies how the direction of choice changes sense more than the size of a feature."
    },
    date: { ko: "2026년 6월", en: "June 2026" },
    format: { ko: "온라인 에디션 / 4개 피처", en: "Online edition / 4 features" },
    availability: { ko: "오픈 액세스", en: "Open access" },
    coverCredit: {
      ko: "커버 이미지: 기본값 패널과 조용한 알림 스터디",
      en: "Cover image: a study of default panels and quiet notifications."
    },
    editorNote: {
      ko: "기본값은 중립적인 출발점처럼 보이지만, 실제로는 누군가 먼저 정해 둔 방향입니다. 이번 호는 그 방향이 몸의 습관과 화면의 신뢰를 어떻게 바꾸는지 따라갑니다.",
      en: "A default looks like a neutral starting point, but it is a direction someone set in advance. This issue follows how that direction changes bodily habits and trust in screens."
    },
    credits: [
      { label: { ko: "편집", en: "Editor" }, value: { ko: "The Thing Editorial Desk", en: "The Thing Editorial Desk" } },
      { label: { ko: "시스템 노트", en: "Systems Notes" }, value: { ko: "Default Rooms", en: "Default Rooms" } },
      { label: { ko: "리서치", en: "Research" }, value: { ko: "서울 / 도쿄 원격 노트", en: "Seoul / Tokyo remote notes" } }
    ],
    features: [
      {
        slug: "default-room",
        role: { ko: "Cover Note", en: "Cover Note" },
        title: { ko: "기본값이 놓인 방", en: "The Room Where Defaults Sit" },
        intro: {
          ko: "기본 설정 화면을 사소한 부속 페이지가 아니라 발행본의 주제처럼 읽습니다.",
          en: "The default settings screen is read as the issue's subject, not a minor accessory page."
        },
        excerpt: {
          ko: "켜짐과 꺼짐, 추천과 보류, 저장과 삭제가 하나의 방 안에서 서로 다른 윤곽을 만듭니다.",
          en: "On and off, recommendation and pause, save and delete form different outlines in one room."
        },
        body: {
          ko: [
            "기본값은 사용자가 처음 만나는 결정입니다. 그래서 설정 화면은 뒤에 숨은 기술 페이지가 아니라 생활 리듬을 먼저 정하는 편집면에 가깝습니다.",
            "이번 표지는 조용한 토글과 흐린 패널을 한 방 안에 놓습니다. 중요한 것은 버튼의 수가 아니라 사용자가 무엇을 당연하게 받아들이도록 설계되었는가입니다."
          ],
          en: [
            "A default is the first decision a user meets. A settings screen is therefore less a hidden technical page than an editorial surface that sets the rhythm of living.",
            "This cover places quiet toggles and pale panels in one room. The point is not the number of buttons, but what the user is designed to accept as obvious."
          ]
        },
        credit: { ko: "Cover / Default Rooms", en: "Cover / Default Rooms" },
        location: { ko: "Editorial", en: "Editorial" },
        readTime: { ko: "소개", en: "Intro" },
        heroClass: "image-system"
      },
      {
        slug: "quiet-notifications",
        role: { ko: "Interface File", en: "Interface File" },
        title: { ko: "조용한 알림의 문장", en: "Sentences for Quiet Notifications" },
        intro: {
          ko: "알림은 소리보다 문장의 온도로 더 오래 기억됩니다.",
          en: "Notifications are remembered longer through sentence temperature than through sound."
        },
        excerpt: {
          ko: "알림의 어휘, 빈도, 묵음 상태가 화면과 사용자 사이의 신뢰를 조정합니다.",
          en: "Vocabulary, frequency, and silent states adjust trust between screen and user."
        },
        body: {
          ko: [
            "알림은 작은 문장이지만 하루의 속도를 크게 바꿉니다. 너무 자주 말하면 신뢰를 잃고, 너무 늦게 말하면 책임을 잃습니다.",
            "이 파일은 알림을 마케팅의 장치가 아니라 사용자의 시간에 들어가는 편집 문장으로 다룹니다. 조용함은 기능 부족이 아니라 정확한 판단의 결과입니다."
          ],
          en: [
            "A notification is a small sentence that can strongly change the speed of a day. Speak too often and it loses trust; speak too late and it loses responsibility.",
            "This file treats notifications not as marketing devices but as edited sentences entering a user's time. Quietness is not a lack of function but the result of precise judgment."
          ]
        },
        credit: { ko: "File / Interface Desk", en: "File / Interface Desk" },
        location: { ko: "Notification table", en: "Notification table" },
        readTime: { ko: "파일", en: "File" },
        heroClass: "image-signal"
      },
      {
        slug: "recommended-by-whom",
        role: { ko: "Conversation", en: "Conversation" },
        title: { ko: "누가 추천을 말하는가", en: "Who Speaks the Recommendation" },
        intro: {
          ko: "추천 시스템의 목소리를 대화 형식으로 낮춰 읽습니다.",
          en: "The voice of recommendation systems is lowered into a conversation format."
        },
        excerpt: {
          ko: "추천은 선택지를 넓히기도 하지만 취향의 바깥을 더 조용히 지울 수도 있습니다.",
          en: "Recommendation can widen options, but it can also quietly erase the outside of taste."
        },
        body: {
          ko: [
            "추천은 친절한 제안처럼 보이지만 언제나 특정한 방향을 갖습니다. 그 방향이 누구의 편의를 기준으로 정해졌는지 묻는 순간 추천은 편집의 문제가 됩니다.",
            "대화는 알고리즘을 설명하기보다 추천의 말투를 읽습니다. 사용자가 선택했다고 느끼는 순간에도 화면은 이미 선택지를 배열하고 있습니다."
          ],
          en: [
            "Recommendation looks like a helpful suggestion, but it always has a direction. The moment we ask whose convenience set that direction, recommendation becomes an editorial problem.",
            "The conversation reads the tone of recommendation rather than explaining the algorithm. Even when users feel they have chosen, the screen has already arranged the options."
          ]
        },
        credit: { ko: "Dialogue / Systems Desk", en: "Dialogue / Systems Desk" },
        location: { ko: "Remote notes", en: "Remote notes" },
        readTime: { ko: "대화", en: "Dialogue" },
        heroClass: "image-interface"
      },
      {
        slug: "empty-state",
        role: { ko: "Afterword", en: "Afterword" },
        title: { ko: "빈 상태의 책임", en: "The Responsibility of Empty States" },
        intro: {
          ko: "아무것도 없다는 화면은 실제로 가장 많은 방향을 제안합니다.",
          en: "A screen that says nothing is there often suggests the most directions."
        },
        excerpt: {
          ko: "빈 화면의 문장과 버튼은 사용자가 다음에 무엇을 해야 하는지 조용히 결정합니다.",
          en: "Sentences and buttons in empty states quietly decide what the user should do next."
        },
        body: {
          ko: [
            "빈 상태는 비어 있는 화면이 아닙니다. 아직 데이터가 없다는 사실을 어떤 감정과 행동으로 연결할지 결정하는 첫 문장입니다.",
            "마지막 장은 빈 화면을 책임의 문제로 닫습니다. 아무것도 없을 때조차 화면은 사용자의 다음 시간을 편집합니다."
          ],
          en: [
            "An empty state is not an empty screen. It is the first sentence deciding what feeling and action should follow the absence of data.",
            "The final chapter closes the empty screen as a question of responsibility. Even when there is nothing, the screen edits the user's next time."
          ]
        },
        credit: { ko: "Afterword / Editorial Desk", en: "Afterword / Editorial Desk" },
        location: { ko: "Closing", en: "Closing" },
        readTime: { ko: "후기", en: "Afterword" },
        heroClass: "image-thought"
      }
    ]
  },
  {
  number: "No. 01",
  title: { ko: "Screen of Things", en: "Screen of Things" },
  subtitle: {
    ko: "사물이 화면이 되고, 화면이 다시 감각의 기준이 되는 첫 번째 디지털 에디션",
    en: "A first digital edition on objects becoming screens, and screens becoming a measure of sense."
  },
  deck: {
    ko: "첫 번째 이슈는 작업실의 표면, 조용한 인터페이스, 데이터의 독서성, 브랜드 시스템의 여백을 하나의 질문 아래 새로 배치한 디지털 발행물입니다.",
    en: "The first issue is a digital publication that newly arranges studio surfaces, quiet interfaces, readable data, and breathable brand systems under one question."
  },
  date: { ko: "2026년 5월", en: "May 2026" },
  format: { ko: "온라인 에디션 / 5개 피처", en: "Online edition / 5 features" },
  availability: { ko: "오픈 액세스", en: "Open access" },
  coverCredit: {
    ko: "커버 이미지: 편집부가 구성한 가상 작업대 스터디",
    en: "Cover image: an editorial study of an imagined studio surface."
  },
  editorNote: {
    ko: "이번 호는 다섯 개의 장면으로 구성됩니다. 커버 이미지, 포트폴리오, 대화, 리서치 파일, 애프터워드가 서로 다른 방식으로 같은 질문을 이어받습니다. 무엇이 사물의 감각을 화면으로 옮기고, 어떤 화면은 다시 우리의 판단을 바꾸는가.",
    en: "This issue is built as five scenes: cover image, portfolio, conversation, research file, and afterword. Each carries the same question differently: what turns the sense of objects into screens, and which screens return to alter judgment?"
  },
  credits: [
    { label: { ko: "편집", en: "Editor" }, value: { ko: "The Thing Editorial Desk", en: "The Thing Editorial Desk" } },
    { label: { ko: "아트 디렉션", en: "Art Direction" }, value: { ko: "Surface Studies", en: "Surface Studies" } },
    { label: { ko: "리서치", en: "Research" }, value: { ko: "서울 / 베를린 원격 노트", en: "Seoul / Berlin remote notes" } }
  ],
  features: [
    {
      slug: "cover-note",
      role: { ko: "Cover Note", en: "Cover Note" },
      title: { ko: "사물이 화면이 되기 전", en: "Before Objects Become Screens" },
      intro: {
        ko: "커버는 이번 호의 질문을 압축한 한 장의 표면입니다.",
        en: "The cover compresses the issue's question into one surface."
      },
      excerpt: {
        ko: "커버는 기사 하나의 대표 이미지가 아니라 이번 호의 질문을 압축한 별도의 장면입니다. 사물, 화면, 빛, 여백이 같은 평면에서 만납니다.",
        en: "The cover is not a lead article image, but a separate scene that compresses the issue's question: objects, screens, light, and space on one plane."
      },
      body: {
        ko: [
          "이번 호의 커버는 특정 기사의 섬네일이 아니라 독립된 편집 이미지입니다. 정물처럼 놓인 사물과 화면의 기하학이 서로의 경계를 흐리며, 발행 전체의 분위기를 먼저 제안합니다.",
          "잡지의 커버 소개처럼 표지는 발행물의 첫 문장입니다. 무엇을 열어 보는지보다 어떤 세계에 들어가는지를 먼저 알리는 장치로 다룹니다."
        ],
        en: [
          "The cover is not a thumbnail for one article, but an independent editorial image. Objects and screen geometry blur their borders and set the atmosphere of the edition first.",
          "Like a magazine cover note, it acts as the first sentence of the publication: less about what is being opened, more about the world being entered."
        ]
      },
      credit: { ko: "Cover / Surface Studies", en: "Cover / Surface Studies" },
      location: { ko: "Editorial", en: "Editorial" },
      readTime: { ko: "소개", en: "Intro" },
      heroClass: "image-atelier"
    },
    {
      slug: "portfolio",
      role: { ko: "Portfolio", en: "Portfolio" },
      title: { ko: "다섯 개의 표면", en: "Five Surfaces" },
      intro: {
        ko: "이번 호를 이루는 이미지 문법을 따로 펼친 포트폴리오입니다.",
        en: "A portfolio that unfolds the image grammar of this issue."
      },
      excerpt: {
        ko: "작업대, 대시보드, 의자의 그림자, 브랜드 여백, 기본값 화면을 한 호의 시각적 재료로 다시 배열합니다.",
        en: "Desk, dashboard, chair shadow, brand space, and default screen are rearranged as the visual material of one issue."
      },
      body: {
        ko: [
          "포트폴리오는 분야별 색인이 아니라 장면의 연결입니다. 서로 다른 소재를 같은 눈높이로 놓아 이번 호의 리듬을 만들고, 각 이미지가 다음 텍스트로 넘어가는 속도를 조절합니다.",
          "이미지 중심 매거진의 카드처럼 이미지와 한 줄의 정보가 우선하지만, 여기서는 카테고리명이 아니라 발행물 내부의 장면 번호가 정보의 기준이 됩니다."
        ],
        en: [
          "The portfolio is not a category index, but a connection of scenes. Different materials are placed at the same eye level to set the rhythm of the issue.",
          "Like image-led magazine cards, image and a thin line of information come first, but the reference point is the issue's internal sequence rather than a category name."
        ]
      },
      credit: { ko: "Images / Editorial Desk", en: "Images / Editorial Desk" },
      location: { ko: "5 plates", en: "5 plates" },
      readTime: { ko: "시각 노트", en: "Visual note" },
      heroClass: "image-field"
    },
    {
      slug: "conversation",
      role: { ko: "Conversation", en: "Conversation" },
      title: { ko: "낮게 말하는 도구", en: "A Tool That Speaks Low" },
      intro: {
        ko: "이번 호가 기술을 다루는 태도를 대화 형식으로 소개합니다.",
        en: "A conversation-format introduction to how the issue treats technology."
      },
      excerpt: {
        ko: "기술을 능력의 전시가 아니라 낮은 목소리의 편집 장치로 봅니다. 화면이 덜 말할 때 사용자는 더 오래 판단합니다.",
        en: "Technology is treated less as a display of capability and more as a low editorial device. When the screen speaks less, judgment lasts longer."
      },
      body: {
        ko: [
          "대화는 특정 제품 리뷰가 아니라 이번 호의 기술 감각을 설명합니다. 좋은 인터페이스가 무엇을 더하는지보다 무엇을 비워두는지를 묻고, 빠른 응답 뒤에 남는 피로를 편집의 문제로 옮깁니다.",
          "이 장은 기사 목록으로 이동하는 목차가 아니라 이슈의 방법론을 설명하는 소개입니다."
        ],
        en: [
          "The conversation is not a product review, but an explanation of the issue's technological sense. It asks what a good interface leaves empty before asking what it adds.",
          "This chapter introduces a method for the issue rather than sending the reader to a category list."
        ]
      },
      credit: { ko: "Dialogue / Interface Desk", en: "Dialogue / Interface Desk" },
      location: { ko: "Remote notes", en: "Remote notes" },
      readTime: { ko: "대화", en: "Dialogue" },
      heroClass: "image-interface"
    },
    {
      slug: "dossier",
      role: { ko: "Dossier", en: "Dossier" },
      title: { ko: "읽히는 데이터의 방", en: "A Room for Readable Data" },
      intro: {
        ko: "숫자와 표가 이미지처럼 읽히는 조건을 모은 파일입니다.",
        en: "A file on the conditions that let numbers and tables read like images."
      },
      excerpt: {
        ko: "대시보드와 색인, 표의 간격을 한 편의 방처럼 다룹니다. 데이터가 보이는 것이 아니라 읽히는 순간을 정리합니다.",
        en: "Dashboard, index, and table spacing are treated like one room. The dossier studies the moment data becomes readable, not merely visible."
      },
      body: {
        ko: [
          "도시에 대한 리포트도, 도구에 대한 사용기도 아닙니다. 이번 호가 화면을 읽기 위한 간격을 어떻게 설정하는지 보여주는 내부 파일에 가깝습니다.",
          "잡지 상세 페이지가 작품과 이름을 길게 이어 소개하듯, 이 도시에 없는 방은 발행물의 세부 장면을 문장으로 쌓아 올립니다."
        ],
        en: [
          "This is neither a city report nor a tool review. It is closer to an internal file showing how the issue sets intervals for reading screens.",
          "Like a magazine product page that builds the issue through names and works, this room is assembled through details."
        ]
      },
      credit: { ko: "Dossier / Reading Systems", en: "Dossier / Reading Systems" },
      location: { ko: "Index room", en: "Index room" },
      readTime: { ko: "파일", en: "File" },
      heroClass: "image-system"
    },
    {
      slug: "afterword",
      role: { ko: "Afterword", en: "Afterword" },
      title: { ko: "기본값은 편집이다", en: "Defaults Are Editorial" },
      intro: {
        ko: "마지막 장은 이번 호의 질문을 책임의 문제로 닫습니다.",
        en: "The final chapter closes the issue as a question of responsibility."
      },
      excerpt: {
        ko: "기본값은 설정이 아니라 편집된 방향입니다. 이슈의 마지막 장은 사소한 선택이 생활의 리듬을 바꾸는 방식을 묻습니다.",
        en: "A default is not a setting but an edited direction. The afterword asks how a small choice changes the rhythm of living."
      },
      body: {
        ko: [
          "애프터워드는 윤리라는 큰 단어를 앞세우기보다 작은 기본값이 어디에서 결정되는지를 따라갑니다. 사용자가 보지 못한 선택도 결국 누군가 편집한 문장입니다.",
          "이 장은 다음 호로 넘어가기 전, 화면을 만드는 사람과 읽는 사람이 같은 질문 앞에 서도록 남겨둔 끝문장입니다."
        ],
        en: [
          "The afterword follows where small defaults are decided rather than placing a large word like ethics in front. Choices a user never sees are still edited sentences.",
          "It is the closing line left before the next issue, placing makers and readers of screens before the same question."
        ]
      },
      credit: { ko: "Afterword / Editorial Desk", en: "Afterword / Editorial Desk" },
      location: { ko: "Closing", en: "Closing" },
      readTime: { ko: "후기", en: "Afterword" },
      heroClass: "image-thought"
    }
  ]
  }
];

export const site: SiteContent = {
  title: { ko: "The Thing", en: "The Thing" },
  description: {
    ko: "예술, 테크, 디자인, 뷰티, 철학을 하나의 감각적 편집면으로 엮는 디지털 저널",
    en: "A digital journal connecting art, tech, design, beauty, and philosophy through a quiet editorial lens."
  },
  issueProjects,
  month: { ko: "2026년 7월", en: "July 2026" },
  heroKicker: { ko: "Objects, Screens, Systems", en: "Objects, Screens, Systems" },
  heroTitle: {
    ko: "사물이 화면이 되고, 화면이 다시 사유가 되는 순간.",
    en: "When objects become screens, and screens return as thought."
  },
  heroLead: {
    ko: "작업실의 표면에서 시작해 인터페이스, 데이터 화면, 브랜드 시스템, 뷰티 루틴, 기본값의 윤리로 이동합니다. 서로 다른 주제를 하나의 느린 호흡으로 읽습니다.",
    en: "It begins on the studio surface and moves through interfaces, data screens, brand systems, beauty routines, and the ethics of defaults. Different subjects are read in one slower rhythm."
  },
  keywords: {
    ko: ["표면", "간격", "반복", "그림자", "기본값", "느린 판단"],
    en: ["Surface", "Interval", "Repetition", "Shadow", "Defaults", "Slow Judgment"]
  },
  categories,
  notes
};
