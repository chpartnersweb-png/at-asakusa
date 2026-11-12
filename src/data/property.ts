export const links = {
  firstFloor: 'https://www.airbnb.com/slink/9mBLsZDw',
  middleFloors: 'https://www.airbnb.com/slink/euzgUV22',
  upperFloors: 'https://www.airbnb.com/slink/xMPBloQ1',
  booking: 'https://www.booking.com/Share-I8DnDU',
  instagram: 'https://www.instagram.com/ray_minpaku',
  line: 'https://line.me/R/ti/p/@885ucpco',
  map: 'https://maps.app.goo.gl/p2prEVdT3JrmxAoN9',
};

export const navigation = [
  { href: '#about', en: 'About', ja: 'AT ASAKUSAについて' },
  { href: '#rooms', en: 'Rooms', ja: 'お部屋' },
  { href: '#amenities', en: 'Everyday comfort', ja: '設備と過ごし方' },
  { href: '#access', en: 'Neighborhood', ja: '周辺・アクセス' },
  { href: '#guide', en: 'Stay guide', ja: 'ご利用案内' },
];

export const floors = [
  { number: '01', floor: '1F', title: 'テラスのあるお部屋', description: 'プライベートテラス付き', note: 'テラスでのBBQはご利用いただけません。', href: links.firstFloor },
  { number: '02', floor: '2–3F', title: 'バルコニーのあるお部屋', description: '2階・3階／階段でのアクセス', note: 'エレベーターはありません。', href: links.middleFloors },
  { number: '03', floor: '4–5F', title: '上階のバルコニー付きのお部屋', description: '4階・5階／階段でのアクセス', note: 'エレベーターはありません。', href: links.upperFloors },
];

export const amenities = [
  { icon: 'wifi', name: '無料Wi-Fi' },
  { icon: 'kitchen', name: 'フルキッチン' },
  { icon: 'laundry', name: '洗濯機' },
  { icon: 'desk', name: 'ワークデスク' },
  { icon: 'amenity', name: '無料アメニティ' },
  { icon: 'smoke', name: '全館禁煙' },
  { icon: 'language', name: '英語・中国語・韓国語対応' },
  { icon: 'terrace', name: 'テラス／バルコニー' },
];

export const spots = [
  { name: '浅草寺・雷門・仲見世通り', en: 'Senso-ji & Nakamise', description: '浅草らしい風景と、にぎわいの中へ。', time: '浅草寺まで徒歩 約20分' },
  { name: '東京スカイツリー', en: 'Tokyo Skytree', description: '東京の街を、いつもと違う目線から。', time: 'タクシー 約10〜15分' },
  { name: 'かっぱ橋道具街', en: 'Kappabashi', description: '器や台所道具との出会いも、旅の楽しみに。', time: '周辺のお出かけに' },
  { name: '一葉記念館・浅草富士浅間神社', en: 'History & culture', description: '街の歴史に触れながら、ゆっくり歩く。', time: '周辺のお出かけに' },
  { name: '江戸たいとう伝統工芸館', en: 'Traditional crafts', description: '受け継がれてきた、ものづくりに出会う。', time: '周辺のお出かけに' },
];

export const faqs = [
  { question: 'チェックイン・チェックアウトは何時ですか？', answer: 'チェックインは16:00〜24:00、チェックアウトは10:00です。非対面のスマートチェックインを採用しています。ご不明な点は事前にLINEでお問い合わせください。' },
  { question: '何人まで泊まれますか？', answer: '1室最大6名までご宿泊いただけます。ゆったりお過ごしいただく目安は4名です。全室約30㎡・2ベッドルームのお部屋です。' },
  { question: 'エレベーターはありますか？', answer: 'エレベーターはありません。建物は1〜5階で、上階への移動は階段をご利用いただきます。お荷物やご同行の方に合わせて、予約前に階をご確認ください。' },
  { question: 'お支払い方法を教えてください。', answer: 'Airbnb・Booking.comでのご予約は、各サイトでのオンライン決済です。自社予約ページでは各種クレジットカード（Stripe決済）に対応しています。現地でのお支払いは現金のみです。' },
  { question: '空港送迎はありますか？', answer: '成田空港35,000円、羽田空港25,000円で有料送迎をご案内しています。人数・お荷物・送迎区間などの条件とお申し込みについては、事前にLINEでお問い合わせください。' },
  { question: '駐車場はありますか？', answer: '駐車場はありません。駐輪場はご用意しています。お車でお越しの場合は、周辺の駐車場をご利用ください。' },
  { question: 'テラスでBBQやパーティーはできますか？', answer: 'BBQ・パーティーでのご利用はできません。テラスは1階客室のみ、上階のお部屋にはバルコニーがあります。全館禁煙で、ペットの同伴もご遠慮いただいています。' },
];
