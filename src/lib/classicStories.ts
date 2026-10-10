import { NewsItem, ArticleDetail, ArticleParagraph, KeyVocab } from "@/types/news";
import { estimateCEFR } from "@/lib/rss";
import { CURATED_VOCAB, cleanWord } from "@/lib/dictionary";

export interface ClassicStory {
  id: string;
  slug: string;
  title: string;
  author: string;
  year: string;
  coverImage: string;
  tagline: string;
  summary: string;
  paragraphs: string[];
}

export const CLASSIC_STORIES: ClassicStory[] = [
  {
    id: "gift-of-the-magi",
    slug: "gift-of-the-magi",
    title: "The Gift of the Magi",
    author: "O. Henry",
    year: "1905",
    coverImage: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200&auto=format&fit=crop&q=80",
    tagline: "Một trong những truyện ngắn cảm động và nổi tiếng nhất lịch sử văn học thế giới về tình yêu thương.",
    summary: "Della và Jim là một cặp vợ chồng trẻ nghèo khó. Vào đêm Giáng sinh, mỗi người đều bí mật bán đi báu vật quý giá nhất của đời mình để mua một món quà bất ngờ cho người kia.",
    paragraphs: [
      "One dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies. Pennies saved one and two at a time by bulldozing the grocer and the vegetable man and the butcher until one's cheeks burned with the silent imputation of parsimony that such close dealing implied. Three times Della counted it. One dollar and eighty-seven cents. And the next day would be Christmas.",
      "There was clearly nothing to do but flop down on the shabby little couch and howl. So Della did it. Which instigates the moral reflection that life is made up of sobs, sniffles, and smiles, with sniffles predominating.",
      "While the mistress of the home is gradually subsiding from the first stage to the second, take a look at the home. A furnished flat at $8 per week. It did not exactly beggar description, but it certainly had that word on the lookout for the mendicancy squad.",
      "In the vestibule below was a letter-box into which no letter would go, and an electric button from which no mortal finger could coax a ring. Also appertaining thereunto was a card bearing the name 'Mr. James Dillingham Young.'",
      "Now, there were two possessions of the James Dillingham Youngs in which they both took a mighty pride. One was Jim's gold watch that had been his father's and his grandfather's. The other was Della's hair. Had the queen of Sheba lived in the flat across the airshaft, Della would have let her hair hang out the window some day to dry just to depreciate Her Majesty's jewels and gifts.",
      "So now Della's beautiful hair fell about her rippling and shining like a cascade of brown waters. It reached below her knee and made itself almost a garment for her. And then she did it up again nervously and quickly. Once she faltered for a minute and stood still while a tear or two splashed on the worn red carpet.",
      "On went her old brown jacket; on went her old brown hat. With a whirl of skirts and with the brilliant sparkle still in her eyes, she fluttered out the door and down the stairs to the street.",
      "Where she stopped the sign read: 'Mme. Sofronie. Hair Goods of All Kinds.' One flight up Della ran, and collected herself, panting. 'Will you buy my hair?' asked Della. 'I buy hair,' said Madame. 'Take yer hat off and let's have a sight at the looks of it.'",
      "'Twenty dollars,' said Madame, lifting the mass with a practised hand. 'Give it to me quick,' said Della.",
      "Oh, and the next two hours tripped by on rosy wings. Forget the hashed metaphor. She was ransacking the stores for Jim's present. She found it at last. It surely had been made for Jim and no one else. There was no other like it in any of the stores. It was a platinum fob chain simple and chaste in design, properly proclaiming its value by substance alone and not by meretricious ornamentation.",
      "When Jim came in, he stopped inside the door, as immovable as a setter at the scent of quail. His eyes were fixed upon Della, and there was an expression in them that she could not read, and it terrified her. It was not anger, nor surprise, nor disapproval, nor horror, nor any of the sentiments that she had been prepared for. He simply stared at her fixedly with that peculiar expression on his face.",
      "'Jim, darling,' she cried, 'don't look at me that way. I had my hair cut off and sold because I couldn't have lived through Christmas without giving you a present. It'll grow out again—you won't mind, will you? Say 'Merry Christmas!' Jim, and let's be happy. You don't know what a nice— what a beautiful, nice gift I've got for you.'",
      "Jim drew a package from his overcoat pocket and threw it upon the table. For there lay The Combs—the set of combs, side and back, that Della had worshipped long in a Broadway window. Beautiful combs, pure tortoise shell, with jewelled rims—just the shade to wear in the beautiful vanished hair.",
      "And then Della leaped up like a little singed cat and cried, 'Oh, oh!' Jim had not yet seen his beautiful present. She held it out to him eagerly upon her open palm. The dull precious metal seemed to flash with a reflection of her bright and ardent spirit.",
      "'Isn't it a dandy, Jim? I hunted all over town to find it. You'll have to look at the time a hundred times a day now. Give me your watch. I want to see how it looks on it.'",
      "Instead of obeying, Jim tumbled down on the couch and put his hands under the back of his head and smiled. 'Della,' said he, 'let's put our Christmas presents away and keep 'em a while. They're too nice to use just at present. I sold the watch to get the money to buy your combs. And now suppose you put the chops on.'",
      "The magi, as you know, were wise men—wonderfully wise men—who brought gifts to the Babe in the manger. They invented the art of giving Christmas presents. Being wise, their gifts were no doubt wise ones. And here I have lamely related to you the uneventful chronicle of two foolish children in a flat who most unwisely sacrificed for each other the greatest treasures of their house. But in a last word to the wise of these days let it be said that of all who give gifts these two were the wisest."
    ]
  },
  {
    id: "the-last-leaf",
    slug: "the-last-leaf",
    title: "The Last Leaf",
    author: "O. Henry",
    year: "1907",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    tagline: "Kiệt tác nhân văn về tình người và niềm tin sống giữa ranh giới sinh tử.",
    summary: "Một cô gái trẻ bị viêm phổi nặng tin rằng khi chiếc lá thường xuân cuối cùng rụng xuống ngoài cửa sổ, cô cũng sẽ lìa đời. Người họa sĩ già cùng tòa nhà đã làm nên một điều kỳ diệu trong đêm bão tuyết.",
    paragraphs: [
      "In a little district west of Washington Square the streets have run crazy and broken themselves into small strips called 'places.' These 'places' make strange angles and curves. One street crosses itself a time or two. An artist once discovered a valuable possibility in this street. Suppose a collector with a bill for paints, paper and canvas should, in traversing this route, suddenly meet himself coming back, without a cent having been paid on account!",
      "So, to quaint old Greenwich Village the art people soon came prowling, hunting for north windows and eighteenth-century gables and Dutch attics and low rents. At the top of a squatty, three-story brick Sue and Johnsy had their studio. 'Johnsy' was familiar for Joanna. One was from Maine; the other from California. They had met at the table d'hôte of an Eighth Street 'Delmonico's,' and found their tastes in art, chicory salad and bishop sleeves so congenial that the joint studio resulted.",
      "That was in May. In November a cold, unseen stranger, whom the doctors called Pneumonia, stalked about the colony, touching one here and there with his icy fingers. Over on the east side this ravager strode boldly, smiting his victims by scores, but his feet trod slowly through the maze of the narrow and moss-grown 'places.'",
      "Mr. Pneumonia was not what you would call a chivalric old gentleman. A mite of a little woman with blood thinned by California zephyrs was hardly fair game for the red-fisted, short-breathed old duffer. But Johnsy he smote; and she lay, scarcely moving, on her painted iron bedstead, looking through the small Dutch window-panes at the blank side of the next brick house.",
      "One morning the busy doctor invited Sue into the hallway with a shaggy, gray eyebrow. 'She has one chance in—let us say, ten,' he said, as he shook down the mercury in his clinical thermometer. 'And that chance is for her to want to live. This way people have of lining-up on the side of the undertaker makes the entire pharmacopoeia look foolish. Your little lady has made up her mind that she's not going to get well.'",
      "Sue went into the workroom and cried a Japanese napkin to a pulp. Then she swaggered into Johnsy's room with her drawing board, whistling ragtime. Johnsy lay, scarcely making a ripple under the bedclothes, with her face toward the window. Sue stopped whistling, thinking she was asleep.",
      "She arranged her board and began a pen-and-ink drawing to illustrate a magazine story. Sue heard a low sound, several times repeated. She went quickly to the bedside. Johnsy's eyes were open wide. She was looking out the window and counting—counting backward.",
      "'Twelve,' she said, and a little later 'eleven'; and then 'ten,' and 'nine'; and then 'eight' and 'seven', almost together.",
      "Sue looked solicitously out of the window. What was there to count? There was only a bare, dreary yard to be seen, and the blank side of the brick house twenty feet away. An old, old ivy vine, gnarled and decayed at the roots, climbed half way up the brick wall. The cold breath of autumn had stricken its leaves from the vine until its skeleton branches clung, almost bare, to the crumbling bricks.",
      "'What is it, dear?' asked Sue. 'Six,' said Johnsy, in almost a whisper. 'They're falling faster now. Three days ago there were almost a hundred. It made my head ache to count them. But now it's easy. There goes another one. There are only five left now.'",
      "'Five what, dear? Tell your Sudie.' 'Leaves. On the ivy vine. When the last one falls I must go, too. I've known that for three days. Didn't the doctor tell you?'",
      "Old Behrman was a painter who lived on the ground floor beneath them. He was past sixty and had a Michael Angelo's Moses beard curling down from the head of a satyr along with the body of an imp. Behrman was a failure in art. Forty years he had wielded the brush without getting near enough to his Mistress to touch the hem of her garment. He had been always about to paint a masterpiece, but had never yet begun it.",
      "Sue told him of the vine, and how Johnsy believed she would float away like a leaf when the last one fell. Old Behrman cried out in furious contempt: 'Vhat!' he cried. 'Is dere people in de vorld mit der foolishness to die because leafs dey tumble off from a confounded vine? I haf not heard of such a ding.'",
      "The next morning, after a night of driving rain and fierce wind, Johnsy commanded that the green shade be raised. Lean and pale, Sue obeyed. But, lo! after the beating rain and fierce gusts of wind that had endured through the livelong night, there yet stood out against the brick wall one ivy leaf. It was the last one on the vine. Still dark green near its stem, but with its serrated edges tinted with the yellow of decay, it hung bravely from a branch some twenty feet above the ground.",
      "'It is the last one,' said Johnsy. 'I thought it would surely fall during the night. I heard the wind. It will fall to-day, and I shall die at the same time.'",
      "The day wore away, and even through the twilight they could see the lone ivy leaf clinging to its stem against the wall. And then, with the coming of the night the north wind was again loosed, while the rain still beat against the windows.",
      "When it was light enough Johnsy, the merciless, commanded that the shade be raised. The ivy leaf was still there. Johnsy lay for a long time looking at it. And then she called to Sue, who was stirring chicken broth over the gas stove.",
      "'I've been a bad girl, Sudie,' said Johnsy. 'Something has made that last leaf stay there to show me how wicked I was. It is a sin to want to die. You may bring me a little broth now, and some milk with a little port in it.'",
      "The next afternoon the doctor came. 'Even chances,' he said. 'With good nursing you'll win. And now I must see another case I have downstairs. Behrman, his name is—some kind of an artist, I believe. Pneumonia, too. He is an old, weak man, and the attack is acute. There is no hope for him; but he goes to the hospital to-day to be made more comfortable.'",
      "The next day Sue came to the bed where Johnsy lay, and put one arm around her, shoulders and all. 'I have something to tell you, white mouse,' she said. 'Mr. Behrman died of pneumonia to-day in the hospital. He was ill only two days.'",
      "'The janitor found him on the morning of the first day in his room downstairs helpless with pain. His shoes and his clothing were wet through and icy cold. They couldn't imagine where he had been on such a dreadful night. And then they found a lantern, still lighted, and a ladder that had been dragged from its place, and some scattered brushes, and a palette with green and yellow colors mixed on it.'",
      "'And look out the window, dear, at the last ivy leaf on the wall. Didn't you wonder why it never fluttered or moved when the wind blew? Ah, darling, it's Behrman's masterpiece—he painted it there the night that the last leaf fell.'"
    ]
  },
  {
    id: "a-scandal-in-bohemia",
    slug: "a-scandal-in-bohemia",
    title: "A Scandal in Bohemia",
    author: "Arthur Conan Doyle",
    year: "1891",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80",
    tagline: "Vụ án kinh điển mở đầu tuyển tập Sherlock Holmes và người phụ nữ duy nhất đánh bại ngài thám tử.",
    summary: "Nhà vua xứ Bohemia bí mật tìm đến phố Baker để nhờ thám tử Sherlock Holmes đoạt lại một bức ảnh thỏa hiệp từ Irene Adler—người phụ nữ mà sau này Holmes luôn tôn kính gọi là 'The Woman'.",
    paragraphs: [
      "To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.",
      "He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men's motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.",
      "I had seen little of Holmes lately. My marriage had drifted us away from each other. My own complete happiness, and the home-centred interests which rise up around the man who first finds himself master of his own establishment, were sufficient to absorb all my attention; while Holmes, who loathed every form of society with his whole Bohemian soul, remained in our lodgings in Baker Street, buried among his old books, and alternating from week to week between cocaine and ambition, the drowsiness of the drug, and the fierce energy of his own keen nature.",
      "One night—it was on the twentieth of March, 1888—I was returning from a journey to a patient, when my way led me through Baker Street. As I passed the well-remembered door, which must always be associated in my mind with my wooing, and with the dark incidents of the Study in Scarlet, I was seized with a keen desire to see Holmes again, and to know how he was employing his extraordinary powers.",
      "His rooms were brilliantly lit, and, even as I looked up, I saw his tall, spare figure pass twice in a dark silhouette against the blind. He was pacing the room swiftly, eagerly, with his head sunk upon his chest and his hands clasped behind him. To me, who knew his every mood and habit, his attitude and manner told their own story. He was at work again. He had risen out of his drug-created dreams and was hot upon the scent of some new problem. I rang the bell and was shown up to the chamber which had formerly been in part my own.",
      "His manner was not effusive. It seldom was; but he was glad, I think, to see me. With hardly a word spoken, but with a kindly eye, he waved me to an armchair, threw across his case of cigars, and indicated a spirit case and a gasogene in the corner. Then he stood before the fire and looked me over in his singular introspective fashion.",
      "'Wedlock suits you,' he remarked. 'I think, Watson, that you have put on seven and a half pounds since I saw you.' 'Seven!' I answered. 'Indeed, I should have thought a little more. Just a trifle more, I fancy, Watson. And in practice again, I observe. You did not tell me that you intended to go into harness.' 'Then, how do you know?' 'I see it, I deduce it. How do I know that you have been getting yourself very wet lately, and that you have a most clumsy and careless servant girl?'",
      "'My dear Holmes,' said I, 'this is too much. You would certainly have been burned, had you lived a few centuries ago. It is true that I had a country walk on Thursday and came home in a dreadful mess, but as I have changed my clothes I can't imagine how you deduce it. As to Mary Jane, she is incorrigible, and my wife has given her notice, but there, again, I fail to see how you work it out.'",
      "He chuckled to himself and rubbed his long, nervous hands together. 'It is simplicity itself,' said he; 'my eyes tell me that on the inside of your left shoe, just where the firelight strikes it, the leather is scored by six almost parallel cuts. Obviously they have been caused by someone who has very carelessly scraped round the edges of the sole in order to remove crusted mud from it. Hence, you see, my double deduction that you had been out in vile weather, and that you had a particularly malignant boot-slitting specimen of the London slavey. As to your practice, if a gentleman walks into my rooms smelling of iodoform, with a black mark of nitrate of silver upon his right forefinger, and a bulge on the right side of his top-hat to show where he has secreted his stethoscope, I must be dull, indeed, if I do not pronounce him to be an active member of the medical profession.'",
      "I could not help laughing at the ease with which he explained his process of deduction. 'When I hear you give your reasons,' I remarked, 'the thing always appears to me to be so ridiculously simple that I could easily do it myself, though at each successive instance of your reasoning I am baffled until you explain your process. And yet I believe that my eyes are as good as yours.'",
      "'Quite so,' he answered, lighting a cigarette, and throwing himself down into an armchair. 'You see, but you do not observe. The distinction is clear. For example, you have frequently seen the steps which lead up from the hall to this room.' 'Frequently.' 'How often?' 'Well, some hundreds of times.' 'Then how many are there?' 'How many? I don't know.' 'Quite so! You have not observed. And yet you have seen. That is just my point. Now, I know that there are seventeen steps, because I have both seen and observed.'"
    ]
  },
  {
    id: "the-tell-tale-heart",
    slug: "the-tell-tale-heart",
    title: "The Tell-Tale Heart",
    author: "Edgar Allan Poe",
    year: "1843",
    coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
    tagline: "Kiệt tác tâm lý kinh dị về tiếng đập dồn dập của lương tâm và tội lỗi.",
    summary: "Người dẫn chuyện khẳng định mình hoàn toàn tỉnh táo và minh mẫn, rồi kể lại chi tiết kế hoạch ám sát người đàn ông già có con mắt như mắt chim kền kền.",
    paragraphs: [
      "True!—nervous—very, very dreadfully nervous I had been and am; but why will you say that I am mad? The disease had sharpened my senses—not destroyed—not dulled them. Above all was the sense of hearing acute. I heard all things in the heaven and in the earth. I heard many things in hell. How, then, am I mad? Hearken! and observe how healthily—how calmly I can tell you the whole story.",
      "It is impossible to say how first the idea entered my brain; but once conceived, it haunted me day and night. Object there was none. Passion there was none. I loved the old man. He had never wronged me. He had never given me insult. For his gold I had no desire. I think it was his eye! yes, it was this! He had the eye of a vulture—a pale blue eye, with a film over it. Whenever it fell upon me, my blood ran cold; and so by degrees—very gradually—I made up my mind to take the life of the old man, and thus rid myself of the eye forever.",
      "Now this is the point. You fancy me mad. Madmen know nothing. But you should have seen me. You should have seen how wisely I proceeded—with what caution—with what foresight—with what dissimulation I went to work! I was never kinder to the old man than during the whole week before I killed him.",
      "And every night, about midnight, I turned the latch of his door and opened it—oh so gently! And then, when I had made an opening sufficient for my head, I put in a dark lantern, all closed, closed, that no light shone out, and then I thrust in my head. But you would have laughed to see how cunningly I thrust it in! I moved it slowly—very, very slowly, so that I might not disturb the old man's sleep. It took me an hour to place my whole head within the opening so far that I could see him as he lay upon his bed. Ha! would a madman have been so wise as this?",
      "And then, when my head was well in the room, I undid the lantern cautiously—oh, so cautiously—cautiously (for the hinges creaked)—I undid it just so much that a single thin ray fell upon the vulture eye. And this I did for seven long nights—every night just at midnight—but I found the eye always closed; and so it was impossible to do the work; for it was not the old man who vexed me, but his Evil Eye.",
      "Upon the eighth night I was more than usually cautious in opening the door. A watch's minute hand moves more quickly than did mine. Never before that night had I felt the extent of my own powers—of my sagacity. I could scarcely contain my feelings of triumph. To think that there I was, opening the door, little by little, and he not even to dream of my secret deeds or thoughts. I fairly chuckled at the idea; and perhaps he heard me; for he moved on the bed suddenly, as if startled.",
      "Now you may think that I drew back—but no. His room was as black as pitch with the thick darkness, and so I knew that he could not see the opening of the door, and I kept pushing it on steadily, steadily. I had my head in, and was about to open the lantern, when my thumb slipped upon the tin fastening, and the old man sprang up in bed, crying out—'Who's there?'",
      "I kept quite still and said nothing. For a whole hour I did not move a muscle, and in the meantime I did not hear him lie down. He was still sitting up in the bed listening;—just as I have done, night after night, hearkening to the death watches in the wall.",
      "Presently I heard a slight groan, and I knew it was the groan of mortal terror. It was not a groan of pain or of grief—oh, no!—it was the low stifled sound that arises from the bottom of the soul when overcharged with awe. I knew the sound well. Many a night, just at midnight, when all the world slept, it has welled up from my own bosom, deepening, with its dreadful echo, the terrors that distracted me.",
      "And now a new anxiety seized me—the sound would be heard by a neighbour! The old man's hour had come! With a loud yell, I threw open the lantern and leaped into the room. He shrieked once—once only. In an instant I dragged him to the floor, and pulled the heavy bed over him. I then smiled gaily, to find the deed so far done.",
      "When I had made an end of these labors, it was four o'clock—still dark as midnight. As the bell sounded the hour, there came a knocking at the street door. I went down to open it with a light heart,—for what had I now to fear? There entered three men, who introduced themselves, with great suavity, as officers of the police. A shriek had been heard by a neighbour during the night; suspicion of foul play had been aroused; information had been lodged at the police office, and they (the officers) had been deputed to search the premises.",
      "I smiled,—for what had I to fear? I bade the gentlemen welcome. The shriek, I said, was my own in a dream. The old man, I mentioned, was absent in the country. I took my visitors all over the house. I bade them search—search well. I led them, at length, to his chamber. I showed them his treasures, secure, undisturbed. In the enthusiasm of my confidence, I brought chairs into the room, and desired them here to rest from their fatigues, while I myself, in the wild audacity of my perfect triumph, placed my own seat upon the very spot beneath which reposed the corpse of the victim.",
      "The officers were satisfied. My manner had convinced them. I was singularly at ease. They sat, and while I answered cheerily, they chatted of familiar things. But, ere long, I felt myself getting pale and wished them gone. My head ached, and I fancied a ringing in my ears: but still they sat and still chatted. The ringing became more distinct:—It continued and became more distinct: I talked more freely to get rid of the feeling: but it continued and gained definiteness—until, at length, I found that the noise was not within my ears.",
      "No doubt I now grew very pale;—but I talked more fluently, and with a heightened voice. Yet the sound increased—and what could I do? It was a low, dull, quick sound—much such a sound as a watch makes when enveloped in cotton. I gasped for breath—and yet the officers heard it not. I talked more quickly—more vehemently; but the noise steadily increased. I arose and argued about trifles, in a high key and with violent gesticulations; but the noise steadily increased. Why would they not be gone? I paced the floor to and fro with heavy strides, as if excited to fury by the observations of the men—but the noise steadily increased. Oh God! what could I do? I foamed—I raved—I swore! I swung the chair upon which I had been sitting, and grated it upon the boards, but the noise arose over all and continually increased. It grew louder—louder—louder! And still the men chatted pleasantly, and smiled. Was it possible they heard not? Almighty God!—no, no! They heard!—they suspected!—they knew!—they were making a mockery of my horror!—this I thought, and this I think. But anything was better than this agony! Anything was more tolerable than this derision! I could bear those hypocritical smiles no longer! I felt that I must scream or die! and now—again!—hark! louder! louder! louder! louder!",
      "'Villains!' I shrieked, 'dissemble no more! I admit the deed!—tear up the planks! here, here!—it is the beating of his hideous heart!'"
    ]
  },
  {
    id: "the-story-of-an-hour",
    slug: "the-story-of-an-hour",
    title: "The Story of an Hour",
    author: "Kate Chopin",
    year: "1894",
    coverImage: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&auto=format&fit=crop&q=80",
    tagline: "Truyện ngắn kinh điển sắc bén về tự do, tâm lý phụ nữ và một kết cục chấn động.",
    summary: "Nhận tin người chồng qua đời trong tai nạn tàu hỏa, người vợ Louise Mallard trải qua một giờ cảm xúc mãnh liệt biến đổi từ đau buồn đến nhận thức choáng ngợp về sự tự do.",
    paragraphs: [
      "Knowing that Mrs. Mallard was afflicted with a heart trouble, great care was taken to break to her as gently as possible the news of her husband's death.",
      "It was her sister Josephine who told her, in broken sentences; veiled hints that revealed in half concealing. Her husband's friend Richards was there, too, near her. It was he who had been in the newspaper office when intelligence of the railroad disaster was received, with Brently Mallard's name leading the list of 'killed.' He had only taken the time to assure himself of its truth by a second telegram, and had hastened to forestall any less careful, less tender friend in bearing the sad message.",
      "She did not hear the story as many women have heard the same, with a paralyzed inability to accept its significance. She wept at once, with sudden, wild abandonment, in her sister's arms. When the storm of grief had spent itself she went away to her room alone. She would have no one follow her.",
      "There stood, facing the open window, a comfortable, roomy armchair. Into this she sank, pressed down by a physical exhaustion that haunted her body and seemed to reach into her soul.",
      "She could see in the open square before her house the tops of trees that were all aquiver with the new spring life. The delicious breath of rain was in the air. In the street below a peddler was crying his wares. The notes of a distant song which some one was singing reached her faintly, and countless sparrows were twittering in the eaves.",
      "She sat with her head thrown back upon the cushion of the chair, quite motionless, except when a sob came up into her throat and shook her, as a child who has cried itself to sleep continues to sob in its dreams.",
      "There was something coming to her and she was waiting for it, fearfully. What was it? She did not know; it was too subtle and elusive to name. But she felt it, creeping out of the sky, reaching toward her through the sounds, the scents, the color that filled the air.",
      "Now her bosom rose and fell tumultuously. She was beginning to recognize this thing which was approaching to possess her, and she was striving to beat it back with her will—as powerless as her two white slender hands would have been. When she abandoned herself a little whispered word escaped her slightly parted lips. She said it over and over under the breath: 'free, free, free!' The vacant stare and the look of terror that had followed it went from her eyes. They stayed keen and bright. Her pulses beat fast, and the coursing blood warmed and relaxed every inch of her body.",
      "She did not stop to ask if it were or were not a monstrous joy that held her. A clear and exalted perception enabled her to dismiss the suggestion as trivial. She knew that she would weep again when she saw the kind, tender hands folded in death; the face that had never looked save with love upon her, fixed and gray and dead. But she saw beyond that bitter moment a long procession of years to come that would belong to her absolutely. And she opened and spread her arms out to them in welcome.",
      "There would be no one to live for during those coming years; she would live for herself. There would be no powerful will bending hers in that blind persistence with which men and women believe they have a right to impose a private will upon a fellow-creature. A kind intention or a cruel intention made the act seem no less a crime as she looked upon it in that brief moment of illumination.",
      "And yet she had loved him—sometimes. Often she had not. What did it matter! What did love, the unsolved mystery, count for in the face of this possession of self-assertion which she suddenly recognized as the strongest impulse of her being!",
      "'Free! Body and soul free!' she kept whispering.",
      "Josephine was kneeling before the closed door with her lips to the keyhole, imploring for admission. 'Louise, open the door! I beg; open the door—you will make yourself ill. What are you doing, Louise? For heaven's sake open the door.'",
      "'Go away. I am not making myself ill.' No; she was drinking in a very elixir of life through that open window.",
      "She breathed a quick prayer that life might be long. It was only yesterday she had thought with a shudder that life might be long.",
      "She arose at length and opened the door to her sister's importunities. There was a feverish triumph in her eyes, and she carried herself unwittingly like a goddess of Victory. She clasped her sister's waist, and together they descended the stairs. Richards stood waiting for them at the bottom.",
      "Some one was opening the front door with a latchkey. It was Brently Mallard who entered, a little travel-stained, composedly carrying his grip-sack and umbrella. He had been far from the scene of the accident, and did not even know there had been one. He stood amazed at Josephine's piercing cry; at Richards' quick motion to screen him from the view of his wife.",
      "When the doctors came they said she had died of heart disease—of the joy that kills."
    ]
  }
];

export function getClassicStoryNewsItems(): NewsItem[] {
  return CLASSIC_STORIES.map((story) => {
    const fullText = story.paragraphs.join(" ");
    const metrics = estimateCEFR(story.title + " " + fullText);

    return {
      id: `gutenberg-${story.slug}`,
      title: `${story.title} — ${story.author} (${story.year})`,
      link: `https://www.gutenberg.org/ebooks/${story.slug}`,
      guid: `gutenberg-${story.slug}`,
      pubDate: `${story.year}-01-01T00:00:00Z`,
      description: story.summary,
      rawDescription: story.summary,
      thumbnail: story.coverImage,
      category: "Classic Literature",
      channelId: "gutenberg-all",
      sourceId: "gutenberg",
      sourceName: "Truyện Ngắn Kinh Điển",
      readingTimeMinutes: metrics.readingTimeMinutes,
      wordCount: metrics.wordCount,
      cefrLevel: metrics.cefrLevel,
      difficultyScore: metrics.difficultyScore
    };
  });
}

export function getClassicStoryDetail(slugOrId: string): ArticleDetail | null {
  const cleanId = slugOrId.replace(/^gutenberg-/, "").replace(/^gutenberg\//, "");
  const story = CLASSIC_STORIES.find((s) => s.slug === cleanId || s.id === cleanId) || CLASSIC_STORIES[0];

  if (!story) return null;

  const paragraphs: ArticleParagraph[] = story.paragraphs.map((p, i) => ({
    id: `p-${i}`,
    text: p
  }));

  const fullText = story.paragraphs.join(" ");
  const { wordCount, cefrLevel } = estimateCEFR(fullText);

  const extractedWords = new Set<string>();
  const keyVocabulary: KeyVocab[] = [];
  const tokens = fullText.split(/[\s,.;:!?()"“”']+/).map(cleanWord);

  for (const token of tokens) {
    if (token && CURATED_VOCAB[token] && !extractedWords.has(token)) {
      extractedWords.add(token);
      const item = CURATED_VOCAB[token];
      keyVocabulary.push({
        word: token,
        ipa: item.ipa,
        partOfSpeech: item.pos,
        vietnamese: item.vi,
        englishDefinition: item.en,
        exampleSentence: item.example,
        cefr: item.cefr
      });
    }
  }

  return {
    id: `gutenberg-${story.slug}`,
    title: `${story.title} — ${story.author}`,
    link: `https://www.gutenberg.org/ebooks/${story.slug}`,
    pubDate: `${story.year}-01-01`,
    category: "Classic Literature (Public Domain)",
    lead: story.summary,
    thumbnail: story.coverImage,
    caption: `Tác phẩm của ${story.author} (${story.year}) • Thuộc Miền công cộng (Public Domain)`,
    author: story.author,
    paragraphs,
    wordCount,
    cefrLevel,
    keyVocabulary: keyVocabulary.slice(0, 10)
  };
}
