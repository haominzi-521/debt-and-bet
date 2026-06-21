/**
 * 第一章剧本
 */
const CHAPTER_1 = {
  start: 'bedroom_start',

  nodes: {

    // ==========================================
    // 卧室开场
    // ==========================================
    bedroom_start: [
      { type: 'scene', bg: '卧室', transition: 'fade' },
      { type: 'wait', ms: 300 },
      { type: 'sprite', char: 'heroine', pose: 'home', side: 'left' },
      { type: 'wait', ms: 200 },
      { type: 'narration', text: '新的一天。手机屏幕亮起，又是一条催债短信。' },
      { type: 'narration', text: '"最后期限：三天。"' },
      { type: 'narration', text: '我盯着天花板看了很久。一千万的债务，像一张无形的网，把我越缠越紧。' },
      { type: 'narration', text: '今天，我必须做点什么。' },
      { type: 'showLocations' },
    ],

    // ==========================================
    // 去上学 → 穿校服
    // ==========================================
    day1_school: [
      { type: 'scene', bg: '学校', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'uniform', side: 'left' },
      { type: 'attr', changes: { actionPoints: -1 } },
      { type: 'narration', text: '教室里的空气一如既往地沉闷。我翻开笔记本，假装在记什么。' },
      { type: 'narration', text: '讲台上的老师正在讲着什么，但我的思绪根本不在课堂上。' },
      { type: 'choice', options: [
        { text: '认真听课', next: 'school_study', attr: { study: 1, mood: -1 } },
        { text: '望着窗外发呆', next: 'school_zoneout', attr: { mood: 1 } },
      ]},
    ],

    school_study: [
      { type: 'narration', text: '我深吸一口气，努力把注意力集中在黑板上。至少现在，还有学业可以抓住。' },
      { type: 'narration', text: '放学铃响了。该去打工了。' },
      { type: 'jump', target: 'day2_bar_intro' },
    ],

    school_zoneout: [
      { type: 'narration', text: '窗外的树叶被风吹动，沙沙作响。我突然有些羡慕它们——至少不用为一千万发愁。' },
      { type: 'narration', text: '好不容易熬到放学。该去打工了。' },
      { type: 'jump', target: 'day2_bar_intro' },
    ],

    // ==========================================
    // 酒吧打工
    // ==========================================
    day2_bar_intro: [
      { type: 'scene', bg: '打工酒吧', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'maid', side: 'left' },
      { type: 'attr', changes: { actionPoints: -1 } },
      { type: 'narration', text: '今晚的酒吧格外嘈杂。我端着托盘在人群中穿梭，尽量让自己看起来不那么疲惫。' },
      { type: 'narration', text: '就在这时，隔壁桌几个客人的聊天飘进了我的耳朵。' },
      { type: 'dialogue', speaker: null, text: '"听说了吗？对面赌场昨晚有人赢了一千多万..."' },
      { type: 'dialogue', speaker: null, text: '"真的假的？！"' },
      { type: 'dialogue', speaker: null, text: '"千真万确！我一个朋友亲眼看到的。那家伙一晚上就翻了身。"' },
      { type: 'narration', text: '我的手微微一颤。一千多万...' },
      { type: 'narration', text: '"喂！服务员！酒呢？！"一个粗暴的声音打断了我的思绪。' },
      { type: 'narration', text: '慌乱中，我撞上了身后的人。酒杯倾斜，酒水溅在了对方的西装上。' },
      { type: 'narration', text: '我慌忙抬头，对上了一双深邃的眼睛。' },
      { type: 'sprite', char: 'a', pose: 'adjust', side: 'right' },
      { type: 'dialogue', speaker: 'a', text: '小心。' },
      { type: 'narration', text: '他的声音很平静，轻轻扶住了我的手臂。' },
      { type: 'dialogue', speaker: null, text: '"对、对不起！你的衣服...我赔您..."' },
      { type: 'dialogue', speaker: 'a', text: '不必。只是一件衣服而已。' },
      { type: 'dialogue', speaker: 'a', text: '你看起来很感兴趣？' },
      { type: 'narration', text: '我愣住了。他指的是刚才那些客人聊的赌场话题？' },
      { type: 'dialogue', speaker: 'a', text: '如果我说，有一个方法可以让你赚到钱——你信吗？' },
      { type: 'dialogue', speaker: 'a', text: '街对面的赌场。来找我。' },
      { type: 'narration', text: '他说完，递给我一张黑色名片。上面只有一个烫金字母：A。' },
      { type: 'narration', text: '他转身离去，留下我一个人站在嘈杂的酒吧里，手中握着那张名片。' },
      { type: 'hideSprite', char: 'a' },
      { type: 'scene', bg: '卧室', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'home', side: 'left' },
      { type: 'narration', text: '回到家，我盯着那张名片看了很久。A先生...赌场...' },
      { type: 'narration', text: '我知道这很疯狂。但我已经没有退路了。' },
      { type: 'unlock', location: 'casino' },
      { type: 'unlock', location: 'park' },
      { type: 'showLocations' },
    ],

    // ==========================================
    // 第一次去赌场
    // ==========================================
    casino_first: [
      { type: 'scene', bg: '赌场', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'home', side: 'left' },
      { type: 'attr', changes: { actionPoints: -1 } },
      { type: 'narration', text: '赌场的灯光比我预想的还要炫目。水晶吊灯、金色装潢...这里像另一个世界。' },
      { type: 'narration', text: '我站在门口，有些不知所措。这时，一个穿着服务生打扮的年轻人走了过来。' },
      { type: 'sprite', char: 'waiter', pose: 'default', side: 'right' },
      { type: 'dialogue', speaker: 'waiter', text: '晚上好，女士。请问您是来找人的吗？' },
      { type: 'narration', text: '他的头上戴着一对兔耳发饰，看起来有些滑稽，但表情却异常认真。' },
      { type: 'dialogue', speaker: null, text: '"我...我找A先生。"' },
      { type: 'dialogue', speaker: 'waiter', text: 'A先生...（他微微一笑）请跟我来。' },
      { type: 'narration', text: '他做了一个"请"的手势，带领我穿过大厅，走向一条隐蔽的走廊。' },
      { type: 'dialogue', speaker: 'waiter', text: 'A先生很少主动邀请客人。您一定很特别。' },
      { type: 'narration', text: '走廊尽头是一扇厚重的红木门。' },
      { type: 'dialogue', speaker: 'waiter', text: '到了。A先生在里面等您。祝您好运。' },
      { type: 'hideSprite', char: 'waiter' },
      { type: 'scene', bg: '包厢', transition: 'fade' },
      { type: 'narration', text: '兔耳服务生轻轻推开了门，退到一旁。' },
      { type: 'sprite', char: 'a', pose: 'adjust', side: 'right' },
      { type: 'dialogue', speaker: 'a', text: '你来了。比我预想的快。坐吧。' },
      { type: 'narration', text: '我在他对面坐下。空气中弥漫着一种说不清道不明的紧张感。' },
      { type: 'dialogue', speaker: 'a', text: '我知道你为什么来。也知道你背负着什么。' },
      { type: 'dialogue', speaker: 'a', text: '所以，长话短说——我提出一个赌局。' },
      { type: 'dialogue', speaker: 'a', text: '你赢——我借你三十万作为赌本。另外，你在赌场的盈利，我们平分。' },
      { type: 'dialogue', speaker: 'a', text: '你输——永远离开这张赌桌。' },
      { type: 'narration', text: '我的心脏在剧烈跳动。三十万赌本...如果赢了，或许真的能翻身。' },
      { type: 'choice', options: [
        { text: '接受赌局', next: 'accept_bet' },
        { text: '再考虑一下', next: 'reconsider' },
      ]},
    ],

    // ==========================================
    // 再考虑 → 离开
    // ==========================================
    reconsider: [
      { type: 'narration', text: '我张了张嘴，却发现自己说不出"接受"两个字。' },
      { type: 'dialogue', speaker: 'a', text: '...你在犹豫。' },
      { type: 'dialogue', speaker: 'a', text: '没关系。这不是一个容易的决定。你可以回去考虑。' },
      { type: 'narration', text: '我站起身，走出了包厢。' },
      { type: 'hideSprite', char: 'a' },
      { type: 'scene', bg: '卧室', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'home', side: 'left' },
      { type: 'attr', changes: { rejectCount: 1 } },
      { type: 'narration', text: '回到房间，那张黑色名片还放在桌上。我盯着它看了很久。' },
      { type: 'narration', text: '我还有什么可失去的呢？' },
      { type: 'showLocations' },
    ],

    // ==========================================
    // 再次去赌场（考虑后）
    // ==========================================
    casino_revisit: [
      { type: 'scene', bg: '包厢', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'home', side: 'left' },
      { type: 'attr', changes: { actionPoints: -1 } },
      { type: 'narration', text: '我怀着忐忑不安的心情，再次踏进了赌场。' },
      { type: 'sprite', char: 'waiter', pose: 'default', side: 'right' },
      { type: 'dialogue', speaker: 'waiter', text: '（微笑）您还是要找A先生吗？' },
      { type: 'narration', text: '我惊讶地看着他，然后点了点头。' },
      { type: 'dialogue', speaker: 'waiter', text: '好的，请跟我来。' },
      { type: 'narration', text: '他转身带路，步伐轻快。' },
      { type: 'hideSprite', char: 'waiter' },
      { type: 'sprite', char: 'a', pose: 'adjust', side: 'right' },
      { type: 'dialogue', speaker: 'a', text: '你回来了。' },
      { type: 'dialogue', speaker: 'a', text: '那么——你的答案是？' },
      { type: 'choice', options: [
        { text: '接受赌局', next: 'accept_bet' },
        { text: '再考虑一下', next: 'reconsider' },
      ]},
    ],

    // ==========================================
    // 接受赌局 → 规则说明 + 教学局
    // ==========================================
    accept_bet: [
      { type: 'dialogue', speaker: null, text: '"...我接受。"' },
      { type: 'dialogue', speaker: 'a', text: '很好。' },
      { type: 'dialogue', speaker: 'a', text: '但在正式赌局之前，我想你最好先了解一下规则。' },
      { type: 'dialogue', speaker: 'a', text: '这个游戏，叫做——"虚实"。' },
      { type: 'narration', text: '他从牌桌上拿起一副牌，熟练地洗了洗。' },
      { type: 'dialogue', speaker: 'a', text: '牌组共20张——A、K、Q各6张，外加2张王牌。每人发5张。' },
      { type: 'dialogue', speaker: 'a', text: '每轮随机指定一种为核心牌。轮到你时，出1到3张牌，声明它们全是核心牌。' },
      { type: 'dialogue', speaker: 'a', text: '你可以说真话，也可以撒谎。对方不信就喊"质疑"——翻牌验证。' },
      { type: 'dialogue', speaker: 'a', text: '撒谎被揭穿 → 你输这回合。没撒谎 → 质疑者输这回合。' },
      { type: 'dialogue', speaker: 'a', text: '大小丑是万能牌，可当任何牌用。小小丑单独出时——质疑者必输。' },
      { type: 'dialogue', speaker: 'a', text: '还有——对方手牌出完时，你必须质疑他最后一手牌，不能跳过。' },
      { type: 'dialogue', speaker: 'a', text: '最后赢得回合多的人获胜。来，试一局。' },
      { type: 'jump', target: 'tutorial_game' },
    ],

    // ==========================================
    // 虚实牌局教学
    // ==========================================
    tutorial_game: [
      { type: 'minigame', mode: 'tutorial', rounds: 3, nextWin: 'tutorial_win', nextLose: 'tutorial_lose' },
    ],

    tutorial_win: [
      { type: 'sprite', char: 'heroine', pose: 'home', side: 'left' },
      { type: 'dialogue', speaker: 'a', text: '不错。你比我想象的有天赋。' },
      { type: 'dialogue', speaker: 'a', text: '或许...你真的有资格坐在这张桌子上。' },
      { type: 'sprite', char: 'a', pose: 'adjust', side: 'right' },
      { type: 'narration', text: '他从抽屉里取出一份文件，推到我面前。' },
      { type: 'dialogue', speaker: 'a', text: '签了它。三十万赌本会在明天之前到你的账户。' },
      { type: 'dialogue', speaker: 'a', text: '但你欠的不是我——是赌场。你需要在赌桌上赚回来。' },
      { type: 'dialogue', speaker: 'a', text: '当然，每一分盈利，我们五五分成。' },
      { type: 'narration', text: '我拿起笔，看着面前的合约。手有些发抖。' },
      { type: 'narration', text: '但最终，我签下了自己的名字。' },
      { type: 'dialogue', speaker: 'a', text: '很好。从现在开始，你就是这家赌场的"玩家"了。' },
      { type: 'dialogue', speaker: 'a', text: '祝你好运。' },
      { type: 'attr', changes: { fund: 30 } },
      { type: 'unlock', location: 'casinoHall' },
      { type: 'narration', text: '<big>获得三十万赌本。欠债还剩一千万...</big>' },
      { type: 'narration', text: '我回到家中，躺在床上，盯着手里那份签好的合约。' },
      { type: 'narration', text: '一切，才刚刚开始。' },
      { type: 'ending', id: 'ch1_complete' },
    ],

    tutorial_lose: [
      { type: 'narration', text: '我输了。输掉的回合比赢的多。' },
      { type: 'sprite', char: 'a', pose: 'adjust', side: 'right' },
      { type: 'dialogue', speaker: 'a', text: '...可惜。看来，专业的事还是要交给专业的人来做。' },
      { type: 'narration', text: '他站起身，收起了桌上的牌。' },
      { type: 'dialogue', speaker: 'a', text: '你是个聪明的女孩，但不适合这个游戏。回去吧。' },
      { type: 'narration', text: '我低着头，没有说话。' },
      { type: 'ending', id: 'ending1' },
    ],

    // ==========================================
    // 去公园
    // ==========================================
    // 第二章上学
    school_work: [
      { type: 'scene', bg: '学校', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'uniform', side: 'left' },
      { type: 'attr', changes: { actionPoints: -1, study: 1, mood: -1 } },
      { type: 'narration', text: '上了一天的课。虽然累，但知识总归是有用的。' },
      { type: 'showLocations' },
    ],

    // 第一章后酒吧打工（只赚钱）
    bar_work: [
      { type: 'scene', bg: '酒吧', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'maid', side: 'left' },
      { type: 'attr', changes: { actionPoints: -1, fund: 5, mood: -1 } },
      { type: 'narration', text: '今晚的酒吧一如既往地忙碌。我端了一晚上的盘子，赚了500块。' },
      { type: 'narration', text: '虽然累，但每一分钱都让我离还清债务更近一步。' },
      { type: 'showLocations' },
    ],

    park: [
      { type: 'scene', bg: '公园', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'home', side: 'left' },
      { type: 'attr', changes: { actionPoints: -1, mood: 2, health: 1 } },
      { type: 'narration', text: '公园里人不多。几个老人在下棋，一对情侣在长椅上依偎。' },
      { type: 'narration', text: '我找了一张空的长椅坐下，闭上眼睛。' },
      { type: 'narration', text: '就让我暂时忘掉一切吧。哪怕只有十分钟。' },
      { type: 'narration', text: '心情好了不少。该回去了。' },
      { type: 'showLocations' },
    ],

    // ==========================================
    // 自由探索：房间（第一章结束后）
    // ==========================================
    free_room: [
      { type: 'scene', bg: '卧室', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'home', side: 'left' },
      { type: 'narration', text: '我回到了自己的房间。手里有了三十万赌本，但一千万的欠债还在那里。' },
      { type: 'narration', text: '从现在开始，我可以自由行动了。白天去上学打工，晚上去赌场试试手气。' },
      { type: 'showLocations' },
    ],

    // ==========================================
    // 赌场大厅（第一章结束后）
    // ==========================================
    casino_hall: [
      { type: 'scene', bg: '赌场', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'home', side: 'left' },
      { type: 'sprite', char: 'waiter', pose: 'default', side: 'right' },
      { type: 'dialogue', speaker: 'waiter', text: '晚上好。啊，A先生交代过了——这是为您准备的。' },
      { type: 'narration', text: '兔子服务生递过来一套精致的赌场着装。' },
      { type: 'dialogue', speaker: 'waiter', text: 'A先生说，既然您是我们的"玩家"了，就该有玩家的样子。' },
      { type: 'sprite', char: 'heroine', pose: 'casino', side: 'left' },
      { type: 'narration', text: '我换上了这套衣服。在镜子里看了看——确实和这里的气氛更配了。' },
      { type: 'dialogue', speaker: 'waiter', text: '很适合您。那么，请问您今天是——？' },
      { type: 'choice', options: [
        { text: '找人打牌', next: 'find_player' },
        { text: '找A先生', next: 'find_a' },
      ]},
    ],

    casino_hall_return: [
      { type: 'scene', bg: '赌场', transition: 'fade' },
      { type: 'sprite', char: 'heroine', pose: 'casino', side: 'left' },
      { type: 'sprite', char: 'waiter', pose: 'default', side: 'right' },
      { type: 'dialogue', speaker: 'waiter', text: '晚上好。请问您今天是——？' },
      { type: 'choice', options: [
        { text: '找人打牌', next: 'find_player' },
        { text: '找A先生', next: 'find_a' },
      ]},
    ],

    find_player: [
      { type: 'attr', changes: { actionPoints: -1 } },
      { type: 'hideSprite', char: 'waiter' },
      { type: 'narration', text: '大厅里几个常客正在牌桌旁闲聊。你找了一个看起来有兴趣的对手。' },
      { type: 'minigame', mode: 'normal', opponent: null, nextWin: 'player_win_return', nextLose: 'player_lose_return' },
    ],

    player_win_return: [
      { type: 'attr', changes: { fund: 10, debt: -10 } },
      { type: 'jump', target: 'casino_hall_return' },
    ],

    player_lose_return: [
      { type: 'attr', changes: { fund: -10, mood: -1 } },
      { type: 'jump', target: 'casino_hall_return' },
    ],

    find_a: [
      { type: 'attr', changes: { actionPoints: -1 } },
      { type: 'dialogue', speaker: 'waiter', text: '抱歉...A先生今天不在。' },
      { type: 'dialogue', speaker: 'waiter', text: '他说过，该出现的时候自然会来。' },
      { type: 'narration', text: '我有些失望。' },
      { type: 'jump', target: 'casino_hall_return' },
    ],

  }, // end nodes

  /**
   * 地点 → 节点路由
   */
  route(location) {
    const map = {
      'school': 'day1_school',
      'bar': 'day2_bar_intro',
      'casino': 'casino_first',
      'park': 'park',
      'casinoHall': 'casino_hall',
    };
    return map[location] || null;
  },
};
