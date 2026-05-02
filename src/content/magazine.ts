import type { Article, CategoryDefinition, Note, SiteContent } from "../types";

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
      { key: "sound", label: { ko: "사운드", en: "Sound" } }
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

export const articles: Article[] = [
  {
    slug: "quiet-images-after-the-opening",
    title: { ko: "오프닝이 끝난 뒤 이미지가 남는 방식", en: "How Images Remain After the Opening" },
    subtitle: {
      ko: "전시장의 환한 첫인상보다 오래 남는 것은 대개 작은 거리감이다.",
      en: "What remains longer than the bright first impression of a show is often a small distance."
    },
    deck: {
      ko: "사람들이 빠져나간 뒤 작품은 더 낮은 목소리로 보인다. 이 글은 전시가 이벤트에서 경험으로 바뀌는 순간을 따라간다.",
      en: "After the crowd leaves, the work appears in a lower voice. This essay follows the moment an exhibition shifts from event to experience."
    },
    category: "art",
    subcategoryKey: "exhibitions",
    subcategoryKeys: ["exhibitions", "images"],
    subcategory: { ko: "전시", en: "Exhibitions" },
    date: "2026-05-02",
    issue: "Issue 01",
    readTime: { ko: "6분 읽기", en: "6 min read" },
    location: { ko: "서울", en: "Seoul" },
    heroClass: "image-atelier",
    tags: { ko: ["전시", "이미지", "시선"], en: ["Exhibition", "Image", "Gaze"] },
    excerpt: {
      ko: "전시를 보는 일은 작품 앞에 서는 것보다 작품을 떠난 뒤 다시 떠올리는 시간에 가깝다.",
      en: "Seeing a show is closer to remembering the work afterward than standing in front of it."
    },
    quote: {
      ko: "좋은 이미지는 즉시 이해되지 않고, 천천히 돌아오는 방식으로 오래 남는다.",
      en: "A good image lasts not by being understood immediately, but by returning slowly."
    },
    sections: [
      {
        heading: { ko: "행사가 끝난 전시장", en: "The Gallery After the Event" },
        paragraphs: {
          ko: [
            "오프닝의 전시장은 작품보다 사람의 움직임으로 먼저 기억된다. 잔과 대화, 짧은 인사, 벽 앞에서 멈추는 몸들이 공간의 첫 이미지를 만든다.",
            "다음 날 다시 찾은 전시장에는 다른 밀도가 있다. 작품은 더 선명해지기보다 오히려 조용해지고, 관람자는 이미지와 자신의 거리감을 새로 재기 시작한다."
          ],
          en: [
            "An opening is remembered first through movement rather than work: glasses, conversations, short greetings, bodies pausing before a wall.",
            "When revisited the next day, the gallery has another density. The work becomes quieter rather than clearer, and the viewer begins to measure distance again."
          ]
        }
      },
      {
        heading: { ko: "기억되는 이미지", en: "The Image That Is Remembered" },
        paragraphs: {
          ko: [
            "어떤 이미지는 너무 많은 설명을 요구하지 않는다. 대신 관람자가 이미지를 떠난 뒤 자신의 언어로 다시 조립할 여지를 남긴다.",
            "그래서 전시는 기록 사진보다 느린 기억에 가깝다. 이미지의 윤곽은 시간이 지나며 흐려지지만, 이상하게도 감각의 온도는 더 또렷해진다."
          ],
          en: [
            "Some images do not demand much explanation. They leave room for the viewer to reconstruct them later in their own language.",
            "An exhibition is therefore closer to slow memory than documentation. The outline fades with time, but the temperature of the sensation becomes clearer."
          ]
        }
      }
    ]
  },
  {
    slug: "artist-desk-as-studio-map",
    title: { ko: "작업대는 작가의 가장 작은 지도다", en: "The Desk Is the Artist's Smallest Map" },
    subtitle: {
      ko: "흩어진 도구와 종이, 표시된 모서리가 작업의 방향을 알려준다.",
      en: "Scattered tools, paper, and marked corners reveal the direction of work."
    },
    deck: {
      ko: "스튜디오의 중심은 완성작이 아니라 매일 손이 닿는 작업대일 때가 많다. 그 표면은 생각이 이동한 흔적을 담는다.",
      en: "The center of a studio is often not the finished work but the desk touched every day. Its surface stores the trace of thought in motion."
    },
    category: "art",
    subcategoryKey: "artists",
    subcategoryKeys: ["artists", "images", "sound"],
    subcategory: { ko: "작가", en: "Artists" },
    date: "2026-04-26",
    issue: "Issue 01",
    readTime: { ko: "5분 읽기", en: "5 min read" },
    location: { ko: "성수", en: "Seongsu" },
    heroClass: "image-field",
    tags: { ko: ["스튜디오", "작업", "도구"], en: ["Studio", "Work", "Tools"] },
    excerpt: {
      ko: "작업대의 배치는 작가가 무엇을 붙잡고 무엇을 미루는지 보여준다.",
      en: "The arrangement of a desk shows what an artist holds onto and what they postpone."
    },
    quote: {
      ko: "완성된 작품보다 솔직한 것은 아직 정리되지 않은 작업대일지도 모른다.",
      en: "An unresolved desk may be more honest than a finished work."
    },
    sections: [
      {
        heading: { ko: "표면의 질서", en: "Order on the Surface" },
        paragraphs: {
          ko: [
            "작업대는 정돈되어 있지 않아도 질서를 가진다. 자주 쓰는 도구는 손에 가까이 놓이고, 아직 결정되지 않은 종이는 시야의 가장자리에 남는다.",
            "그 질서는 외부인이 한 번에 읽기 어렵다. 하지만 작가에게는 각각의 위치가 다음 행동을 부르는 표시가 된다."
          ],
          en: [
            "A desk can have order without being tidy. Frequently used tools stay near the hand, while undecided paper remains at the edge of sight.",
            "That order is difficult for an outsider to read at once. For the artist, each position becomes a sign that calls the next action."
          ]
        }
      },
      {
        heading: { ko: "작업의 방향", en: "Direction of Work" },
        paragraphs: {
          ko: [
            "스튜디오를 이해하는 가장 빠른 방법은 완성작을 묻기보다 작업대를 보는 것이다. 그곳에는 선택과 망설임이 동시에 남아 있다.",
            "좋은 작업대는 결과를 과시하지 않는다. 대신 아직 끝나지 않은 생각이 어떤 방향으로 움직이는지 조용히 드러낸다."
          ],
          en: [
            "The quickest way to understand a studio is to look at the desk rather than ask about the finished work. Choice and hesitation remain there together.",
            "A good desk does not display results. It quietly reveals where unfinished thought is moving."
          ]
        }
      }
    ]
  },
  {
    slug: "ai-interface-without-performance",
    title: { ko: "과시하지 않는 AI 인터페이스", en: "An AI Interface Without Performance" },
    subtitle: {
      ko: "똑똑해 보이는 화면보다 덜 방해하는 흐름이 더 오래 쓰인다.",
      en: "A flow that interrupts less lasts longer than a screen that tries to look smart."
    },
    deck: {
      ko: "AI 제품은 종종 능력을 보여주기 위해 너무 많은 표정을 짓는다. 그러나 사용자가 다시 찾는 인터페이스는 결과보다 과정의 부담을 줄여준다.",
      en: "AI products often make too many gestures to prove capability. The interface people return to reduces the burden of the process rather than showing off results."
    },
    category: "tech",
    subcategoryKey: "ai",
    subcategoryKeys: ["ai", "interface", "tools"],
    subcategory: { ko: "AI", en: "AI" },
    date: "2026-04-18",
    issue: "Issue 01",
    readTime: { ko: "7분 읽기", en: "7 min read" },
    location: { ko: "온라인", en: "Online" },
    heroClass: "image-signal",
    tags: { ko: ["AI", "UX", "도구"], en: ["AI", "UX", "Tool"] },
    excerpt: {
      ko: "좋은 AI 인터페이스는 사용자가 기술을 의식하는 시간을 줄인다.",
      en: "A good AI interface shortens the time users spend noticing the technology."
    },
    quote: {
      ko: "지능을 보여주려는 화면보다 사용자의 판단을 편하게 만드는 화면이 더 현대적이다.",
      en: "A screen that eases judgment is more contemporary than one that performs intelligence."
    },
    sections: [
      {
        heading: { ko: "능력의 소음", en: "The Noise of Capability" },
        paragraphs: {
          ko: [
            "AI 인터페이스는 종종 자신이 얼마나 많은 일을 할 수 있는지 먼저 보여주려 한다. 예시 프롬프트, 움직이는 배지, 끝없이 열리는 제안은 처음에는 인상적이지만 금세 피로해진다.",
            "사용자가 원하는 것은 기술의 설명이 아니라 자신의 문제를 덜 복잡하게 만드는 흐름이다. 화면은 똑똑해 보이기보다 조용히 정확해야 한다."
          ],
          en: [
            "AI interfaces often try to show capability first. Prompt examples, moving badges, and endless suggestions are impressive at first but quickly become tiring.",
            "Users do not need an explanation of the technology. They need a flow that makes their problem less complex. The screen should be quietly precise rather than visibly smart."
          ]
        }
      },
      {
        heading: { ko: "좋은 흐름", en: "A Better Flow" },
        paragraphs: {
          ko: [
            "좋은 AI 도구는 사용자가 질문을 바꾸고, 결과를 의심하고, 다시 요청하는 과정을 자연스럽게 만든다. 한 번에 정답을 주는 것보다 판단의 단계를 잘 보이게 하는 편이 중요하다.",
            "인터페이스의 감각은 애니메이션보다 리듬에서 나온다. 기다리는 시간, 수정하는 위치, 결과를 비교하는 방식이 제품의 인상을 만든다."
          ],
          en: [
            "A good AI tool makes it natural to revise a question, doubt a result, and ask again. Revealing the stages of judgment matters more than delivering a single answer.",
            "The feeling of an interface comes from rhythm rather than animation: waiting time, places to revise, and ways to compare outcomes."
          ]
        }
      }
    ]
  },
  {
    slug: "data-dashboard-as-reading-room",
    title: { ko: "데이터 대시보드를 읽는 방처럼 만들기", en: "Making a Data Dashboard Feel Like a Reading Room" },
    subtitle: {
      ko: "숫자를 더 많이 보여주는 대신 오래 바라볼 수 있는 구조를 설계한다.",
      en: "Designing a structure that can be looked at longer, instead of showing more numbers."
    },
    deck: {
      ko: "좋은 대시보드는 정보의 양보다 시선의 순서를 먼저 설계한다. 데이터는 화면에서 문장처럼 읽힐 수 있어야 한다.",
      en: "A good dashboard designs the order of attention before the amount of information. Data should be readable on screen like sentences."
    },
    category: "tech",
    subcategoryKey: "systems",
    subcategoryKeys: ["systems", "interface", "tools"],
    subcategory: { ko: "시스템", en: "Systems" },
    date: "2026-04-08",
    issue: "Issue 01",
    readTime: { ko: "6분 읽기", en: "6 min read" },
    location: { ko: "베를린", en: "Berlin" },
    heroClass: "image-system",
    tags: { ko: ["데이터", "시스템", "UX"], en: ["Data", "System", "UX"] },
    excerpt: {
      ko: "대시보드의 핵심은 모든 지표를 한 번에 보여주는 것이 아니라 다음 질문으로 이동시키는 것이다.",
      en: "The point of a dashboard is not to show every metric at once, but to move the viewer toward the next question."
    },
    quote: {
      ko: "숫자는 차갑지만 숫자를 읽는 순서는 충분히 따뜻하게 설계할 수 있다.",
      en: "Numbers are cold, but the order in which they are read can be designed with warmth."
    },
    sections: [
      {
        heading: { ko: "정보의 온도", en: "The Temperature of Information" },
        paragraphs: {
          ko: [
            "대시보드는 자주 업무의 긴장과 연결된다. 그래서 화면이 복잡할수록 사용자는 더 빨리 지친다. 숫자의 정확성만큼 중요한 것은 보는 사람이 길을 잃지 않는 구조다.",
            "읽는 방처럼 설계된 화면은 조용한 층위를 가진다. 가장 중요한 수치가 먼저 보이고, 세부 지표는 사용자가 필요할 때 자연스럽게 가까워진다."
          ],
          en: [
            "Dashboards are often tied to workplace tension. The more complex the screen, the quicker the user becomes tired. Structure matters as much as numerical accuracy.",
            "A screen designed like a reading room has quiet layers. The most important figures appear first, while details come closer when needed."
          ]
        }
      },
      {
        heading: { ko: "질문의 순서", en: "The Order of Questions" },
        paragraphs: {
          ko: [
            "데이터는 스스로 결론이 되지 않는다. 좋은 시각화는 사용자가 다음에 어떤 질문을 해야 하는지 알려준다.",
            "그래서 대시보드의 디자인은 그래프 선택보다 편집에 가깝다. 무엇을 크게 두고, 무엇을 뒤로 미룰지 정하는 일이 핵심이다."
          ],
          en: [
            "Data is not a conclusion on its own. Good visualization suggests what question should be asked next.",
            "Dashboard design is therefore closer to editing than choosing charts. The key is deciding what comes forward and what stays behind."
          ]
        }
      }
    ]
  },
  {
    slug: "brand-system-with-room-to-breathe",
    title: { ko: "숨 쉴 공간이 있는 브랜드 시스템", en: "A Brand System With Room to Breathe" },
    subtitle: {
      ko: "완벽한 규칙보다 변주를 허용하는 구조가 더 오래 간다.",
      en: "A structure that allows variation lasts longer than perfect rules."
    },
    deck: {
      ko: "브랜드 시스템은 모든 것을 통제하기 위해 존재하지 않는다. 좋은 시스템은 상황이 달라져도 같은 태도를 유지하게 한다.",
      en: "A brand system does not exist to control everything. A good system keeps the same attitude across changing situations."
    },
    category: "design",
    subcategoryKey: "brand",
    subcategoryKeys: ["brand", "graphic", "space"],
    subcategory: { ko: "브랜드", en: "Brand" },
    date: "2026-03-30",
    issue: "Issue 01",
    readTime: { ko: "6분 읽기", en: "6 min read" },
    location: { ko: "도쿄", en: "Tokyo" },
    heroClass: "image-interface",
    tags: { ko: ["브랜드", "시스템", "그래픽"], en: ["Brand", "System", "Graphic"] },
    excerpt: {
      ko: "브랜드 시스템은 규칙의 집합이 아니라 반복 가능한 태도에 가깝다.",
      en: "A brand system is less a set of rules than a repeatable attitude."
    },
    quote: {
      ko: "너무 완벽한 시스템은 실제 사용이 시작되는 순간 가장 먼저 깨진다.",
      en: "An overly perfect system is often the first thing to break when real use begins."
    },
    sections: [
      {
        heading: { ko: "규칙과 여백", en: "Rules and Margins" },
        paragraphs: {
          ko: [
            "좋은 브랜드 가이드는 금지 목록보다 판단 기준을 제공한다. 모든 포스터와 화면을 같은 방식으로 만들 필요는 없지만, 같은 목소리로 느껴져야 한다.",
            "여백은 단순히 비어 있는 공간이 아니다. 시스템이 새로운 상황을 받아들일 수 있게 만드는 완충지대다."
          ],
          en: [
            "A good brand guide provides criteria rather than a list of prohibitions. Not every poster or screen must look the same, but they should feel like the same voice.",
            "Whitespace is not simply empty space. It is a buffer that lets the system accept new situations."
          ]
        }
      },
      {
        heading: { ko: "변주 가능한 태도", en: "An Attitude That Can Vary" },
        paragraphs: {
          ko: [
            "브랜드가 오래 유지되려면 예외를 견딜 수 있어야 한다. 현실의 콘텐츠는 늘 가이드라인보다 복잡하기 때문이다.",
            "좋은 시스템은 예외를 실패로 보지 않는다. 오히려 어떤 변주까지 같은 세계 안에 들어올 수 있는지 보여주는 기준이 된다."
          ],
          en: [
            "For a brand to last, it must withstand exceptions. Real content is always more complex than guidelines.",
            "A good system does not treat exceptions as failure. It becomes the measure for what variations can still belong to the same world."
          ]
        }
      }
    ]
  },
  {
    slug: "chair-prototype-and-its-shadow",
    title: { ko: "의자의 그림자가 먼저 말하는 것", en: "What a Chair's Shadow Says First" },
    subtitle: {
      ko: "형태의 인상은 종종 정면보다 바닥에 남은 어둠에서 먼저 드러난다.",
      en: "A form can be read first in the darkness it leaves on the floor."
    },
    deck: {
      ko: "의자를 보는 일은 앉는 기능만 확인하는 일이 아니다. 등받이의 기울기, 다리의 간격, 좌판의 두께가 방 안에 어떤 무게를 남기는지 읽는 일이다.",
      en: "Reading a chair is not only checking how it supports the body. It is reading the weight its back, legs, and seat leave in a room."
    },
    category: "design",
    subcategoryKey: "product",
    subcategoryKeys: ["product", "space", "graphic"],
    subcategory: { ko: "제품", en: "Product" },
    date: "2026-03-21",
    issue: "Issue 01",
    readTime: { ko: "5분 읽기", en: "5 min read" },
    location: { ko: "밀라노", en: "Milan" },
    heroClass: "image-material",
    tags: { ko: ["제품", "비례", "재료"], en: ["Product", "Proportion", "Material"] },
    excerpt: {
      ko: "의자의 실루엣은 사용자의 몸과 공간의 분위기를 동시에 드러낸다.",
      en: "A chair's silhouette reveals both the body it expects and the atmosphere it creates."
    },
    quote: {
      ko: "좋은 의자는 스스로를 크게 말하지 않고, 주변의 공기를 조금 다르게 만든다.",
      en: "A good chair does not speak loudly; it slightly changes the air around it."
    },
    sections: [
      {
        heading: { ko: "실루엣의 무게", en: "The Weight of a Silhouette" },
        paragraphs: {
          ko: [
            "의자의 비례는 가까이서보다 한 발 물러섰을 때 더 분명해진다. 등받이의 높이, 좌판의 깊이, 다리 사이의 간격이 하나의 실루엣으로 묶이기 때문이다.",
            "잘 만든 의자는 장식을 앞세우지 않는다. 대신 방 안에서 어느 정도의 존재감을 가져야 하는지 정확히 알고 있는 물건처럼 보인다."
          ],
          en: [
            "A chair's proportion becomes clearer from a step away. Back height, seat depth, and leg spacing gather into one silhouette.",
            "A well-made chair does not lead with ornament. It appears to know exactly how much presence it should hold in a room."
          ]
        }
      },
      {
        heading: { ko: "그림자의 비례", en: "The Proportion of Shadow" },
        paragraphs: {
          ko: [
            "의자는 정면보다 그림자에서 비례가 더 잘 보일 때가 있다. 등받이의 기울기, 다리의 간격, 좌판의 두께가 한 번에 단순한 형태로 압축된다.",
            "좋은 제품 디자인은 사용자의 몸을 생각하지만, 동시에 공간 안에서 어떤 그림자를 남길지도 생각한다."
          ],
          en: [
            "A chair's proportion can be clearer in its shadow than from the front. The tilt of the back, spacing of legs, and thickness of the seat compress into a simple form.",
            "Good product design considers the user's body, but also the shadow it leaves in a room."
          ]
        }
      }
    ]
  },
  {
    slug: "slow-thinking-in-fast-tools",
    title: { ko: "빠른 도구 안에서 느리게 생각하기", en: "Thinking Slowly Inside Fast Tools" },
    subtitle: {
      ko: "생산성의 속도는 사유의 속도와 늘 같지 않다.",
      en: "The speed of productivity is not always the speed of thought."
    },
    deck: {
      ko: "도구는 점점 빨라지지만 좋은 판단은 여전히 느린 시간을 요구한다. 이 글은 빠른 인터페이스 안에서 느린 사유를 지키는 방법을 묻는다.",
      en: "Tools become faster, but good judgment still requires slow time. This essay asks how slow thought can survive inside fast interfaces."
    },
    category: "philosophy",
    subcategoryKey: "time",
    subcategoryKeys: ["time", "thought", "body"],
    subcategory: { ko: "시간", en: "Time" },
    date: "2026-03-12",
    issue: "Issue 01",
    readTime: { ko: "7분 읽기", en: "7 min read" },
    location: { ko: "서울", en: "Seoul" },
    heroClass: "image-thought",
    tags: { ko: ["시간", "도구", "사유"], en: ["Time", "Tools", "Thought"] },
    excerpt: {
      ko: "빠른 도구가 늘 좋은 생각을 만들지는 않는다. 때로는 멈춤이 기능보다 중요하다.",
      en: "Fast tools do not always create better thought. Sometimes pause matters more than features."
    },
    quote: {
      ko: "우리는 더 빨리 만들 수 있게 되었지만, 더 잘 판단하는 방법은 아직 배워야 한다.",
      en: "We can make faster now, but we still need to learn how to judge better."
    },
    sections: [
      {
        heading: { ko: "속도의 착각", en: "The Illusion of Speed" },
        paragraphs: {
          ko: [
            "빠른 도구는 결과를 빨리 보여준다. 그러나 결과가 빨리 나타난다고 해서 생각도 빠르게 완성되는 것은 아니다.",
            "오히려 너무 빠른 화면은 사용자가 자신의 판단을 건너뛰게 만들 수 있다. 선택의 이유가 만들어지기 전에 다음 결과가 도착하기 때문이다."
          ],
          en: [
            "Fast tools show results quickly. But a quick result does not mean thought has been completed quickly.",
            "A screen that is too fast can make users skip their own judgment because the next result arrives before a reason for choice is formed."
          ]
        }
      },
      {
        heading: { ko: "멈춤의 기능", en: "The Function of Pause" },
        paragraphs: {
          ko: [
            "느림은 생산성의 반대가 아니다. 좋은 멈춤은 다음 행동의 정확도를 높이고, 불필요한 반복을 줄인다.",
            "도구가 진짜로 현대적이려면 속도만 제공해서는 부족하다. 사용자가 생각할 수 있는 간격을 함께 설계해야 한다."
          ],
          en: [
            "Slowness is not the opposite of productivity. A good pause increases the accuracy of the next action and reduces unnecessary repetition.",
            "For a tool to be truly contemporary, speed is not enough. It must also design intervals in which the user can think."
          ]
        }
      }
    ]
  },
  {
    slug: "ethics-of-default-settings",
    title: { ko: "기본값의 윤리", en: "The Ethics of Default Settings" },
    subtitle: {
      ko: "사용자가 선택하지 않은 선택도 디자인의 책임 안에 있다.",
      en: "Choices users did not make still belong to design responsibility."
    },
    deck: {
      ko: "기본값은 중립적이지 않다. 알림, 공개 범위, 추천 방식은 사용자의 시간을 어떤 방향으로 흐르게 할지 미리 정한다.",
      en: "Defaults are not neutral. Notifications, visibility, and recommendation modes pre-decide the direction of a user's time."
    },
    category: "philosophy",
    subcategoryKey: "ethics",
    subcategoryKeys: ["ethics", "thought", "body"],
    subcategory: { ko: "윤리", en: "Ethics" },
    date: "2026-03-04",
    issue: "Issue 01",
    readTime: { ko: "6분 읽기", en: "6 min read" },
    location: { ko: "온라인", en: "Online" },
    heroClass: "image-library",
    tags: { ko: ["윤리", "디자인", "기본값"], en: ["Ethics", "Design", "Defaults"] },
    excerpt: {
      ko: "기본값은 작은 설정처럼 보이지만 사용자의 행동을 가장 오래 바꾼다.",
      en: "Defaults look like small settings, yet they change behavior for the longest time."
    },
    quote: {
      ko: "사용자가 아무것도 하지 않았을 때 시스템이 무엇을 하는지가 디자인의 태도를 보여준다.",
      en: "What a system does when the user does nothing reveals the attitude of its design."
    },
    sections: [
      {
        heading: { ko: "중립처럼 보이는 선택", en: "A Choice That Looks Neutral" },
        paragraphs: {
          ko: [
            "대부분의 사용자는 모든 설정을 검토하지 않는다. 그래서 기본값은 사실상 가장 강력한 제안이 된다.",
            "알림이 켜져 있는지, 계정이 공개인지, 추천이 자동으로 시작되는지는 사용자의 생활 리듬과 정보 환경을 바꾼다."
          ],
          en: [
            "Most users do not review every setting. Defaults therefore become the strongest proposal a product makes.",
            "Whether notifications are on, accounts are public, or recommendations begin automatically changes the rhythm of life and the information environment."
          ]
        }
      },
      {
        heading: { ko: "책임의 위치", en: "Where Responsibility Sits" },
        paragraphs: {
          ko: [
            "디자인은 선택지를 제공하는 일만으로 끝나지 않는다. 어떤 선택지를 기본으로 둘지 정하는 순간 이미 판단은 시작된다.",
            "좋은 기본값은 기업의 지표보다 사용자의 회복 가능성을 먼저 생각한다. 사용자가 나중에 바꿀 수 있다는 말은 충분한 면책이 아니다."
          ],
          en: [
            "Design does not end with offering options. Judgment begins the moment one option is chosen as the default.",
            "A good default considers the user's capacity to recover before company metrics. Saying users can change it later is not enough."
          ]
        }
      }
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

export const site: SiteContent = {
  title: { ko: "The Thing", en: "The Thing" },
  description: {
    ko: "예술, 테크, 디자인, 철학을 하나의 감각적 편집면으로 엮는 디지털 저널",
    en: "A digital journal connecting art, tech, design, and philosophy through a quiet editorial lens."
  },
  issue: "Issue 01",
  month: { ko: "2026년 5월", en: "May 2026" },
  heroKicker: { ko: "Objects, Screens, Systems", en: "Objects, Screens, Systems" },
  heroTitle: {
    ko: "사물이 화면이 되고, 화면이 다시 사유가 되는 순간.",
    en: "When objects become screens, and screens return as thought."
  },
  heroLead: {
    ko: "조각가의 작업대에서 시작해 AI 인터페이스, 데이터 대시보드, 브랜드 시스템, 기본값의 윤리로 이동합니다. 서로 다른 주제를 하나의 느린 호흡으로 읽습니다.",
    en: "It begins at a sculptor's desk and moves through AI interfaces, data dashboards, brand systems, and the ethics of defaults. Different subjects are read in one slower rhythm."
  },
  keywords: {
    ko: ["표면", "간격", "반복", "그림자", "기본값", "느린 판단"],
    en: ["Surface", "Interval", "Repetition", "Shadow", "Defaults", "Slow Judgment"]
  },
  categories,
  notes
};
