import { NewsItem, ArticleDetail, ArticleParagraph, KeyVocab } from "@/types/news";
import { estimateCEFR } from "@/lib/rss";
import { CURATED_VOCAB, cleanWord } from "@/lib/dictionary";
import { XMLParser } from "fast-xml-parser";

export interface KidsStory {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  channelId: "kids-gaming" | "kids-science" | "kids-fables" | "kids-news";
  cefrLevel: "A1" | "A2" | "B1";
  moral?: string;
  summary: string;
  coverImage: string;
  paragraphs: string[];
}

export const KIDS_STORIES: KidsStory[] = [
  // --- 0. GAME & THẾ GIỚI TRÒ CHƠI (GAMING, MINECRAFT, ROBLOX, LEGO, POKEMON) ---
  {
    id: "kids-minecraft-blocks",
    slug: "minecraft-how-3d-blocks-conquered-the-world",
    title: "Minecraft: How 3D Blocks Built the World's Biggest Game (Thế Giới Khối Vuông Minecraft)",
    author: "Gaming & Tech for Kids",
    category: "🎮 Game & Trò Chơi",
    channelId: "kids-gaming",
    cefrLevel: "A2",
    summary: "Từ những khối gỗ và đá đơn giản, Minecraft đã trở thành trò chơi sáng tạo được yêu thích nhất thế giới. Cùng khám phá bí mật xây dựng và sinh tồn trong game!",
    coverImage: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "Imagine a giant digital sandbox made entirely of three-dimensional cubes. You can break every block, chop down tall trees, mine deep underground for diamonds, and build anything you can imagine! That is the magical world of Minecraft.",
      "The game was created in 2009 by a Swedish programmer named Markus Persson, famously known as 'Notch'. At first, it was just a small project, but players around the globe fell in love with its total freedom.",
      "In Minecraft, there are two main ways to play. In Survival Mode, you must gather resources, craft wooden tools, cook food, and build a safe shelter before night falls—because that is when green Creepers and spooky skeletons appear!",
      "In Creative Mode, you have unlimited blocks and the superpower of flight. Players have built life-sized castles, working roller coasters, and even replicas of Hogwarts and the Eiffel Tower.",
      "Minecraft even features a special red powder called Redstone. Redstone acts like real electrical wire, allowing clever players to build working computers, automatic doors, and musical pianos inside the game!",
      "Today, millions of students also use Minecraft: Education Edition at school to learn math, history, and computer programming while having fun."
    ]
  },
  {
    id: "kids-roblox-universe",
    slug: "roblox-the-universe-where-kids-build-games",
    title: "Roblox: The Universe Where Kids Become Game Creators (Thế Giới Roblox Kỳ Thú)",
    author: "Gaming & Tech for Kids",
    category: "🎮 Game & Trò Chơi",
    channelId: "kids-gaming",
    cefrLevel: "A2",
    summary: "Roblox không chỉ là một trò chơi, mà là một vũ trụ ảo khổng lồ nơi hàng triệu bạn nhỏ trên toàn cầu tự thiết kế nhân vật và lập trình tựa game của riêng mình.",
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "What if you did not just play video games, but actually made them yourself? That is the revolutionary idea behind Roblox, one of the most popular gaming platforms on the planet.",
      "Roblox is not a single game. Instead, it is an endless universe filled with millions of user-created 3D experiences. You can bake pizzas in a busy restaurant, adopt cute pets, survive giant natural disasters, or race through thrilling obstacle courses called 'Obbies'.",
      "Every player has their own customizable digital avatar. You can dress your avatar in cool hoodies, stylish sunglasses, wings, or goofy hats using virtual coins called Robux.",
      "The coolest part of Roblox is a free computer software called Roblox Studio. Using a beginner-friendly coding language called Lua, teenagers and kids can code rules, design 3D maps, and publish their own games for friends to play.",
      "Some talented young creators have even built games played by billions of people and started their own game studios before graduating from high school!"
    ]
  },
  {
    id: "kids-pokemon-craze",
    slug: "pokemon-catching-monsters-around-the-globe",
    title: "The Secret Origin of Pokémon: Catching Pocket Monsters (Bí Mật Thế Giới Pokémon)",
    author: "Gaming & Pop Culture",
    category: "🎮 Game & Trò Chơi",
    channelId: "kids-gaming",
    cefrLevel: "A2",
    summary: "Từ sở thích bắt bọ cánh cứng thời thơ ấu của một cậu bé Nhật Bản, Pokémon đã vươn lên trở thành biểu tượng văn hóa giải trí lớn nhất mọi thời đại.",
    coverImage: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "Pikachu, Charizard, and Eevee are names known by almost every kid in the world. But do you know how Pokémon was originally born?",
      "When creator Satoshi Tajiri was a young boy growing up in rural Japan, his favorite hobby was exploring ponds and forests to catch beetles and insects. His childhood friends even called him 'Dr. Bug'!",
      "As he grew up and cities replaced green fields, Satoshi wanted to give modern children the same joyful thrill of exploring nature and collecting creatures. He invented the concept of 'Pocket Monsters'—small magical creatures you could catch, train, and trade with friends.",
      "When Pokémon Red and Blue were released on the Nintendo Game Boy in 1996, players loved the slogan: 'Gotta Catch 'Em All!' Soon, Pokémon expanded into hit anime series, trading card games, and mobile apps like Pokémon GO.",
      "Today, there are over one thousand different Pokémon species, each with unique elements like Fire, Water, and Lightning. Pokémon teaches players about friendship, strategy, and never giving up during a tough battle."
    ]
  },
  {
    id: "kids-lego-master-builders",
    slug: "lego-how-master-builders-design-epic-spaceships",
    title: "Lego Secrets: How Master Builders Design Epic Spaceships (Bí Quyết Của Bậc Thầy Lego)",
    author: "Creative Play & Engineering",
    category: "🎮 Game & Trò Chơi",
    channelId: "kids-gaming",
    cefrLevel: "A2",
    summary: "Những viên gạch nhựa nhiều màu sắc từ Đan Mạch đã khơi dậy trí tưởng tượng của hàng trăm triệu trẻ em. Khám phá bí quyết để xây dựng nên những công trình Lego kỳ vĩ!",
    coverImage: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "Did you know that six eight-stud Lego bricks can be combined in over 915 million different ways? That incredible math is why Lego is called the toy of infinite possibilities.",
      "Lego was invented in the 1930s by a Danish carpenter named Ole Kirk Christiansen. The name 'Lego' comes from the Danish phrase 'leg godt', which means 'play well'.",
      "What makes Lego so special is the clever clutch power of its interlocking tubes. A brick manufactured fifty years ago can still click perfectly onto a brick made today!",
      "Professional Lego designers, known as Master Model Builders, spend their days constructing gigantic dinosaurs, Star Wars starfighters, and real-sized cars using millions of bricks.",
      "Their number one secret is called 'interlocking'—never stacking bricks in single vertical columns. Instead, you overlap the seams like real bricklayers, creating strong walls that will not break easily.",
      "Playing with Lego helps you think like an architect and engineer. When you build with bricks, you are turning ideas in your mind into physical reality!"
    ]
  },
  {
    id: "kids-super-mario-history",
    slug: "super-mario-the-hero-who-changed-gaming",
    title: "Super Mario: The Plumber Who Changed Gaming Forever (Super Mario – Huyền Thoại Game)",
    author: "Gaming Legends",
    category: "🎮 Game & Trò Chơi",
    channelId: "kids-gaming",
    cefrLevel: "A1",
    summary: "Với chiếc mũ đỏ, bộ quần áo yếm xanh và bộ ria mép vui nhộn, Super Mario đã trở thành nhân vật trò chơi điện tử nổi tiếng nhất trong lịch sử loài người.",
    coverImage: "https://images.unsplash.com/photo-1612404730960-5c71577fca11?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "Run, jump, slide down green pipes, and stomp on mushrooms! For over forty years, a cheerful Italian plumber named Super Mario has brought smiles to players worldwide.",
      "Mario was designed in 1981 by Japanese artist Shigeru Miyamoto at Nintendo. Because early computer screens had very few pixels, Miyamoto gave Mario a bright red cap so his hair would not need animation, and a mustache so his nose and mouth were easy to see!",
      "In the Mushroom Kingdom, Mario embarks on heroic quests to rescue Princess Peach from the spiky turtle villain, Bowser.",
      "Along the journey, Mario collects gold coins, grabs Super Stars for invincible speed, and eats Super Mushrooms to grow twice his normal size.",
      "From classic 2D platformers to 3D adventures like Super Mario Odyssey and kart racing in Mario Kart, Mario proves that great game design is all about pure, joyful fun."
    ]
  },
  {
    id: "kids-how-games-are-made",
    slug: "how-video-games-are-made-coding-art-music",
    title: "How Video Games Are Made: Coding, Art, and Music (Một Tựa Game Được Tạo Ra Như Thế Nào?)",
    author: "Game Design Kids",
    category: "🎮 Game & Trò Chơi",
    channelId: "kids-gaming",
    cefrLevel: "A2",
    summary: "Đằng sau mỗi nút bấm trên màn hình điện thoại hay tay cầm máy chơi game là sự kết hợp kỳ diệu giữa lập trình máy tính, hội họa và âm nhạc sôi động.",
    coverImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "Every time you pick up a game controller or tap on your smartphone screen, you enter an interactive world. But have you ever wondered how a video game is actually built?",
      "Making a video game requires a team of creative experts working together like a movie studio. It begins with the Game Designer, who writes down the storyline, characters, rules, and winning conditions.",
      "Next, Concept Artists draw sketches of heroes, alien planets, and scary monsters. 3D modelers then sculpt these drawings inside computer software and animate their movements.",
      "Meanwhile, Computer Programmers write thousands of lines of code. Code is like a set of secret recipes that tells the computer what happens when a player presses the jump button or collides with a wall.",
      "Sound Designers add punchy sound effects—like laser blasts and engine roars—while composers write exciting orchestral music that makes boss battles feel epic.",
      "Finally, Game Testers play every level hundreds of times to find glitches and bugs before the game is released. Anyone who loves technology, art, and storytelling can grow up to make games!"
    ]
  },
  {
    id: "kids-chess-strategy-puzzles",
    slug: "the-brain-power-of-chess-and-strategy-games",
    title: "The Brain Power of Chess and Strategy Games (Cờ Vua & Bí Mật Game Trí Tuệ)",
    author: "Brain Games & Puzzles",
    category: "🎮 Game & Trò Chơi",
    channelId: "kids-gaming",
    cefrLevel: "A2",
    summary: "Cờ vua và các trò chơi chiến thuật không chỉ là những ván đấu gay cấn, mà còn là bài tập thể dục tuyệt vời giúp rèn luyện trí nhớ và sự tập trung cho não bộ.",
    coverImage: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "Long before video games and smartphones were invented, people challenged each other with one of the greatest board games in human history: Chess!",
      "Chess was invented over 1,500 years ago in ancient India. On a checkered board of 64 black and white squares, two players lead armies of sixteen pieces to capture the enemy King.",
      "Each piece moves in a distinct pattern: Pawns march bravely forward, Knights leap in an L-shape over obstacles, Bishops glide diagonally, and the Queen is the most powerful warrior on the board.",
      "Scientists have discovered that playing strategy games like chess exercises both sides of the human brain. It sharpens memory, teaches patience, and improves math scores.",
      "A great chess player does not just look at their next move—they calculate three or four moves ahead and anticipate what their opponent will do. That kind of strategic thinking helps in school, sports, and everyday life!"
    ]
  },

  // --- 1. TRUYỆN NGỤ NGÔN KINH ĐIỂN (AESOP'S FABLES) ---
  {
    id: "kids-tortoise-and-the-hare",
    slug: "the-tortoise-and-the-hare",
    title: "The Tortoise and the Hare (Rùa và Thỏ)",
    author: "Aesop's Fables",
    category: "📖 Truyện Ngụ Ngôn",
    channelId: "kids-fables",
    cefrLevel: "A1",
    moral: "Chậm mà chắc sẽ luôn chiến thắng. Đừng bao giờ kiêu ngạo coi thường người khác.",
    summary: "Một chú thỏ kiêu ngạo luôn cười nhạo bước đi chậm chạp của chú rùa. Rùa bèn thách thức thỏ chạy đua, và một bất ngờ lớn đã xảy ra.",
    coverImage: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "Once upon a time, there was a very fast hare. He loved to brag about how quickly he could run. He laughed at the slow animals in the forest, especially the little tortoise.",
      "'You are so slow!' said the hare with a big laugh. 'It takes you all day just to walk across the green field!'",
      "The tortoise looked at the hare calmly and replied, 'I may be slow, but I can beat you in a race.' The hare laughed even louder. 'A race against you? That is the funniest joke I have ever heard! Let us race right now!'",
      "All the forest animals gathered to watch. The wise old owl shouted, 'Ready, set, go!'",
      "The hare dashed ahead like lightning. In just a few seconds, he was far away. He looked back and saw the tortoise creeping slowly along the dirt road.",
      "'The tortoise is so far behind,' thought the hare. 'I have plenty of time. I will take a nice nap under this shady apple tree.' So the hare closed his eyes and fell fast asleep.",
      "Meanwhile, the tortoise kept walking. Step by step, he never stopped to rest. The sun rose high in the sky, but the tortoise kept going patiently toward the finish line.",
      "When the hare finally woke up, the sun was setting. He jumped up and raced toward the goal as fast as he could. But it was too late! The tortoise had already crossed the finish line.",
      "All the animals cheered for the tortoise. The tortoise smiled kindly and said, 'Slow and steady wins the race!'"
    ]
  },
  {
    id: "kids-boy-who-cried-wolf",
    slug: "the-boy-who-cried-wolf",
    title: "The Boy Who Cried Wolf (Cậu Bé Chăn Cừu)",
    author: "Aesop's Fables",
    category: "📖 Truyện Ngụ Ngôn",
    channelId: "kids-fables",
    cefrLevel: "A1",
    moral: "Người nói dối sẽ không được ai tin tưởng, ngay cả khi họ nói sự thật.",
    summary: "Cậu bé chăn cừu cảm thấy buồn chán trên đồi nên đã hét to báo sói đến để lừa dân làng. Đến khi sói thật xuất hiện, không còn ai tin cậu nữa.",
    coverImage: "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "There was once a young shepherd boy who watched over his sheep on a sunny hillside near a quiet village. Sitting alone on the grass all day made him feel very bored.",
      "To entertain himself, he thought of a trick. He ran toward the village shouting at the top of his lungs, 'Wolf! Wolf! The wolf is chasing the sheep!'",
      "When the kind villagers heard his cries, they dropped their tools and ran up the hill to help the boy and save the flock. But when they arrived, there was no wolf. The sheep were eating grass peacefully.",
      "The boy laughed loudly at the tired villagers. 'It was just a joke!' he chuckled. The villagers shook their heads angrily and walked back down to their work.",
      "A few days later, the boy was bored again. Once more, he shouted, 'Wolf! Wolf! Please help, a big wolf is here!' Again, the villagers ran up the hill, only to find the boy laughing at them.",
      "Then, one evening, a real wolf crept out of the dark forest. It showed its sharp teeth and attacked the sheep. Terrified, the boy screamed with all his heart, 'Wolf! Wolf! A real wolf is here! Please help me!'",
      "The villagers heard his shouts, but they said to each other, 'He is just playing another trick. We will not run up the hill again.' Nobody came to help.",
      "The wolf chased away the sheep, and the boy sat weeping on the hillside. From that day on, he learned that nobody believes a liar, even when he speaks the truth."
    ]
  },
  {
    id: "kids-lion-and-the-mouse",
    slug: "the-lion-and-the-mouse",
    title: "The Lion and the Mouse (Sư Tử và Chuột Nhắt)",
    author: "Aesop's Fables",
    category: "📖 Truyện Ngụ Ngôn",
    channelId: "kids-fables",
    cefrLevel: "A1",
    moral: "Một hành động tử tế nhỏ bé cũng có thể mang lại sự giúp đỡ to lớn khi hoạn nạn.",
    summary: "Một chú chuột nhắt lỡ chạy qua mũi của sư tử đang ngủ. Sư tử tha mạng cho chuột, và sau này chính chú chuột nhỏ đã cứu sư tử thoát khỏi lưới thợ săn.",
    coverImage: "https://images.unsplash.com/photo-1614027164847-1b28caa1440c?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "A great lion was sleeping peacefully in the warm afternoon sunshine under a tall acacia tree. A tiny field mouse was running around looking for seeds.",
      "By mistake, the little mouse ran right across the lion's big nose. The lion woke up with a loud roar. He put his heavy paw over the tiny mouse and opened his huge jaws.",
      "'Please do not eat me, King Lion!' squeaked the terrified mouse. 'I am so sorry I woke you up. If you let me go, I will be your friend forever. Maybe one day I can help you too!'",
      "The lion laughed so hard that the ground shook. 'You help me? A tiny creature like you helping the King of the Jungle? That is hilarious!' But the lion was in a cheerful mood, so he lifted his paw and let the mouse go free.",
      "A few weeks later, hunters walked through the jungle. They set strong rope nets to catch wild animals. The lion walked into the trap and was pulled up into a tree.",
      "The lion roared loudly in anger and fear. He could not break the thick ropes. Far away in the grass, the little mouse recognized the lion's roar.",
      "The mouse ran as fast as his little legs could carry him. He found the lion trapped high in the net. 'Do not worry, my friend,' said the mouse. 'I am here to help you!'",
      "The mouse used his sharp little teeth to chew through the heavy ropes. Bit by bit, the net broke open, and the lion stepped down to freedom.",
      "The big lion bowed his head to the little mouse and smiled warmly. 'Thank you, little friend. Today I learned that even the smallest creature can help the mightiest king.'"
    ]
  },
  {
    id: "kids-ant-and-the-grasshopper",
    slug: "the-ant-and-the-grasshopper",
    title: "The Ant and the Grasshopper (Kiến và Châu Chấu)",
    author: "Aesop's Fables",
    category: "📖 Truyện Ngụ Ngôn",
    channelId: "kids-fables",
    cefrLevel: "A1",
    moral: "Hãy chăm chỉ lao động hôm nay để có cuộc sống no ấm ngày mai.",
    summary: "Suốt mùa hè rực rỡ, chú kiến chăm chỉ tha thức ăn về tổ, trong khi châu chấu mải mê ca hát. Khi mùa đông lạnh giá ùa về, châu chấu hiểu ra bài học quý giá.",
    coverImage: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "On a warm and bright summer day, a happy grasshopper was hopping around a flower garden. He was chirping, dancing, and singing joyful songs.",
      "Soon, he saw a little black ant walking by. The ant was carrying a heavy corn seed that was three times bigger than its own body. Sweat was dripping from the ant's head.",
      "'Why do you work so hard in this beautiful sunshine?' asked the grasshopper. 'Come sing with me and enjoy the summer breeze!'",
      "'I am collecting food for the cold winter,' replied the ant without stopping. 'I advise you to do the same, my friend. Winter will come soon.'",
      "'Winter is still far away!' laughed the grasshopper. 'Look around us, there is food everywhere on the green grass!' And he hopped away to play with the butterflies.",
      "All summer long, the ant and his family carried seeds, grains, and sweet fruit into their deep underground home.",
      "When autumn ended, icy winds blew across the forest. Snow covered every field, leaf, and flower. The grasshopper was freezing cold and could not find a single crumb to eat.",
      "Shivering and weak, the grasshopper knocked on the ant's cozy door. 'Please, kind ant, give me a little food, or I will starve!'",
      "The ant gave him a warm bowl of soup and said gently, 'In summer, you sang and played while we worked. Remember, there is a time for work and a time for play.'"
    ]
  },
  {
    id: "kids-fox-and-the-grapes",
    slug: "the-fox-and-the-grapes",
    title: "The Fox and the Grapes (Cáo và Chùm Nho)",
    author: "Aesop's Fables",
    category: "📖 Truyện Ngụ Ngôn",
    channelId: "kids-fables",
    cefrLevel: "A2",
    moral: "Thật dễ dàng chê bai những thứ mà bản thân không thể đạt được.",
    summary: "Một chú cáo đói nhìn thấy giàn nho tím mọng nước trên cao. Sau nhiều lần nhảy mà không với tới, cáo quay đi và tự an ủi rằng nho còn xanh lắm.",
    coverImage: "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "One hot summer day, a clever red fox was walking through the countryside. His stomach was rumbling because he had not eaten anything since sunrise.",
      "As he passed by a vineyard, he stopped in amazement. Hanging from a wooden trellis high above were clusters of ripe, purple grapes. They looked plump, juicy, and delicious in the golden sunlight.",
      "'Just what I need to quench my thirst and satisfy my hunger!' whispered the fox with sparkling eyes.",
      "The fox took a few steps backward, ran forward, and leaped into the air. He stretched his paws as high as possible, but he missed the grapes by a few inches.",
      "He shook the dust off his coat and tried again. 'One, two, three, jump!' he said. But again, he fell back down to the soft grass without touching a single grape.",
      "The fox did not want to give up easily. He tried jumping from different angles, running faster, and leaping higher. But the grapes hung far out of his reach.",
      "Finally, tired and out of breath, the fox sat down and looked up at the beautiful fruit. He curled his nose with a haughty sneer.",
      "'What a fool I am,' said the fox loudly so the birds could hear. 'Those grapes are probably completely sour and full of worms anyway. I would never eat sour grapes!'",
      "And with his nose held high in the air, the fox walked away into the forest, pretending he did not care."
    ]
  },
  {
    id: "kids-wind-and-the-sun",
    slug: "the-wind-and-the-sun",
    title: "The Wind and the Sun (Thần Gió và Thần Mặt Trời)",
    author: "Aesop's Fables",
    category: "📖 Truyện Ngụ Ngôn",
    channelId: "kids-fables",
    cefrLevel: "A1",
    moral: "Sự dịu dàng và ấm áp luôn thuyết phục hơn sự giận dữ và bạo lực.",
    summary: "Thần Gió và Thần Mặt Trời tranh cãi xem ai mạnh hơn. Họ thử thách bằng cách xem ai có thể làm người bộ hành cởi bỏ chiếc áo khoác trước.",
    coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "High up in the blue sky, the Wind and the Sun had a friendly argument about who was stronger.",
      "'I am much stronger than you!' boasted the Wind. 'I can tear down giant trees, create stormy waves on the sea, and blow away roofs!'",
      "The Sun smiled softly and said, 'True strength does not always come from anger and noise. Let us have a contest to find out.'",
      "Looking down at the earth, they saw a traveler walking along a peaceful mountain path. The man was wearing a thick winter cloak.",
      "'Let us see which of us can make that traveler take off his cloak first,' suggested the Sun. 'You may go first, Wind.'",
      "The Wind took a huge breath and blew with all his might. Cold, icy gusts roared through the trees. Dust flew everywhere.",
      "But the harder the Wind blew, the tighter the traveler wrapped his warm cloak around his shoulders. At last, the Wind became tired and had to stop.",
      "Now it was the Sun's turn. The Sun stepped gently out from behind a silver cloud and beamed warm, golden sunshine down upon the traveler.",
      "The freezing air melted away, and birds began to sing cheerfully in the branches. Soon, the traveler felt pleasant and warm. As the Sun shone a little brighter, beads of sweat appeared on the man's forehead.",
      "'What lovely, warm weather!' smiled the traveler. He unbuttoned his heavy cloak, took it off with relief, and carried it happily on his arm.",
      "The Wind hung his head in defeat. The Sun smiled kindly and said, 'Gentleness and warmth are always more powerful than fury and force.'"
    ]
  },

  // --- 2. KHOA HỌC VUI & THIÊN NHIÊN (FUN SCIENCE & NATURE) ---
  {
    id: "kids-why-is-the-sky-blue",
    slug: "why-is-the-sky-blue",
    title: "Why Is the Sky Blue? (Vì Sao Bầu Trời Màu Xanh?)",
    author: "Science Wonders for Kids",
    category: "🔬 Khoa Học Vui",
    channelId: "kids-science",
    cefrLevel: "A2",
    summary: "Ánh sáng mặt trời trông có màu trắng, nhưng thực chất chứa đầy đủ sắc màu cầu vồng. Khám phá bí mật vì sao bầu trời lại có màu xanh tuyệt đẹp!",
    coverImage: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "Have you ever looked up at the sky on a bright sunny day and wondered why it looks so blue? The secret begins with sunlight and the air we breathe.",
      "Light from the sun looks white to our eyes, but it is actually made of all the colors of the rainbow: red, orange, yellow, green, blue, and violet. Each color travels in waves of different lengths.",
      "Red and orange light travel in long, lazy waves. Blue and violet light travel in short, quick waves.",
      "Surrounding our Earth is an invisible blanket of air called the atmosphere. This air is filled with billions of tiny gas particles and water droplets.",
      "When white sunlight enters the atmosphere, the long red waves pass straight through the air without bumping into many particles.",
      "However, the short blue waves bounce off the tiny gas molecules and scatter in every direction across the sky! Scientists call this discovery Rayleigh scattering.",
      "Because blue light scatters everywhere, when you look up away from the sun, your eyes see the scattered blue light from all directions.",
      "Next time you look at the blue sky, you can share this wonderful science secret with your parents and friends!"
    ]
  },
  {
    id: "kids-how-bees-make-honey",
    slug: "how-do-bees-make-honey",
    title: "How Do Bees Make Sweet Honey? (Những Chú Ong Làm Mật Như Thế Nào?)",
    author: "Science Wonders for Kids",
    category: "🔬 Khoa Học Vui",
    channelId: "kids-science",
    cefrLevel: "A2",
    summary: "Từ những bông hoa rực rỡ đến hũ mật ong vàng óng trên bàn ăn, cùng theo chân các chú ong thợ chăm chỉ khám phá quy trình làm mật kỳ diệu.",
    coverImage: "https://images.unsplash.com/photo-1473081556163-2a17de81fc97?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "Honey is sweet, golden, and delicious on morning toast. But have you ever wondered how little honeybees make this sweet treat?",
      "It all begins with flowers. Worker bees fly from flower to flower drinking a sweet liquid called nectar. They use a long, straw-like tongue to sip the nectar.",
      "A bee has two stomachs! One stomach digests food for the bee, while the other stomach acts as a honey backpack to carry nectar back to the hive.",
      "To fill their honey stomach, a single bee visits between 50 and 100 flowers in just one flight. They work tirelessly from morning until evening.",
      "When the bee returns to the hive, it passes the nectar to another bee. The hive bees spread the nectar into wax honeycomb cells.",
      "Fresh nectar has a lot of water inside. To make it thick, the bees flap their wings super fast—over 200 times every second! This creates a breeze that evaporates the extra water.",
      "Once the honey becomes thick and golden, the bees seal the honeycomb cell with clean beeswax. It stays fresh and sweet forever!",
      "Honeybees are among the most helpful creatures on Earth. They not only give us honey, but they also help flowers, fruits, and vegetables grow."
    ]
  },
  {
    id: "kids-secrets-of-t-rex",
    slug: "secrets-of-tyrannosaurus-rex",
    title: "Secrets of Tyrannosaurus Rex (Bí Mật Về Khủng Long T-Rex)",
    author: "Dino Explorer Kids",
    category: "🔬 Khoa Học Vui",
    channelId: "kids-science",
    cefrLevel: "A2",
    summary: "Tyrannosaurus Rex là một trong những loài khủng long ăn thịt nổi tiếng nhất lịch sử. Khám phá sự thật thú vị về đôi tay nhỏ bé và sức mạnh vô địch của T-Rex.",
    coverImage: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "Millions of years ago, before humans existed, giant dinosaurs ruled our planet. Among them was the most famous predator of all: Tyrannosaurus Rex!",
      "The name Tyrannosaurus Rex means 'King of the Tyrant Lizards.' A full-grown T-Rex was about 12 meters long and as tall as a two-story building.",
      "Its head was enormous, measuring about 1.5 meters long. Inside its mouth were up to 60 teeth, some as long as a banana! These teeth were sharp like steak knives and strong enough to crush bone.",
      "Scientists have found that T-Rex had one of the strongest bite forces of any animal that ever lived on Earth.",
      "People often laugh at T-Rex's tiny arms. Although its arms were only about one meter long, each arm had two sharp claws and was surprisingly muscular.",
      "Did you know that T-Rex also had an incredible sense of smell? Fossils show that the part of its brain used for smelling was huge, allowing it to find food from miles away.",
      "Today, scientists study dinosaur fossils buried deep in rock to uncover new secrets about how these magnificent creatures lived and cared for their babies."
    ]
  },
  {
    id: "kids-why-do-we-dream",
    slug: "why-do-we-dream-when-we-sleep",
    title: "Why Do We Dream When We Sleep? (Tại Sao Chúng Ta Lại Mơ?)",
    author: "Brain Science for Kids",
    category: "🔬 Khoa Học Vui",
    channelId: "kids-science",
    cefrLevel: "A2",
    summary: "Khi bạn nhắm mắt ngủ say, bộ não của bạn lại bắt đầu một cuộc phiêu lưu kỳ thú với những giấc mơ rực rỡ sắc màu. Cùng tìm hiểu lý do vì sao nhé!",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "Every night when you tuck yourself into bed and close your eyes, your body rests. But your amazing brain stays awake and goes on creative adventures called dreams!",
      "Dreams happen mostly during a special stage of sleep called REM sleep, which stands for Rapid Eye Movement. During REM sleep, your eyes move quickly behind closed eyelids, just like you are watching a movie.",
      "Why does our brain make dreams? Scientists believe dreams help organize our memories, just like tidying up your bedroom toys.",
      "During the day, you learn so many new things: math at school, a funny joke from a friend, or the taste of chocolate ice cream. At night, your brain sorts these memories and stores important ones.",
      "Dreams can also help us solve problems and spark imagination. Many great artists, inventors, and musicians found wonderful ideas in their dreams!",
      "Everyone dreams every single night, even if you do not remember your dreams when morning comes. Dreams are proof of how magical and creative your mind truly is."
    ]
  },
  {
    id: "kids-how-whales-sing",
    slug: "how-whales-sing-under-the-sea",
    title: "How Do Whales Sing Under the Sea? (Cá Voi Hát Dưới Biển Như Thế Nào?)",
    author: "Ocean Discovery Kids",
    category: "🔬 Khoa Học Vui",
    channelId: "kids-science",
    cefrLevel: "A2",
    summary: "Dưới lòng đại dương sâu thẳm, những chú cá voi khổng lồ có thể cất tiếng hát du dương vang xa hàng trăm dặm để trò chuyện với bạn bè.",
    coverImage: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=1200&auto=format&fit=crop&q=80",
    paragraphs: [
      "The blue ocean is home to the largest animals ever known to live on Earth: giant whales. Deep beneath the waves, these gentle giants sing mysterious songs.",
      "Humpback whales are famous for their musical songs. Their songs are made of clicks, whistles, groans, and deep rumbles that follow rhythmic patterns, just like verses of a song.",
      "Because sunlight does not reach deep into the water, whales cannot see very far. But sound travels four times faster through water than through air!",
      "By singing, whales can send messages to their family members across hundreds of miles of open ocean.",
      "Male whales also sing complex songs to find a mate. A single whale song can last up to 30 minutes, and whales can repeat the song for hours at a time.",
      "Whale songs are so hauntingly beautiful that scientists have recorded them and sent them on the Voyager spacecraft into outer space, representing the voice of our living Earth."
    ]
  }
];

// Helper: Convert KidsStory to NewsItem
export function convertKidsStoryToNewsItem(story: KidsStory): NewsItem {
  const fullText = story.paragraphs.join(" ");
  const { wordCount } = estimateCEFR(fullText);
  return {
    id: story.id,
    title: story.title,
    link: `https://www.vnereader.fun/kids/story/${story.slug}`,
    guid: story.id,
    pubDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    description: story.moral ? `💡 Bài học: ${story.moral} — ${story.summary}` : story.summary,
    thumbnail: story.coverImage,
    category: story.category,
    channelId: story.channelId,
    sourceId: "kids",
    sourceName: "Kids & Teens",
    readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 120)),
    wordCount,
    cefrLevel: story.cefrLevel,
    difficultyScore: story.cefrLevel === "A1" ? 1 : story.cefrLevel === "A2" ? 2 : 3
  };
}

// Fetch live news from CBBC Newsround RSS feed
export async function fetchCbbcNewsroundFeed(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://feeds.bbci.co.uk/newsround/home/rss.xml", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      },
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      cdataPropName: "__cdata"
    });
    const result = parser.parse(xml);
    const rawItems = result?.rss?.channel?.item;
    if (!rawItems || !Array.isArray(rawItems)) return [];

    const items: NewsItem[] = [];
    for (const item of rawItems.slice(0, 15)) {
      const title = (item.title?.__cdata || item.title || "").trim();
      const rawDesc = (item.description?.__cdata || item.description || "").trim();
      const link = (item.link?.__cdata || item.link || "").trim();
      if (!title || !link || title.toLowerCase().includes("signed") || title.toLowerCase().includes("video")) continue;

      let thumbnail = item["media:thumbnail"]?.["@_url"] || item["media:content"]?.["@_url"] || "";
      if (!thumbnail) {
        thumbnail = "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&auto=format&fit=crop&q=80";
      }

      items.push({
        id: `kids-cbbc-${item.guid?.__cdata || item.guid || Math.random().toString(36).substring(7)}`,
        title: `🎈 ${title}`,
        link: link,
        guid: link,
        pubDate: item.pubDate || new Date().toISOString(),
        description: rawDesc,
        thumbnail,
        category: "🎈 Tin Tức Thiếu Nhi (Newsround)",
        channelId: "kids-news",
        sourceId: "kids",
        sourceName: "Kids & Teens",
        readingTimeMinutes: 2,
        wordCount: 180,
        cefrLevel: "A2",
        difficultyScore: 2
      });
    }
    return items;
  } catch (err) {
    console.error("fetchCbbcNewsroundFeed error:", err);
    return [];
  }
}

// Master Kids Feed Aggregator
export async function fetchKidsFeed(channelId: string = "kids-all"): Promise<NewsItem[]> {
  const curatedItems = KIDS_STORIES.map(convertKidsStoryToNewsItem);

  if (channelId === "kids-gaming") {
    return curatedItems.filter(it => it.channelId === "kids-gaming");
  }
  if (channelId === "kids-science") {
    return curatedItems.filter(it => it.channelId === "kids-science");
  }
  if (channelId === "kids-fables") {
    return curatedItems.filter(it => it.channelId === "kids-fables");
  }
  if (channelId === "kids-news") {
    const liveCbbc = await fetchCbbcNewsroundFeed();
    return liveCbbc.length > 0 ? liveCbbc : curatedItems;
  }

  // "kids-all": Interleave gaming, science, fables, and live CBBC news
  let liveCbbc: NewsItem[] = [];
  try {
    liveCbbc = await fetchCbbcNewsroundFeed();
  } catch {
    liveCbbc = [];
  }

  const gaming = curatedItems.filter(it => it.channelId === "kids-gaming");
  const science = curatedItems.filter(it => it.channelId === "kids-science");
  const fables = curatedItems.filter(it => it.channelId === "kids-fables");

  // Interleave for maximum excitement: Gaming -> Science -> Fable -> Live News
  const combined: NewsItem[] = [];
  const maxLen = Math.max(gaming.length, science.length, fables.length, liveCbbc.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < gaming.length) combined.push(gaming[i]);
    if (i < science.length) combined.push(science[i]);
    if (i < fables.length) combined.push(fables[i]);
    if (i < liveCbbc.length) combined.push(liveCbbc[i]);
  }

  return combined;
}

// Get Full Article Detail for Curated Kids Story
export function getKidsArticleDetail(urlOrSlug: string): ArticleDetail | null {
  const clean = urlOrSlug
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/?kids\/(?:story\/)?/, "")
    .replace(/^kids-/, "");

  const story = KIDS_STORIES.find(s => s.slug === clean || s.id === clean || s.id === `kids-${clean}`) 
    || KIDS_STORIES.find(s => urlOrSlug.includes(s.slug));

  if (!story) return null;

  const paragraphs: ArticleParagraph[] = story.paragraphs.map((p, idx) => ({
    id: `p-${idx}`,
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
    id: story.id,
    title: story.title,
    link: `https://www.vnereader.fun/kids/story/${story.slug}`,
    pubDate: "Khám phá cùng VnE Kids",
    category: story.category,
    lead: story.moral ? `💡 Bài học cuộc sống: ${story.moral} — ${story.summary}` : story.summary,
    thumbnail: story.coverImage,
    caption: `${story.title} • Biên soạn chuẩn CEFR ${story.cefrLevel} dành cho thiếu nhi & gia đình`,
    author: story.author,
    paragraphs,
    wordCount,
    cefrLevel: story.cefrLevel,
    keyVocabulary: keyVocabulary.slice(0, 10)
  };
}
