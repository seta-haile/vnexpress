import { XMLParser } from "fast-xml-parser";
import { RssChannel, NewsItem, PublicationSource } from "@/types/news";
import { getClassicStoryNewsItems } from "@/lib/classicStories";

// 1. VnExpress International Channels
export const RSS_CHANNELS: RssChannel[] = [
  {
    id: "home",
    name: "Latest News",
    vietnameseName: "Tin Mới Nhất",
    url: "https://e.vnexpress.net/rss/home.rss",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    description: "Tổng hợp các tin tức nóng hổi, cập nhật liên tục từ VnExpress International."
  },
  {
    id: "business",
    name: "Business & Economy",
    vietnameseName: "Kinh Doanh & Kinh Tế",
    url: "https://e.vnexpress.net/rss/business.rss",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    description: "Từ vựng chuyên ngành tài chính, kinh doanh, thị trường và đầu tư."
  },
  {
    id: "tech",
    name: "Technology & AI",
    vietnameseName: "Công Nghệ & AI",
    url: "https://e.vnexpress.net/rss/tech.rss",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    description: "Cập nhật xu hướng công nghệ số, trí tuệ nhân tạo và khởi nghiệp đổi mới sáng tạo."
  },
  {
    id: "life",
    name: "Life & Culture",
    vietnameseName: "Đời Sống & Văn Hóa",
    url: "https://e.vnexpress.net/rss/life.rss",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    description: "Từ vựng đời sống thường nhật, lối sống, sức khỏe và văn hóa gia đình."
  },
  {
    id: "travel",
    name: "Travel & Places",
    vietnameseName: "Du Lịch & Ẩm Thực",
    url: "https://e.vnexpress.net/rss/travel.rss",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    description: "Khám phá danh lam thắng cảnh, ẩm thực Việt Nam và quốc tế bằng tiếng Anh chuẩn."
  },
  {
    id: "news",
    name: "Society & Politics",
    vietnameseName: "Thời Sự & Xã Hội",
    url: "https://e.vnexpress.net/rss/news.rss",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    description: "Tin thời sự xã hội, chính sách, giáo dục và môi trường tại Việt Nam."
  },
  {
    id: "world",
    name: "World News",
    vietnameseName: "Thế Giới",
    url: "https://e.vnexpress.net/rss/world.rss",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    description: "Tin tức toàn cầu, sự kiện quốc tế phục vụ luyện thi IELTS/TOEFL."
  },
  {
    id: "sports",
    name: "Sports",
    vietnameseName: "Thể Thao",
    url: "https://e.vnexpress.net/rss/sports.rss",
    badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    description: "Bóng đá, thể thao trong nước và quốc tế với nhiều thuật ngữ sinh động."
  },
  {
    id: "perspectives",
    name: "Perspectives",
    vietnameseName: "Góc Nhìn & Ý Kiến",
    url: "https://e.vnexpress.net/rss/perspectives.rss",
    badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
    description: "Các bài luận, bình luận và quan điểm chuyên sâu để học văn phong học thuật."
  }
];

// 2. BBC News Channels
export const BBC_CHANNELS: RssChannel[] = [
  {
    id: "bbc-world",
    name: "BBC World News",
    vietnameseName: "Tin Thế Giới",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    badgeColor: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    description: "Bản tin thời sự quốc tế chuẩn Anh - Anh từ hãng thông tấn BBC."
  },
  {
    id: "bbc-business",
    name: "Business & Economy",
    vietnameseName: "Kinh Doanh & Tài Chính",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    description: "Kinh tế thị trường toàn cầu, tài chính và thương mại quốc tế."
  },
  {
    id: "bbc-tech",
    name: "Technology",
    vietnameseName: "Công Nghệ & AI",
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    description: "Công nghệ thông tin, trí tuệ nhân tạo và khởi nghiệp số."
  },
  {
    id: "bbc-science",
    name: "Science & Environment",
    vietnameseName: "Khoa Học & Môi Trường",
    url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    description: "Khám phá khoa học vũ trụ, biến đổi khí hậu và sinh thái toàn cầu."
  },
  {
    id: "bbc-health",
    name: "Health",
    vietnameseName: "Sức Khỏe & Y Tế",
    url: "https://feeds.bbci.co.uk/news/health/rss.xml",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    description: "Tin tức y tế, nghiên cứu chăm sóc sức khỏe và lối sống lành mạnh."
  },
  {
    id: "bbc-entertainment",
    name: "Entertainment & Arts",
    vietnameseName: "Văn Hóa & Giải Trí",
    url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    description: "Điện ảnh, âm nhạc, nghệ thuật và người nổi tiếng thế giới."
  }
];

// 3. The Guardian Channels
export const GUARDIAN_CHANNELS: RssChannel[] = [
  {
    id: "guardian-world",
    name: "International News",
    vietnameseName: "Tin Quốc Tế",
    url: "https://www.theguardian.com/world/rss",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    description: "Báo chí phân tích sâu sắc về thời sự và nhân văn toàn cầu."
  },
  {
    id: "guardian-business",
    name: "Business & Markets",
    vietnameseName: "Kinh Doanh & Thị Trường",
    url: "https://www.theguardian.com/uk/business/rss",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    description: "Thị trường tài chính, kinh tế vĩ mô và doanh nghiệp quốc tế."
  },
  {
    id: "guardian-tech",
    name: "Technology",
    vietnameseName: "Công Nghệ & Số Hóa",
    url: "https://www.theguardian.com/uk/technology/rss",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    description: "Big Tech, AI, an ninh mạng và tác động của công nghệ tới xã hội."
  },
  {
    id: "guardian-environment",
    name: "Environment",
    vietnameseName: "Môi Trường & Sinh Thái",
    url: "https://www.theguardian.com/uk/environment/rss",
    badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800",
    description: "Chuyên sâu về khủng hoảng khí hậu, đa dạng sinh học và phát triển xanh."
  },
  {
    id: "guardian-culture",
    name: "Culture & Books",
    vietnameseName: "Văn Hóa & Nghệ Thuật",
    url: "https://www.theguardian.com/uk/culture/rss",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    description: "Văn chương, phim ảnh, âm nhạc và mỹ thuật đương đại."
  },
  {
    id: "guardian-lifestyle",
    name: "Lifestyle",
    vietnameseName: "Phong Cách Sống",
    url: "https://www.theguardian.com/uk/lifeandstyle/rss",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    description: "Ẩm thực, du lịch, sức khỏe tinh thần và các mối quan hệ đời sống."
  }
];

// 4. NPR Channels
export const NPR_CHANNELS: RssChannel[] = [
  {
    id: "npr-all",
    name: "All Stories",
    vietnameseName: "Tất Cả Chuyên Mục NPR",
    url: "https://feeds.npr.org/1001/rss.xml",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    description: "Tổng hợp bài viết từ tất cả các chuyên mục thời sự, văn hóa, khoa học & sách của NPR."
  },
  {
    id: "npr-news",
    name: "News & Politics",
    vietnameseName: "Thời Sự & Xã Hội",
    url: "https://feeds.npr.org/1001/rss.xml",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    description: "Bản tin thời sự, chính trị và xã hội Hoa Kỳ."
  },
  {
    id: "npr-arts",
    name: "Arts & Culture",
    vietnameseName: "Văn Hóa & Đời Sống",
    url: "https://feeds.npr.org/1008/rss.xml",
    badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800",
    description: "Âm nhạc, điện ảnh, nghệ thuật và phong cách sống đương đại."
  },
  {
    id: "npr-science",
    name: "Science & Health",
    vietnameseName: "Khoa Học & Sức Khỏe",
    url: "https://feeds.npr.org/1007/rss.xml",
    badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    description: "Khám phá khoa học, y tế và môi trường sinh thái."
  },
  {
    id: "npr-books",
    name: "Books & Stories",
    vietnameseName: "Sách & Câu Chuyện",
    url: "https://feeds.npr.org/1057/rss.xml",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    description: "Review sách, phỏng vấn tác giả và những câu chuyện tự sự truyền cảm hứng."
  }
];

// 5. Humans of New York Channels
export const HONY_CHANNELS: RssChannel[] = [
  {
    id: "hony-all",
    name: "HONY Stories",
    vietnameseName: "Tất Cả Câu Chuyện HONY",
    url: "https://humansofnyarchive.com/rss",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    description: "Những câu chuyện chân dung đời thực giàu xúc cảm từ người dân New York."
  }
];

// 6. The Conversation Channels
export const THE_CONVERSATION_CHANNELS: RssChannel[] = [
  {
    id: "theconversation-all",
    name: "All Topics",
    vietnameseName: "Tổng Hợp Học Thuật",
    url: "https://theconversation.com/articles.atom",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    description: "Phân tích khoa học, xã hội từ các giáo sư đại học hàng đầu thế giới."
  },
  {
    id: "theconversation-politics",
    name: "Politics & Society",
    vietnameseName: "Chính Trị & Xã Hội",
    url: "https://theconversation.com/global/politics/articles.atom",
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    description: "Phân tích chính sách, quan hệ quốc tế và các vấn đề xã hội đương đại."
  },
  {
    id: "theconversation-tech",
    name: "Technology & AI",
    vietnameseName: "Công Nghệ & AI",
    url: "https://theconversation.com/global/technology/articles.atom",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    description: "Trí tuệ nhân tạo, khoa học máy tính và tương lai của công nghệ."
  },
  {
    id: "theconversation-environment",
    name: "Environment",
    vietnameseName: "Môi Trường & Khí Hậu",
    url: "https://theconversation.com/global/environment/articles.atom",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    description: "Nghiên cứu sinh thái, biến đổi khí hậu và chuyển dịch năng lượng."
  },
  {
    id: "theconversation-health",
    name: "Health & Medicine",
    vietnameseName: "Sức Khỏe & Y Sinh",
    url: "https://theconversation.com/global/health/articles.atom",
    badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    description: "Nghiên cứu y sinh học, tâm lý học và sức khỏe cộng đồng."
  },
  {
    id: "theconversation-arts",
    name: "Arts & Culture",
    vietnameseName: "Văn Hóa & Nghệ Thuật",
    url: "https://theconversation.com/global/arts/articles.atom",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    description: "Lịch sử, triết học, văn học và nghệ thuật thị giác."
  }
];

// 7. ProPublica Channels
export const PROPUBLICA_CHANNELS: RssChannel[] = [
  {
    id: "propublica-all",
    name: "Investigative Journalism",
    vietnameseName: "Phóng Sự Điều Tra Pulitzer",
    url: "https://www.propublica.org/feeds/propublica/main",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    description: "Báo chí điều tra phi lợi nhuận độc lập đoạt giải Pulitzer (CC BY-NC-ND)."
  }
];

// 8. Wikinews Channels
export const WIKINEWS_CHANNELS: RssChannel[] = [
  {
    id: "wikinews-all",
    name: "All News",
    vietnameseName: "Tin Mới Nhất",
    url: "Category:Published",
    badgeColor: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800",
    description: "Bản tin trung lập, đa chiều từ cộng đồng phóng viên độc lập toàn cầu của Wikimedia."
  },
  {
    id: "wikinews-business",
    name: "Economy & Business",
    vietnameseName: "Kinh Tế & Thương Mại",
    url: "Category:Economy_and_business",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    description: "Tin tức kinh tế và thị trường tài chính quốc tế."
  },
  {
    id: "wikinews-tech",
    name: "Science & Tech",
    vietnameseName: "Khoa Học & Công Nghệ",
    url: "Category:Science_and_technology",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    description: "Đột phá khoa học và công nghệ từ các nguồn tin mở."
  },
  {
    id: "wikinews-culture",
    name: "Culture & Entertainment",
    vietnameseName: "Văn Hóa & Giải Trí",
    url: "Category:Culture_and_entertainment",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    description: "Sự kiện văn hóa nghệ thuật và tin tức giải trí toàn cầu."
  },
  {
    id: "wikinews-sports",
    name: "Sports",
    vietnameseName: "Thể Thao Quốc Tế",
    url: "Category:Sports",
    badgeColor: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    description: "Tin tức thể thao quốc tế từ cộng đồng phóng viên Wikinews."
  }
];

// 9. Gutenberg Classic Stories Channels
export const GUTENBERG_CHANNELS: RssChannel[] = [
  {
    id: "gutenberg-all",
    name: "All Classics",
    vietnameseName: "Tất Cả Kiệt Tác",
    url: "all",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    description: "Toàn bộ kho tàng truyện ngắn bất hủ từ Project Gutenberg & Standard Ebooks."
  },
  {
    id: "gutenberg-ohenry",
    name: "O. Henry",
    vietnameseName: "O. Henry (Nhân Văn & Bất Ngờ)",
    url: "o-henry",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    description: "Bậc thầy truyện ngắn với kết thúc bất ngờ đầy cảm xúc nhân văn."
  },
  {
    id: "gutenberg-doyle",
    name: "Sherlock Holmes",
    vietnameseName: "Arthur Conan Doyle (Trinh Thám)",
    url: "conan-doyle",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    description: "Những vụ án suy luận kinh điển của thám tử đại tài Sherlock Holmes."
  },
  {
    id: "gutenberg-poe",
    name: "Edgar Allan Poe",
    vietnameseName: "Edgar Allan Poe (Bí Ẩn & Kinh Dị)",
    url: "poe",
    badgeColor: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800",
    description: "Văn phong u tối, sâu thẳm tâm lý và bí ẩn rợn người bất hủ."
  },
  {
    id: "gutenberg-chopin",
    name: "Kate Chopin",
    vietnameseName: "Kate Chopin (Hiện Thực & Nội Tâm)",
    url: "chopin",
    badgeColor: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
    description: "Ngòi bút hiện thực sắc sảo về tâm lý người phụ nữ thế kỷ 19."
  }
];

// 10. Global Voices Channels (CC BY 3.0 Open Journalism)
export const GLOBAL_VOICES_CHANNELS: RssChannel[] = [
  {
    id: "globalvoices-all",
    name: "All Topics",
    vietnameseName: "Tất Cả Chủ Đề",
    url: "https://globalvoices.org/feed/",
    badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800",
    description: "Những câu chuyện con người, nhân quyền và văn hóa bản địa khắp các châu lục."
  },
  {
    id: "globalvoices-africa",
    name: "Africa",
    vietnameseName: "Châu Phi",
    url: "https://globalvoices.org/-/world/sub-saharan-africa/feed/",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    description: "Tiếng nói từ các cộng đồng châu Phi cận Sahara về môi trường, nhân quyền và đổi mới."
  },
  {
    id: "globalvoices-americas",
    name: "Americas",
    vietnameseName: "Châu Mỹ",
    url: "https://globalvoices.org/-/world/latin-america/feed/",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    description: "Đời sống, phong trào xã hội và văn hóa đa dạng khu vực Mỹ Latinh & Châu Mỹ."
  },
  {
    id: "globalvoices-asia",
    name: "Asia",
    vietnameseName: "Châu Á",
    url: "https://globalvoices.org/-/world/east-asia/feed/",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    description: "Tin tức, xã hội và văn hóa từ các quốc gia khu vực Châu Á."
  },
  {
    id: "globalvoices-europe",
    name: "Europe",
    vietnameseName: "Châu Âu",
    url: "https://globalvoices.org/-/world/western-europe/feed/",
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    description: "Nhân quyền, xã hội dân sự và đời sống con người khu vực Châu Âu."
  },
  {
    id: "globalvoices-elections",
    name: "Elections",
    vietnameseName: "Bầu Cử",
    url: "https://globalvoices.org/-/topics/elections/feed/",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    description: "Bản tin bầu cử, dân chủ và chính trị từ các quốc gia trên thế giới."
  },
  {
    id: "globalvoices-culture",
    name: "Culture",
    vietnameseName: "Văn Hóa",
    url: "https://globalvoices.org/-/topics/arts-culture/feed/",
    badgeColor: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
    description: "Nghệ thuật, âm nhạc, văn học và đời sống văn hóa phong phú đa quốc gia."
  },
  {
    id: "globalvoices-humanrights",
    name: "Human Rights",
    vietnameseName: "Nhân Quyền",
    url: "https://globalvoices.org/-/topics/human-rights/feed/",
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    description: "Tiếng nói bảo vệ quyền tự do, bình đẳng và nhân quyền trên khắp toàn cầu."
  },
  {
    id: "globalvoices-digitalactivism",
    name: "Digital Activism",
    vietnameseName: "Hoạt Động Kỹ Thuật Số",
    url: "https://globalvoices.org/-/topics/digital-activism/feed/",
    badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    description: "Tự do Internet, an toàn số và các phong trào xã hội trên không gian mạng."
  }
];

// 10 Comprehensive Publication Sources
export const PUBLICATION_SOURCES: PublicationSource[] = [
  {
    id: "vnexpress",
    name: "VnExpress International",
    shortName: "VnExpress",
    badge: "Thời sự & Kinh tế",
    tagline: "Báo tiếng Anh số 1 Việt Nam - Tin thời sự, kinh tế, công nghệ & đời sống",
    description: "Cung cấp tin tức thời sự chính luận, kinh tế, xã hội với văn phong báo chí chuẩn mực quốc tế. Lý tưởng để rèn luyện kỹ năng đọc hiểu chuyên sâu và chuẩn bị cho các kỳ thi IELTS, TOEFL.",
    logoText: "VnE",
    badgeColor: "bg-[#9A1B43]/15 text-[#9A1B43] dark:text-[#f43f5e] border-[#9A1B43]/30",
    gradient: "from-[#9A1B43] via-[#851435] to-[#500724]",
    rssUrl: "https://e.vnexpress.net/rss/home.rss",
    websiteUrl: "https://e.vnexpress.net",
    channels: RSS_CHANNELS,
    cefrRange: "B1 - C1",
    readingStyle: "Tin tức chính luận, kinh tế, xã hội chuẩn báo chí",
    coverImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "bbc",
    name: "BBC News World",
    shortName: "BBC News",
    badge: "Chuẩn Anh - Anh • IELTS",
    tagline: "Hãng thông tấn uy tín hàng đầu nước Anh và thế giới",
    description: "Nguồn tài liệu kinh điển cho người luyện thi IELTS. Ngôn từ súc tích, ngữ pháp chặt chẽ, câu cú mạch lạc với góc nhìn thời sự toàn cầu chuẩn văn phong British English.",
    logoText: "BBC",
    badgeColor: "bg-red-600/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/60",
    gradient: "from-red-700 via-red-600 to-zinc-900",
    rssUrl: "https://feeds.bbci.co.uk/news/world/rss.xml",
    websiteUrl: "https://www.bbc.com/news",
    channels: BBC_CHANNELS,
    cefrRange: "B2 - C1",
    readingStyle: "Báo chí quốc tế chuẩn Anh - Anh, lý tưởng luyện IELTS",
    coverImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "guardian",
    name: "The Guardian",
    shortName: "The Guardian",
    badge: "Phân tích sâu & Văn hóa",
    tagline: "Nhật báo độc lập danh tiếng với các bài viết phân tích sâu sắc",
    description: "Nổi tiếng với văn phong tự do, giàu vốn từ vựng phong phú và các bài luận sâu sắc về môi trường, nhân văn, nghệ thuật và xã hội toàn cầu.",
    logoText: "G",
    badgeColor: "bg-blue-600/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60",
    gradient: "from-blue-700 via-sky-600 to-slate-900",
    rssUrl: "https://www.theguardian.com/world/rss",
    websiteUrl: "https://www.theguardian.com",
    channels: GUARDIAN_CHANNELS,
    cefrRange: "B2 - C1",
    readingStyle: "Văn phong học thuật sắc sảo, từ vựng phong phú đa tầng",
    coverImage: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "theconversation",
    name: "The Conversation",
    shortName: "The Conversation",
    badge: "Mở CC BY-ND • Học thuật",
    tagline: "Tin tức & Phân tích từ các học giả, giáo sư đại học hàng đầu",
    description: "Chuyên trang báo chí học thuật mở hàng đầu thế giới. Bài viết được biên soạn bởi các chuyên gia, giáo sư đại học danh tiếng nhưng với ngôn ngữ đại chúng dễ hiểu, lý tưởng để nâng tầm tư duy và luyện IELTS Reading band 7.0+.",
    logoText: "TC",
    badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60",
    gradient: "from-rose-800 via-red-700 to-slate-900",
    rssUrl: "https://theconversation.com/articles.atom",
    websiteUrl: "https://theconversation.com",
    channels: THE_CONVERSATION_CHANNELS,
    cefrRange: "B2 - C1",
    readingStyle: "Phân tích học thuật chuyên sâu, luận giải khoa học & xã hội",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "propublica",
    name: "ProPublica",
    shortName: "ProPublica",
    badge: "Điều tra Pulitzer • Mở CC",
    tagline: "Báo chí điều tra phi lợi nhuận độc lập đoạt giải Pulitzer",
    description: "Cơ quan báo chí điều tra hàng đầu nước Mỹ. Những phóng sự công phu vạch trần bất công, bảo vệ quyền lợi con người với lối hành văn điều tra sắc bén, lập luận chặt chẽ và cứ liệu xác thực.",
    logoText: "PP",
    badgeColor: "bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60",
    gradient: "from-yellow-700 via-amber-600 to-stone-900",
    rssUrl: "https://www.propublica.org/feeds/propublica/main",
    websiteUrl: "https://www.propublica.org",
    channels: PROPUBLICA_CHANNELS,
    cefrRange: "B2 - C1",
    readingStyle: "Phóng sự điều tra xã hội, dữ liệu và lập luận sắc bén",
    coverImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "wikinews",
    name: "Wikinews",
    shortName: "Wikinews",
    badge: "Bản quyền CC BY • Trung lập",
    tagline: "Tin tức tự do đa chiều từ tổ chức Wikimedia Foundation",
    description: "Dự án tin tức mở toàn cầu cùng thuộc tổ chức Wikimedia với Wikipedia. Tin tức khách quan, đa chiều do cộng đồng phóng viên độc lập khắp nơi viết và kiểm chứng, câu từ chuẩn mực và trung lập.",
    logoText: "WN",
    badgeColor: "bg-slate-600/15 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800",
    gradient: "from-slate-700 via-gray-600 to-zinc-900",
    rssUrl: "https://en.wikinews.org",
    websiteUrl: "https://en.wikinews.org",
    channels: WIKINEWS_CHANNELS,
    cefrRange: "B1 - B2",
    readingStyle: "Tin tức quốc tế chuẩn mực, ngôn từ trung lập khách quan",
    coverImage: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "npr",
    name: "NPR Stories & Culture",
    shortName: "NPR News",
    badge: "Kể chuyện Mỹ & Đời sống",
    tagline: "Đài phát thanh công cộng Hoa Kỳ - Chuyên sâu câu chuyện con người & văn hóa",
    description: "Phong cách kể chuyện (storytelling) tự nhiên của người Mỹ. Tuyệt vời để học cách trò chuyện, phỏng vấn, từ vựng đời sống và văn hóa đương đại Hoa Kỳ.",
    logoText: "NPR",
    badgeColor: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60",
    gradient: "from-emerald-700 via-teal-600 to-slate-900",
    rssUrl: "https://feeds.npr.org/1001/rss.xml",
    websiteUrl: "https://www.npr.org",
    channels: NPR_CHANNELS,
    cefrRange: "B1 - C1",
    readingStyle: "Phóng sự tự sự, hội thoại và nhân vật đời thực của Mỹ",
    coverImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "gutenberg",
    name: "Truyện Ngắn Kinh Điển",
    shortName: "Truyện Kinh Điển",
    badge: "Public Domain • Văn học",
    tagline: "Tuyển tập kiệt tác truyện ngắn thế giới từ Project Gutenberg & Standard Ebooks",
    description: "Kho tàng văn học kinh điển của O. Henry, Arthur Conan Doyle, Edgar Allan Poe, Kate Chopin... Hoàn toàn thuộc Miền công cộng (Public Domain), lý tưởng để đắm mình vào vẻ đẹp ngôn từ tiếng Anh bất hủ.",
    logoText: "LIT",
    badgeColor: "bg-purple-600/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/60",
    gradient: "from-purple-800 via-indigo-700 to-slate-900",
    rssUrl: "https://www.gutenberg.org",
    websiteUrl: "https://www.gutenberg.org",
    channels: GUTENBERG_CHANNELS,
    cefrRange: "B1 - C1",
    readingStyle: "Văn chương nghệ thuật kinh điển, giàu vốn từ & tu từ",
    coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "hony",
    name: "Humans of New York",
    shortName: "HONY Archive",
    badge: "Kho truyện đời thực",
    tagline: "Kho lưu trữ câu chuyện người thật việc thật từ đường phố New York",
    description: "Dự án nhiếp ảnh và phỏng vấn nổi tiếng thế giới của Brandon Stanton. Mỗi bài viết là một lát cắt cuộc đời đầy cảm xúc, ngôn từ tự nhiên, giàu thành ngữ và cảm xúc chân thật của người bản xứ.",
    logoText: "HONY",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60",
    gradient: "from-amber-600 via-orange-600 to-stone-800",
    rssUrl: "https://humansofnyarchive.com/rss",
    websiteUrl: "https://humansofnyarchive.com",
    channels: HONY_CHANNELS,
    cefrRange: "A2 - B2",
    readingStyle: "Kể chuyện tâm sự, hội thoại đời thường chân thật",
    coverImage: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&auto=format&fit=crop&q=80"
  },
  {
    id: "globalvoices",
    name: "Global Voices",
    shortName: "Global Voices",
    badge: "Mở CC BY 3.0 • Toàn cầu",
    tagline: "Tiếng nói cộng đồng, nhân quyền & văn hóa bản địa khắp các châu lục",
    description: "Cộng đồng phóng viên, dịch giả quốc tế chia sẻ những góc nhìn chân thực về cuộc sống thường nhật, quyền con người và văn hóa bản địa khắp các châu lục theo giấy phép mở Creative Commons CC BY 3.0.",
    logoText: "GV",
    badgeColor: "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900/60",
    gradient: "from-teal-700 via-emerald-600 to-slate-900",
    rssUrl: "https://globalvoices.org/feed/",
    websiteUrl: "https://globalvoices.org",
    channels: GLOBAL_VOICES_CHANNELS,
    cefrRange: "B1 - B2",
    readingStyle: "Phóng sự đời sống, nhân quyền & văn hóa các châu lục",
    coverImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&auto=format&fit=crop&q=80"
  }
];


export const SOURCE_FALLBACK_IMAGES = {
  vnexpress: [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80"
  ],
  bbc: [
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"
  ],
  guardian: [
    "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80"
  ],
  theconversation: [
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80"
  ],
  propublica: [
    "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80"
  ],
  npr: [
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80"
  ],
  wikinews: [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"
  ],
  globalvoices: [
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&auto=format&fit=crop&q=80"
  ]
};

export function extractImageAndText(rawHtml: string): { thumbnail: string; text: string } {
  if (!rawHtml) return { thumbnail: "", text: "" };

  let thumbnail = "";
  // Match all <img ... src="..." tags
  const imgMatches = rawHtml.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
  for (const match of imgMatches) {
    const src = match[1];
    if (
      src &&
      src !== "undefined" &&
      !src.includes("npr-rss-pixel") &&
      !src.includes("pixel.wp.com") &&
      !src.includes("1x1") &&
      (src.startsWith("http://") || src.startsWith("https://"))
    ) {
      thumbnail = src;
      break;
    }
  }

  // Strip all HTML tags & br tags
  let text = rawHtml
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return { thumbnail, text };
}

export function estimateCEFR(text: string): {
  cefrLevel: 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  difficultyScore: number;
  wordCount: number;
  readingTimeMinutes: number;
} {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180)); // ~180 wpm average reading speed

  if (wordCount === 0) {
    return { cefrLevel: 'B1', difficultyScore: 2, wordCount: 0, readingTimeMinutes: 1 };
  }

  // Count average word length & complex words (length >= 7)
  const totalLength = words.reduce((acc, w) => acc + w.length, 0);
  const avgWordLength = totalLength / wordCount;
  const complexWords = words.filter(w => w.length >= 7).length;
  const complexWordRatio = complexWords / wordCount;

  // Estimate CEFR
  let cefrLevel: 'A2' | 'B1' | 'B2' | 'C1' | 'C2' = 'B1';
  let difficultyScore = 2;

  if (avgWordLength > 5.8 || complexWordRatio > 0.28) {
    cefrLevel = 'C1';
    difficultyScore = 4;
  } else if (avgWordLength > 5.2 || complexWordRatio > 0.20) {
    cefrLevel = 'B2';
    difficultyScore = 3;
  } else if (avgWordLength < 4.4 && complexWordRatio < 0.12) {
    cefrLevel = 'A2';
    difficultyScore = 1;
  } else {
    cefrLevel = 'B1';
    difficultyScore = 2;
  }

  return { cefrLevel, difficultyScore, wordCount, readingTimeMinutes };
}

// -------------------------------------------------------------
// Feed Parsers
// -------------------------------------------------------------

// 1. BBC News Feed
export async function fetchBbcFeed(channelId: string = "bbc-world"): Promise<NewsItem[]> {
  const channel = BBC_CHANNELS.find(c => c.id === channelId) || BBC_CHANNELS[0];
  try {
    const res = await fetch(channel.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      },
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];

    const xmlData = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata" });
    const parsed = parser.parse(xmlData);
    const items = parsed?.rss?.channel?.item;
    if (!items) return [];

    const rawList = Array.isArray(items) ? items : [items];
    return rawList.map((item: any, idx: number) => {
      const title = item.title?.__cdata || item.title || "BBC News";
      const link = item.link?.__cdata || item.link || "";
      const guid = item.guid?.__cdata || item.guid?.["#text"] || item.guid || `bbc-${idx}`;
      const pubDate = item.pubDate || new Date().toISOString();
      const rawDesc = item.description?.__cdata || item.description || "";
      const rawContent = item["content:encoded"]?.__cdata || item["content:encoded"] || "";
      const { thumbnail: contentThumb, text } = extractImageAndText(rawContent || rawDesc);

      let thumbnail = item["media:thumbnail"]?.["@_url"] || item["media:content"]?.["@_url"] || item.enclosure?.["@_url"] || contentThumb;
      if (!thumbnail) {
        thumbnail = SOURCE_FALLBACK_IMAGES.bbc[idx % SOURCE_FALLBACK_IMAGES.bbc.length];
      }

      const metrics = estimateCEFR(title + " " + text);

      return {
        id: guid || `bbc-${idx}`,
        title,
        link,
        guid,
        pubDate,
        description: text || title,
        rawDescription: rawDesc,
        thumbnail,
        category: channel.vietnameseName || channel.name,
        channelId: channel.id,
        sourceId: "bbc",
        sourceName: "BBC News World",
        readingTimeMinutes: metrics.readingTimeMinutes,
        wordCount: metrics.wordCount,
        cefrLevel: metrics.cefrLevel,
        difficultyScore: metrics.difficultyScore
      };
    });
  } catch (e) {
    console.error("fetchBbcFeed error:", e);
    return [];
  }
}

// 2. The Guardian Feed
export async function fetchGuardianFeed(channelId: string = "guardian-world"): Promise<NewsItem[]> {
  const channel = GUARDIAN_CHANNELS.find(c => c.id === channelId) || GUARDIAN_CHANNELS[0];
  try {
    const res = await fetch(channel.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      },
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];

    const xmlData = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata" });
    const parsed = parser.parse(xmlData);
    const items = parsed?.rss?.channel?.item;
    if (!items) return [];

    const rawList = Array.isArray(items) ? items : [items];
    return rawList.map((item: any, idx: number) => {
      const title = item.title?.__cdata || item.title || "The Guardian News";
      const link = item.link?.__cdata || item.link || "";
      const guid = item.guid?.__cdata || item.guid || `guardian-${idx}`;
      const pubDate = item.pubDate || new Date().toISOString();
      const rawDesc = item.description?.__cdata || item.description || "";
      const rawContent = item["content:encoded"]?.__cdata || item["content:encoded"] || "";
      const { thumbnail: descThumb, text } = extractImageAndText(rawContent || rawDesc);

      let thumbnail = descThumb;
      if (!thumbnail && item["media:content"]) {
        const mc = Array.isArray(item["media:content"]) ? item["media:content"] : [item["media:content"]];
        const largest = mc[mc.length - 1];
        if (largest?.["@_url"]) thumbnail = largest["@_url"];
      }
      if (!thumbnail) {
        thumbnail = SOURCE_FALLBACK_IMAGES.guardian[idx % SOURCE_FALLBACK_IMAGES.guardian.length];
      }

      const metrics = estimateCEFR(title + " " + text);

      return {
        id: guid || `guardian-${idx}`,
        title,
        link,
        guid,
        pubDate,
        description: text || title,
        rawDescription: rawDesc,
        thumbnail,
        category: channel.vietnameseName || channel.name,
        channelId: channel.id,
        sourceId: "guardian",
        sourceName: "The Guardian",
        readingTimeMinutes: metrics.readingTimeMinutes,
        wordCount: metrics.wordCount,
        cefrLevel: metrics.cefrLevel,
        difficultyScore: metrics.difficultyScore
      };
    });
  } catch (e) {
    console.error("fetchGuardianFeed error:", e);
    return [];
  }
}


// 3. NPR Stories Feed (Aggregates multiple topic feeds: News, Arts & Life, Science, Books)
export async function fetchNprFeed(channelId: string = "npr-all"): Promise<NewsItem[]> {
  const feedsToFetch: { url: string; category: string; chId: string }[] = [];

  if (channelId === "npr-news") {
    feedsToFetch.push({ url: "https://feeds.npr.org/1001/rss.xml", category: "Thời Sự & Xã Hội", chId: "npr-news" });
  } else if (channelId === "npr-arts") {
    feedsToFetch.push({ url: "https://feeds.npr.org/1008/rss.xml", category: "Văn Hóa & Đời Sống", chId: "npr-arts" });
  } else if (channelId === "npr-science") {
    feedsToFetch.push({ url: "https://feeds.npr.org/1007/rss.xml", category: "Khoa Học & Sức Khỏe", chId: "npr-science" });
  } else if (channelId === "npr-books") {
    feedsToFetch.push({ url: "https://feeds.npr.org/1057/rss.xml", category: "Sách & Câu Chuyện", chId: "npr-books" });
  } else {
    // Default: npr-all - Fetch all 4 feeds to provide 35-40 rich stories!
    feedsToFetch.push(
      { url: "https://feeds.npr.org/1001/rss.xml", category: "Thời Sự & Xã Hội", chId: "npr-news" },
      { url: "https://feeds.npr.org/1008/rss.xml", category: "Văn Hóa & Đời Sống", chId: "npr-arts" },
      { url: "https://feeds.npr.org/1007/rss.xml", category: "Khoa Học & Sức Khỏe", chId: "npr-science" },
      { url: "https://feeds.npr.org/1057/rss.xml", category: "Sách & Câu Chuyện", chId: "npr-books" }
    );
  }

  try {
    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata" });
    const results = await Promise.allSettled(
      feedsToFetch.map(async (f) => {
        const res = await fetch(f.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, */*"
          },
          next: { revalidate: 300 }
        });
        if (!res.ok) return [];
        const xmlData = await res.text();
        const parsed = parser.parse(xmlData);
        const rawItems = parsed?.rss?.channel?.item || [];
        const itemsList = Array.isArray(rawItems) ? rawItems : [rawItems];
        return itemsList.map((it: any) => ({ ...it, __cat: f.category, __chId: f.chId }));
      })
    );

    const seen = new Set<string>();
    const allItems: any[] = [];
    results.forEach((r) => {
      if (r.status === "fulfilled") {
        r.value.forEach((it: any) => {
          const key = it.guid?.__cdata || it.guid || it.link?.__cdata || it.link;
          if (key && !seen.has(key)) {
            seen.add(key);
            allItems.push(it);
          }
        });
      }
    });

    return allItems.map((item: any, idx: number) => {
      const title = item.title?.__cdata || item.title || "NPR Story";
      const link = item.link?.__cdata || item.link || "";
      const guid = item.guid?.__cdata || item.guid || `npr-${idx}`;
      const pubDate = item.pubDate || new Date().toISOString();
      const rawDesc = item.description?.__cdata || item.description || "";
      const rawContent = item["content:encoded"]?.__cdata || item["content:encoded"] || "";
      const { thumbnail: contentThumb, text } = extractImageAndText(rawContent || rawDesc);

      let thumbnail = contentThumb || item["media:thumbnail"]?.["@_url"] || item["media:content"]?.["@_url"] || item.enclosure?.["@_url"] || "";
      if (!thumbnail) {
        thumbnail = SOURCE_FALLBACK_IMAGES.npr[idx % SOURCE_FALLBACK_IMAGES.npr.length];
      }

      const metrics = estimateCEFR(title + " " + text);

      return {
        id: guid || `npr-${idx}`,
        title,
        link,
        guid,
        pubDate,
        description: text || title,
        rawDescription: rawDesc,
        thumbnail,
        category: item.__cat || "NPR Stories",
        channelId: item.__chId || "npr-news",
        sourceId: "npr",
        sourceName: "NPR Stories & Culture",
        readingTimeMinutes: metrics.readingTimeMinutes,
        wordCount: metrics.wordCount,
        cefrLevel: metrics.cefrLevel,
        difficultyScore: metrics.difficultyScore
      };
    });
  } catch (e) {
    console.error("fetchNprFeed error:", e);
    return [];
  }
}

// 4. Humans of New York Feed (Full 8,289 stories archive API + RSS fallback)
export async function fetchHonyFeed(offset: number = 0): Promise<NewsItem[]> {
  try {
    const res = await fetch(`https://humansofnyarchive.com/api/read/json?num=30&start=${offset}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json, text/javascript, */*"
      },
      next: { revalidate: 300 }
    });
    if (res.ok) {
      const raw = await res.text();
      const jsonStr = raw.replace(/^var tumblr_api_read =\s*/, "").replace(/;\s*$/, "");
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.posts) && data.posts.length > 0) {
        return data.posts.map((post: any, idx: number) => {
          const rawCaption = post["photo-caption"] || post["regular-body"] || "";
          const thumbnail = post["photo-url-1280"] || post["photo-url-500"] || "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop&q=80";
          const text = rawCaption
            .replace(/<[^>]*>?/gm, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&ldquo;|&rdquo;/g, '"')
            .replace(/&rsquo;/g, "'")
            .replace(/\s+/g, " ")
            .trim();

          const firstSentence = text.split(/[.!?]+/)[0] || "A Story from New York";
          let cleanTitle = firstSentence.slice(0, 85).trim();
          if (cleanTitle && !cleanTitle.endsWith("...")) {
            cleanTitle += "...";
          }
          if (!cleanTitle.startsWith('"') && !cleanTitle.startsWith('“')) {
            cleanTitle = `"${cleanTitle}`;
          }

          const metrics = estimateCEFR(cleanTitle + " " + text);
          const link = post["url-with-slug"] || post.url || `https://humansofnyarchive.com/post/${post.id}`;

          return {
            id: String(post.id),
            title: cleanTitle,
            link,
            guid: String(post.id),
            pubDate: post.date || new Date().toISOString(),
            description: text,
            rawDescription: rawCaption,
            thumbnail,
            category: "Humans of NY",
            channelId: "hony-all",
            sourceId: "hony",
            sourceName: "Humans of New York",
            readingTimeMinutes: metrics.readingTimeMinutes,
            wordCount: metrics.wordCount,
            cefrLevel: metrics.cefrLevel,
            difficultyScore: metrics.difficultyScore
          };
        });
      }
    }
  } catch (apiErr) {
    console.warn("HONY JSON API failed, falling back to RSS:", apiErr);
  }

  // Fallback to RSS feed
  try {
    const res = await fetch("https://humansofnyarchive.com/rss", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      },
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];

    const xmlData = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata" });
    const parsed = parser.parse(xmlData);
    const items = parsed?.rss?.channel?.item;
    if (!items) return [];

    const rawList = Array.isArray(items) ? items : [items];
    return rawList.map((item: any, idx: number) => {
      const rawTitle = item.title?.__cdata || item.title || "";
      const link = item.link?.__cdata || item.link || "";
      const guid = item.guid?.__cdata || item.guid || link || `hony-${idx}`;
      const pubDate = item.pubDate || new Date().toISOString();
      const rawDesc = item.description?.__cdata || item.description || "";
      const { thumbnail, text } = extractImageAndText(rawDesc);

      let cleanTitle = rawTitle.replace(/^“/, '"').replace(/”$/, '"').trim();
      if (!cleanTitle || cleanTitle.length < 5) {
        const firstSentence = text.split(/[.!?]+/)[0] || "Story from New York";
        cleanTitle = firstSentence.slice(0, 80) + (firstSentence.length > 80 ? "..." : "");
      }

      const metrics = estimateCEFR(cleanTitle + " " + text);

      return {
        id: guid || `hony-${idx}`,
        title: cleanTitle,
        link,
        guid,
        pubDate,
        description: text,
        rawDescription: rawDesc,
        thumbnail: thumbnail || "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&auto=format&fit=crop&q=80",
        category: "Humans of NY",
        channelId: "hony-all",
        sourceId: "hony",
        sourceName: "Humans of New York",
        readingTimeMinutes: metrics.readingTimeMinutes,
        wordCount: metrics.wordCount,
        cefrLevel: metrics.cefrLevel,
        difficultyScore: metrics.difficultyScore
      };
    });
  } catch (error) {
    console.error("Error fetching HONY RSS feed fallback:", error);
    return [];
  }
}

// 5. VnExpress Feed
export async function fetchVnExpressFeed(channelId: string = "home"): Promise<NewsItem[]> {
  const channel = RSS_CHANNELS.find(c => c.id === channelId) || RSS_CHANNELS[0];

  try {
    const res = await fetch(channel.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      },
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];

    const xmlData = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata" });
    const parsed = parser.parse(xmlData);
    const items = parsed?.rss?.channel?.item;
    if (!items) return [];

    const rawList = Array.isArray(items) ? items : [items];
    return rawList.map((item: any, idx: number) => {
      const title = item.title?.__cdata || item.title || "Untitled";
      const link = item.link?.__cdata || item.link || "";
      const guid = item.guid?.__cdata || item.guid || link || `news-${idx}`;
      const pubDate = item.pubDate || new Date().toISOString();
      const rawDesc = item.description?.__cdata || item.description || "";
      const rawContent = item["content:encoded"]?.__cdata || item["content:encoded"] || "";
      const { thumbnail, text } = extractImageAndText(rawContent || rawDesc);
      
      const metrics = estimateCEFR(title + " " + text);

      let category = channel.name;
      if (link.includes("/business/")) category = "Business";
      else if (link.includes("/tech/")) category = "Tech";
      else if (link.includes("/travel/")) category = "Travel";
      else if (link.includes("/life/")) category = "Life";
      else if (link.includes("/world/")) category = "World";
      else if (link.includes("/sports/")) category = "Sports";
      else if (link.includes("/perspectives/")) category = "Perspectives";

      return {
        id: guid || `art-${idx}`,
        title,
        link,
        guid,
        pubDate,
        description: text,
        rawDescription: rawDesc,
        thumbnail: thumbnail || SOURCE_FALLBACK_IMAGES.vnexpress[idx % SOURCE_FALLBACK_IMAGES.vnexpress.length],
        category,
        channelId: channel.id,
        sourceId: "vnexpress",
        sourceName: "VnExpress International",
        readingTimeMinutes: metrics.readingTimeMinutes,
        wordCount: metrics.wordCount,
        cefrLevel: metrics.cefrLevel,
        difficultyScore: metrics.difficultyScore
      };
    });
  } catch (error) {
    console.error(`Error fetching RSS feed for ${channelId}:`, error);
    return [];
  }
}

// 6. The Conversation Feed (Atom feed with rich academic & research articles)
export async function fetchTheConversationFeed(channelId: string = "theconversation-all"): Promise<NewsItem[]> {
  const channel = THE_CONVERSATION_CHANNELS.find(c => c.id === channelId) || THE_CONVERSATION_CHANNELS[0];
  try {
    const res = await fetch(channel.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/atom+xml, application/xml, text/xml, */*"
      },
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];

    const xmlData = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata" });
    const parsed = parser.parse(xmlData);
    const rawEntries = parsed?.feed?.entry || [];
    const entries = Array.isArray(rawEntries) ? rawEntries : [rawEntries];

    return entries.map((entry: any, idx: number) => {
      const title = entry.title?.__cdata || entry.title || "The Conversation Article";

      let link = "";
      if (typeof entry.link === "string") {
        link = entry.link;
      } else if (Array.isArray(entry.link)) {
        const alt = entry.link.find((l: any) => l["@_rel"] === "alternate");
        link = alt?.["@_href"] || entry.link[0]?.["@_href"] || "";
      } else if (entry.link?.["@_href"]) {
        link = entry.link["@_href"];
      }

      const guid = entry.id?.__cdata || entry.id || link || `theconversation-${idx}`;
      const pubDate = entry.published || entry.updated || new Date().toISOString();
      const contentHtml = entry.content?.["#text"] || entry.content || entry.summary?.["#text"] || entry.summary || "";
      const { thumbnail: extractedThumb, text } = extractImageAndText(contentHtml);

      let thumbnail = extractedThumb;
      if (!thumbnail) {
        thumbnail = SOURCE_FALLBACK_IMAGES.theconversation[idx % SOURCE_FALLBACK_IMAGES.theconversation.length];
      }

      const metrics = estimateCEFR(title + " " + text);

      return {
        id: guid || `theconversation-${idx}`,
        title,
        link,
        guid,
        pubDate,
        description: text || title,
        rawDescription: contentHtml,
        thumbnail,
        category: channel.vietnameseName || channel.name,
        channelId: channel.id,
        sourceId: "theconversation",
        sourceName: "The Conversation",
        readingTimeMinutes: metrics.readingTimeMinutes,
        wordCount: metrics.wordCount,
        cefrLevel: metrics.cefrLevel,
        difficultyScore: metrics.difficultyScore
      };
    });
  } catch (e) {
    console.error("fetchTheConversationFeed error:", e);
    return [];
  }
}

// 7. ProPublica Investigative Feed
export async function fetchProPublicaFeed(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://www.propublica.org/feeds/propublica/main", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      },
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];

    const xmlData = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, cdataPropName: "__cdata" });
    const parsed = parser.parse(xmlData);
    const items = parsed?.rss?.channel?.item;
    if (!items) return [];

    const rawList = Array.isArray(items) ? items : [items];
    return rawList.map((item: any, idx: number) => {
      const title = item.title?.__cdata || item.title || "ProPublica Investigation";
      const link = item.link?.__cdata || item.link || "";
      const guid = item.guid?.__cdata || item.guid?.["#text"] || item.guid || `propublica-${idx}`;
      const pubDate = item.pubDate || new Date().toISOString();
      const rawDesc = item.description?.__cdata || item.description || "";
      const rawContent = item["content:encoded"]?.__cdata || item["content:encoded"] || "";
      const { thumbnail: descThumb, text } = extractImageAndText(rawContent || rawDesc);

      let thumbnail = descThumb || item["media:content"]?.["@_url"] || item.enclosure?.["@_url"] || "";
      if (!thumbnail) {
        thumbnail = SOURCE_FALLBACK_IMAGES.propublica[idx % SOURCE_FALLBACK_IMAGES.propublica.length];
      }

      const metrics = estimateCEFR(title + " " + text);

      return {
        id: guid || `propublica-${idx}`,
        title,
        link,
        guid,
        pubDate,
        description: text || title,
        rawDescription: rawDesc,
        thumbnail,
        category: "Phóng Sự Điều Tra",
        channelId: "propublica-all",
        sourceId: "propublica",
        sourceName: "ProPublica",
        readingTimeMinutes: metrics.readingTimeMinutes,
        wordCount: metrics.wordCount,
        cefrLevel: metrics.cefrLevel,
        difficultyScore: metrics.difficultyScore
      };
    });
  } catch (e) {
    console.error("fetchProPublicaFeed error:", e);
    return [];
  }
}

// 8. Wikinews Open Feed (Wikimedia Foundation API)
export async function fetchWikinewsFeed(channelId: string = "wikinews-all"): Promise<NewsItem[]> {
  const channel = WIKINEWS_CHANNELS.find(c => c.id === channelId) || WIKINEWS_CHANNELS[0];
  const cmTitle = channel.url.startsWith("Category:") ? channel.url : "Category:Published";

  try {
    const res = await fetch(`https://en.wikinews.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(cmTitle)}&cmlimit=25&format=json&cmsort=timestamp&cmdir=desc`, {
      headers: {
        "User-Agent": "VnEReader/1.0 (studyenglish@vnexpress.reader)"
      },
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];

    const data = await res.json();
    const members = data?.query?.categorymembers || [];

    return members.map((member: any, idx: number) => {
      const pageTitle = member.title || "Wikinews Story";
      const link = `https://en.wikinews.org/wiki/${encodeURIComponent(pageTitle.replace(/\s+/g, "_"))}`;
      const metrics = estimateCEFR(pageTitle);

      return {
        id: `wikinews-${member.pageid || idx}`,
        title: pageTitle,
        link,
        guid: `wikinews-${member.pageid || idx}`,
        pubDate: new Date(Date.now() - idx * 3600000).toISOString(),
        description: `Bản tin thời sự quốc tế từ cộng đồng phóng viên Wikimedia: ${pageTitle}`,
        rawDescription: pageTitle,
        thumbnail: [
          "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"
        ][idx % 6],
        category: `Wikinews • ${channel.name}`,
        channelId: channel.id,
        sourceId: "wikinews",
        sourceName: "Wikinews",
        readingTimeMinutes: metrics.readingTimeMinutes,
        wordCount: metrics.wordCount,
        cefrLevel: metrics.cefrLevel,
        difficultyScore: metrics.difficultyScore
      };
    });
  } catch (e) {
    console.error("fetchWikinewsFeed error:", e);
    return [];
  }
}

// 9. Gutenberg Classic Stories Feed (Public Domain Masterpieces)
export async function fetchGutenbergFeed(channelId: string = "gutenberg-all"): Promise<NewsItem[]> {
  const items = getClassicStoryNewsItems();
  if (channelId === "gutenberg-ohenry") {
    return items.filter(it => it.title.includes("O. Henry"));
  }
  if (channelId === "gutenberg-doyle") {
    return items.filter(it => it.title.includes("Arthur Conan Doyle"));
  }
  if (channelId === "gutenberg-poe") {
    return items.filter(it => it.title.includes("Edgar Allan Poe"));
  }
  if (channelId === "gutenberg-chopin") {
    return items.filter(it => it.title.includes("Kate Chopin"));
  }
  return items;
}

// 10. Global Voices Feed (CC BY 3.0 Open Journalism)
export async function fetchGlobalVoicesFeed(channelId: string = "globalvoices-all"): Promise<NewsItem[]> {
  try {
    const channel = GLOBAL_VOICES_CHANNELS.find(c => c.id === channelId) || GLOBAL_VOICES_CHANNELS[0];
    const baseUrl = channel.url.replace(/\/?$/, "/");
    const page1Url = baseUrl;
    const page2Url = `${baseUrl}?paged=2`;

    const fetchXml = async (url: string) => {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, */*"
          },
          next: { revalidate: 60 }
        });
        if (res.ok) return await res.text();
      } catch (e) {
        console.error("fetchXml error:", url, e);
      }
      return null;
    };

    const [xml1, xml2] = await Promise.all([fetchXml(page1Url), fetchXml(page2Url)]);
    const parser = new XMLParser({
      ignoreAttributes: false,
      cdataPropName: "__cdata"
    });

    const parseItems = (xml: string | null) => {
      if (!xml) return [];
      try {
        const parsed = parser.parse(xml);
        const raw = parsed?.rss?.channel?.item || [];
        return Array.isArray(raw) ? raw : [raw];
      } catch {
        return [];
      }
    };

    const allRawItems = [...parseItems(xml1), ...parseItems(xml2)];
    const seenLinks = new Set<string>();
    const uniqueRawItems = allRawItems.filter((it: any) => {
      const link = it.link?.__cdata || it.link || "";
      if (!link || seenLinks.has(link)) return false;
      seenLinks.add(link);
      return true;
    });

    return uniqueRawItems.map((item: any, idx: number) => {
      const title = item.title?.__cdata || item.title || "";
      const link = item.link?.__cdata || item.link || "";
      const guid = item.guid?.__cdata || item.guid || link;
      const pubDate = item.pubDate?.__cdata || item.pubDate || new Date().toISOString();

      let rawDesc = item.description?.__cdata || item.description || "";
      const contentEncoded = item["content:encoded"]?.__cdata || item["content:encoded"] || "";

      // Extract thumbnail
      let thumbnail = "";
      if (item["media:content"] && item["media:content"]["@_url"]) {
        thumbnail = item["media:content"]["@_url"];
      }
      if (!thumbnail) {
        const { thumbnail: descThumb } = extractImageAndText(contentEncoded || rawDesc);
        thumbnail = descThumb;
      }
      if (!thumbnail) {
        thumbnail = SOURCE_FALLBACK_IMAGES.globalvoices[idx % SOURCE_FALLBACK_IMAGES.globalvoices.length];
      }

      const { text: cleanDescription } = extractImageAndText(rawDesc);
      const { cefrLevel, difficultyScore, wordCount, readingTimeMinutes } = estimateCEFR(
        `${title}. ${cleanDescription}`
      );

      return {
        id: guid || link,
        title: title.trim(),
        link,
        guid,
        pubDate,
        description: cleanDescription || title,
        rawDescription: rawDesc,
        thumbnail,
        category: `Global Voices • ${channel.name}`,
        channelId: channel.id,
        sourceId: "globalvoices",
        sourceName: "Global Voices",
        readingTimeMinutes,
        wordCount,
        cefrLevel,
        difficultyScore
      };
    });
  } catch (error) {
    console.error("Error fetching Global Voices RSS:", error);
    return [];
  }
}

// Unified RSS Fetcher by Source & Channel
export async function fetchRssFeed(channelId: string = "home", sourceId?: string): Promise<NewsItem[]> {
  if (sourceId === "bbc" || channelId.startsWith("bbc")) return fetchBbcFeed(channelId);
  if (sourceId === "guardian" || channelId.startsWith("guardian")) return fetchGuardianFeed(channelId);
  if (sourceId === "npr" || channelId.startsWith("npr")) return fetchNprFeed(channelId);
  if (sourceId === "theconversation" || channelId.startsWith("theconversation")) return fetchTheConversationFeed(channelId);
  if (sourceId === "propublica" || channelId.startsWith("propublica")) return fetchProPublicaFeed();
  if (sourceId === "wikinews" || channelId.startsWith("wikinews")) return fetchWikinewsFeed(channelId);
  if (sourceId === "gutenberg" || channelId.startsWith("gutenberg")) return fetchGutenbergFeed(channelId);
  if (sourceId === "globalvoices" || channelId.startsWith("globalvoices")) return fetchGlobalVoicesFeed(channelId);
  if (sourceId === "hony" || channelId === "hony" || channelId === "hony-all") return fetchHonyFeed();
  return fetchVnExpressFeed(channelId);
}

// Unified Multi-Source Aggregator (All 10 Sources interleaved)
export async function fetchAllSourcesLatest(): Promise<{
  vnexpress: NewsItem[];
  bbc: NewsItem[];
  guardian: NewsItem[];
  theconversation: NewsItem[];
  propublica: NewsItem[];
  wikinews: NewsItem[];
  npr: NewsItem[];
  gutenberg: NewsItem[];
  globalvoices: NewsItem[];
  hony: NewsItem[];
  combined: NewsItem[];
}> {
  const [vneRes, bbcRes, guardianRes, tcRes, ppRes, wnRes, nprRes, gutenRes, gvRes, honyRes] = await Promise.allSettled([
    fetchVnExpressFeed("home"),
    fetchBbcFeed(),
    fetchGuardianFeed(),
    fetchTheConversationFeed(),
    fetchProPublicaFeed(),
    fetchWikinewsFeed(),
    fetchNprFeed(),
    fetchGutenbergFeed(),
    fetchGlobalVoicesFeed(),
    fetchHonyFeed()
  ]);

  const vnexpress = vneRes.status === "fulfilled" ? vneRes.value : [];
  const bbc = bbcRes.status === "fulfilled" ? bbcRes.value : [];
  const guardian = guardianRes.status === "fulfilled" ? guardianRes.value : [];
  const theconversation = tcRes.status === "fulfilled" ? tcRes.value : [];
  const propublica = ppRes.status === "fulfilled" ? ppRes.value : [];
  const wikinews = wnRes.status === "fulfilled" ? wnRes.value : [];
  const npr = nprRes.status === "fulfilled" ? nprRes.value : [];
  const gutenberg = gutenRes.status === "fulfilled" ? gutenRes.value : [];
  const globalvoices = gvRes.status === "fulfilled" ? gvRes.value : [];
  const hony = honyRes.status === "fulfilled" ? honyRes.value : [];

  // Round-robin interleaved merge so the front feed displays a rich diversity of newspapers
  const sourcesLists = [
    vnexpress,
    bbc,
    guardian,
    theconversation,
    globalvoices,
    npr,
    propublica,
    hony,
    wikinews,
    gutenberg
  ].filter(list => list && list.length > 0);

  const combined: NewsItem[] = [];
  const maxLen = Math.max(...sourcesLists.map(l => l.length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (const list of sourcesLists) {
      if (i < list.length) {
        combined.push(list[i]);
      }
    }
  }

  return { vnexpress, bbc, guardian, theconversation, propublica, wikinews, npr, gutenberg, globalvoices, hony, combined };
}

export function getArticleSlug(articleUrl: string): string {
  try {
    const u = new URL(articleUrl);
    if (u.hostname.includes("humansofnyarchive")) {
      const match = u.pathname.match(/\/post\/(\d+)/);
      return match ? `hony/${match[1]}` : `hony/${encodeURIComponent(u.pathname.replace(/^\//, ""))}`;
    }
    if (u.hostname.includes("theguardian.com")) {
      return `guardian/${encodeURIComponent(u.pathname.replace(/^\//, ""))}`;
    }
    if (u.hostname.includes("theconversation.com")) {
      return `theconversation/${encodeURIComponent(u.pathname.replace(/^\//, ""))}`;
    }
    if (u.hostname.includes("propublica.org")) {
      return `propublica/${encodeURIComponent(u.pathname.replace(/^\//, ""))}`;
    }
    if (u.hostname.includes("wikinews.org")) {
      const rawTitle = u.pathname.replace(/^\/wiki\//, "").replace(/^\//, "");
      return `wikinews/${encodeURIComponent(rawTitle)}`;
    }
    if (u.hostname.includes("gutenberg.org")) {
      const cleanSlug = u.pathname.replace(/^\//, "").replace(/^ebooks\//, "");
      return `gutenberg/${encodeURIComponent(cleanSlug)}`;
    }
    if (u.hostname.includes("globalvoices.org")) {
      return `globalvoices/${encodeURIComponent(u.pathname.replace(/^\//, ""))}`;
    }
    if (u.hostname.includes("npr.org")) {
      return `npr/${encodeURIComponent(u.pathname.replace(/^\//, ""))}`;
    }
    if (u.hostname.includes("bbc.co.uk") || u.hostname.includes("bbc.com")) {
      return `bbc/${encodeURIComponent(u.pathname.replace(/^\//, ""))}`;
    }
    return u.pathname.replace(/^\//, "").replace(/\.html$/, "");
  } catch {
    return encodeURIComponent(articleUrl);
  }
}

export function reconstructArticleUrl(slug: string[] | string): string {
  const parts = Array.isArray(slug) ? slug : slug.split("/");
  const prefix = parts[0];
  const rest = parts.slice(1).join("/");

  if (prefix === "hony") {
    return `https://humansofnyarchive.com/post/${rest}`;
  }
  if (prefix === "guardian") {
    return `https://www.theguardian.com/${decodeURIComponent(rest)}`;
  }
  if (prefix === "theconversation") {
    return `https://theconversation.com/${decodeURIComponent(rest)}`;
  }
  if (prefix === "propublica") {
    return `https://www.propublica.org/${decodeURIComponent(rest)}`;
  }
  if (prefix === "wikinews") {
    return `https://en.wikinews.org/wiki/${decodeURIComponent(rest)}`;
  }
  if (prefix === "gutenberg") {
    return `https://www.gutenberg.org/ebooks/${decodeURIComponent(rest)}`;
  }
  if (prefix === "globalvoices") {
    return `https://globalvoices.org/${decodeURIComponent(rest)}`;
  }
  if (prefix === "npr") {
    return `https://www.npr.org/${decodeURIComponent(rest)}`;
  }
  if (prefix === "bbc") {
    return `https://www.bbc.com/${decodeURIComponent(rest)}`;
  }
  const clean = parts.join("/").replace(/\.html$/, "") + ".html";
  return `https://e.vnexpress.net/${clean}`;
}

