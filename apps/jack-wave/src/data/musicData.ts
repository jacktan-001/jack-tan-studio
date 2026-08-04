/**
 * Jack Wave — 音乐数据
 * 从原 data.js 迁移，转换为 TypeScript
 */

import type { Song, MoodPlaylist, MonthlyShare } from '../types';

/** 每个歌单最多歌曲数 */
export const MAX_SONGS = 10;

/** 歌曲库 — 以 trackId 为 key，去重存储 */
export const songLibrary: Record<string, Song> = {
  '40284751': {
    title: 'I Say a Little Prayer',
    artist: 'Dionne Warwick',
    duration: '3:05',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b1/d1/07/b1d10742-a206-eeba-3cd9-a03d56daedfd/mzaf_15902634116456022902.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/i-say-a-little-prayer/40284747?i=40284751&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f5/7a/87/f57a871e-c9a1-9392-b4ba-81c24c66f97b/dj.vysptksk.jpg/100x100bb.jpg',
    trackId: '40284751',
  },
  '159294551': {
    title: 'Smooth Criminal',
    artist: 'Michael Jackson',
    duration: '4:19',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/7d/84/387d847b-0a17-d7d0-81fa-3d1e2036a0e3/mzaf_1148403634523455455.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/smooth-criminal/159292399?i=159294551&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg',
    trackId: '159294551',
  },
  '159294814': {
    title: 'Black or White',
    artist: 'Michael Jackson',
    duration: '4:17',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/69/01/0c/69010c8e-2ff7-2809-589d-6f304400a359/mzaf_3468624104964279051.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/black-or-white/159292399?i=159294814&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg',
    trackId: '159294814',
  },
  '279647290': {
    title: 'Beautiful',
    artist: 'Christina Aguilera',
    duration: '3:59',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1f/a2/cf/1fa2cfca-5eb6-c361-02fd-665280d57212/mzaf_14355860194011638271.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/beautiful/279647264?i=279647290&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Features115/v4/48/54/c8/4854c8db-36ed-4c5b-3c09-9739b570d93e/dj.gctnwros.jpg/100x100bb.jpg',
    trackId: '279647290',
  },
  '281714129': {
    title: 'A Song for You',
    artist: 'Donny Hathaway',
    duration: '5:26',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/17/4c/17/174c177d-5bc1-d600-3d3e-eb8932610a1a/mzaf_17511037854468461945.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/a-song-for-you/281714087?i=281714129&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/50/f8/64/50f86432-2051-dcb6-c80c-26751db6c88a/mzi.nsvpouqk.jpg/100x100bb.jpg',
    trackId: '281714129',
  },
  '355038523': {
    title: 'Killing Me Softly With His Song',
    artist: 'Roberta Flack',
    duration: '4:47',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9b/eb/00/9beb00a2-fe8a-808d-951e-b0ae09dc2bee/mzaf_15554659559486311039.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/killing-me-softly-with-his-song/355038498?i=355038523&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music/e4/71/97/mzi.mgwzviyu.jpg/100x100bb.jpg',
    trackId: '355038523',
  },
  '551515762': {
    title: 'Dirty Diana (2012 Remaster)',
    artist: 'Michael Jackson',
    duration: '4:41',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ea/db/91/eadb91c1-2016-1c9d-95b8-1409e91ac3f0/mzaf_10205668415538089374.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/dirty-diana-2012-remaster/551515699?i=551515762&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Features124/v4/0b/fb/b5/0bfbb592-e2ce-065a-a098-09f55cee22db/dj.iziroksp.jpg/100x100bb.jpg',
    trackId: '551515762',
  },
  '1071753630': {
    title: '天使心',
    artist: '林俊杰',
    duration: '3:59',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b5/97/6a/b5976a45-af99-fade-50e3-2f9cac2b17eb/mzaf_12806329200591327109.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/%E5%A4%A9%E4%BD%BF%E5%BF%83/1071753622?i=1071753630&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music49/v4/9b/98/eb/9b98ebae-69b1-8009-678c-65e94124e0a8/dj.cqtiyqmo.jpg/100x100bb.jpg',
    trackId: '1071753630',
  },
  '1071753634': {
    title: '距离',
    artist: '林俊杰',
    duration: '4:14',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/dd/75/d0/dd75d02c-e250-cefb-909d-8eb70b142169/mzaf_8199713231814673056.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/%E8%B7%9D%E9%9B%A2/1071753622?i=1071753634&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music49/v4/9b/98/eb/9b98ebae-69b1-8009-678c-65e94124e0a8/dj.cqtiyqmo.jpg/100x100bb.jpg',
    trackId: '1071753634',
  },
  '1273853452': {
    title: 'Love U U',
    artist: '林俊杰',
    duration: '3:40',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/3a/be/5e/3abe5e06-262e-f6dd-978c-9cb0f9892053/mzaf_16278102155509705614.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/love-u-u/1273853446?i=1273853452&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/71/ae/85/71ae85b0-ab1e-39ae-3786-e2152c723b0d/825646590650.jpg/100x100bb.jpg',
    trackId: '1273853452',
  },
  '1407107889': {
    title: '心酸',
    artist: '林宥嘉',
    duration: '4:10',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/a3/f0/c7/a3f0c7b5-2625-a1c2-7e70-5395da752ef5/mzaf_3539592080275396949.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/%E5%BF%83%E9%85%B8-%E6%B5%AA%E8%B2%BB-%E8%80%B3%E6%9C%B5-%E6%83%B3%E8%87%AA%E7%94%B1-live/1407107080?i=1407107889&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f5/46/da/f546dac1-ce60-a2fb-1c89-20b38e9fbe20/4713213190876.jpg/100x100bb.jpg',
    trackId: '1407107889',
  },
  '1440838352': {
    title: 'Latch (Acoustic)',
    artist: 'Sam Smith',
    duration: '3:43',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ff/77/70/ff7770f0-c18c-9d78-7e9e-879c65669ef0/mzaf_6022087712083832425.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/latch-acoustic/1440837455?i=1440838352&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6b/64/f8/6b64f8f3-b116-8704-7476-829420486cbb/15UMGIM50961.rgb.jpg/100x100bb.jpg',
    trackId: '1440838352',
  },
  '1440838360': {
    title: 'Make It to Me',
    artist: 'Sam Smith',
    duration: '2:41',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c6/7e/93/c67e935d-fdef-4534-92ac-d6d3217b5500/mzaf_11081177804754524788.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/make-it-to-me/1440837455?i=1440838360&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6b/64/f8/6b64f8f3-b116-8704-7476-829420486cbb/15UMGIM50961.rgb.jpg/100x100bb.jpg',
    trackId: '1440838360',
  },
  '1440868258': {
    title: 'Island In the Sun',
    artist: 'Weezer',
    duration: '3:20',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/52/a6/03/52a6032e-39c0-fd3e-555d-ce683f3d9d31/mzaf_7707796819108024384.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/island-in-the-sun/1440868131?i=1440868258&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/fc/ef/19/fcef196c-3f81-e9da-f02a-b55d900e7d69/16UMGIM53162.rgb.jpg/100x100bb.jpg',
    trackId: '1440868258',
  },
  '1532252603': {
    title: 'Free Mind',
    artist: 'Tems',
    duration: '4:08',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/d9/46/77/d9467781-1e14-4481-ae72-927a835d7ab6/mzaf_17710909531120036881.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/free-mind/1532252592?i=1532252603&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c6/4d/ed/c64ded15-9cd9-4bd7-a3ea-051178b2427d/195497234301.jpg/100x100bb.jpg',
    trackId: '1532252603',
  },
  '1536994185': {
    title: 'Drowning Shadows',
    artist: 'Sam Smith',
    duration: '4:14',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/48/55/64/485564aa-7cac-b557-2e39-23f370ae995b/mzaf_6761734391755694368.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/drowning-shadows/1536993568?i=1536994185&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/f2/59/8a/f2598a7e-945a-3cb6-24e1-9c3ead873760/15UMGIM50961.rgb.jpg/100x100bb.jpg',
    trackId: '1536994185',
  },
  '1646768617': {
    title: '围牆',
    artist: '李玖哲',
    duration: '3:19',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f2/4c/8a/f24c8a0b-d2c6-68f9-acc9-fd97b816dcf5/mzaf_2485798717274858735.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/%E5%9C%8D%E7%89%86/1646768216?i=1646768617&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/56/c9/e5/56c9e545-f3d7-00fa-6f8a-0045cb27e7a8/cover.jpg/100x100bb.jpg',
    trackId: '1646768617',
  },
  '1673917408': {
    title: 'Your Eyes',
    artist: '回环',
    duration: '4:26',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/bf/a7/01/bfa701b5-a7c7-0bff-02ea-c8d1f969dbbf/mzaf_17469938401204271986.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/your-eyes/1673917407?i=1673917408&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/90/c4/95/90c495a5-39f4-086c-ff13-99be328de316/193017101119.jpg/100x100bb.jpg',
    trackId: '1673917408',
  },
  '1717344136': {
    title: '重来',
    artist: '蔡健雅',
    duration: '4:43',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/b1/61/42/b1614219-4588-4590-4c2f-3b0b8d7ece61/mzaf_13952596697525040107.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/%E9%87%8D%E6%9D%A5/1717344133?i=1717344136&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/0e/49/9b/0e499bcb-7804-2127-581d-ef847f5de495/23UM1IM53484.rgb.jpg/100x100bb.jpg',
    trackId: '1717344136',
  },
  '1732389398': {
    title: '酿成想念',
    artist: '蔡宥绮',
    duration: '3:46',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/eb/07/00/eb07003e-1f5f-5031-da70-4404bda4d8dd/mzaf_7865492073434948402.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/spring-garden/1732389395?i=1732389398&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/f1/f7/04/f1f70487-8fcb-281d-a916-3d3c3c25de24/4711508066097.jpg/100x100bb.jpg',
    trackId: '1732389398',
  },
  '1821303542': {
    title: 'The Rhythm Of The Night',
    artist: 'Corona',
    duration: '4:24',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2f/69/b7/2f69b70f-eaa0-7985-a4d9-06d6205e7cb2/mzaf_11198942228117208477.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/the-rhythm-of-the-night-club-mix/1821303537?i=1821303542&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d2/22/29/d2222908-217c-0114-c145-4b26005034dd/8033196531579.jpg/100x100bb.jpg',
    trackId: '1821303542',
  },
  '1874801993': {
    title: '我对缘分小心翼翼',
    artist: '林俊杰',
    duration: '4:42',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6b/58/cf/6b58cf88-a598-f7b2-fee2-d6bede3ccf4c/mzaf_15839595501963315352.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/careful-with-fate-theme-song-from-the-tv-series/1874801991?i=1874801993&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c6/bb/8d/c6bb8d0c-b306-798d-919c-c2bcf0164660/4711720284392_new2.jpg/100x100bb.jpg',
    trackId: '1874801993',
  },
  '1894316978': {
    title: 'Satisfy',
    artist: 'Calvin Harris & Jazzy',
    duration: '3:06',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/7f/1b/0b/7f1b0b1c-db68-e8af-2282-22787dee6e27/mzaf_15817098001181933357.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/satisfy/1894316975?i=1894316978&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4b/bf/5c/4bbf5c8a-f1d2-9c65-2218-fccc9a8555ad/196874313909.jpg/100x100bb.jpg',
    trackId: '1894316978',
  },
  '6785856252': {
    title: 'night night',
    artist: 'Andr & Whys Young',
    duration: '3:59',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d5/46/11/d54611b1-f25b-b470-6027-23709ecf36c4/mzaf_16578139505200930644.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/night-night/6785855912?i=6785856252&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/0e/c7/00/0ec7003e-6f85-60bc-848b-562c0c0b4361/cover.jpg/100x100bb.jpg',
    trackId: '6785856252',
  },
  '6781003715': {
    title: 'Richest',
    artist: 'Muni Long',
    duration: '3:39',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/9f/dd/1b/9fdd1b02-3bf1-3505-0232-75175bada7cf/mzaf_12749706548369887081.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/richest/6781003616?i=6781003715&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cd/8d/c6/cd8dc65a-a2e7-e867-c875-b81d4b39d23a/26UMGIM78226.rgb.jpg/100x100bb.jpg',
    trackId: '6781003715',
  },
  '1620358546': {
    title: 'Lost (Apple Music Home Session)',
    artist: 'Sigrid',
    duration: '3:25',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1d/11/f6/1d11f685-d77b-6692-d6de-f3696c2f95fe/mzaf_1515861356311754958.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/lost-apple-music-home-session/1620358195?i=1620358546&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/2e/32/b0/2e32b07f-6bc0-3e85-7e73-0be076d18934/21UMGIM70552.rgb.jpg/100x100bb.jpg',
    trackId: '1620358546',
  },
  '1615585008': {
    title: 'As It Was',
    artist: 'Harry Styles',
    duration: '2:47',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/10/16/67101606-3869-ca44-6c03-e13d6322cb51/mzaf_1135399237022217274.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/as-it-was/1615584999?i=1615585008&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/100x100bb.jpg',
    trackId: '1615585008',
  },
  '1535667489': {
    title: 'Like You Do',
    artist: 'JJ Lin',
    duration: '3:16',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview124/v4/11/28/83/1128839f-2777-69ec-a1bd-b34a6feaa78d/mzaf_1032959036031739504.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/like-you-do/1535667486?i=1535667489&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/36/bf/36/36bf3604-7dc6-16ca-90e9-a42cf22d46bf/190295113568.jpg/100x100bb.jpg',
    trackId: '1535667489',
  },
  '1564530724': {
    title: 'Getting Older',
    artist: 'Billie Eilish',
    duration: '4:04',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/45/f9/69/45f9697f-81bd-fe97-079c-6124e49c88b4/mzaf_14545847837565339878.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/getting-older/1564530719?i=1564530724&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2d/f3/c9/2df3c9fd-e0eb-257c-c035-b04f05a66580/21UMGIM36691.rgb.jpg/100x100bb.jpg',
    trackId: '1564530724',
  },
  '1694386830': {
    title: 'vampire',
    artist: 'Olivia Rodrigo',
    duration: '3:39',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/02/b3/f1/02b3f1b4-49b2-3168-4d77-eee99a4b95e1/mzaf_10519337211837405761.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/vampire/1694386825?i=1694386830&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/9b/d8/9c/9bd89c9e-b44d-ad25-1516-b9b30f64fd2a/23UMGIM71510.rgb.jpg/100x100bb.jpg',
    trackId: '1694386830',
  },
  '1657869393': {
    title: 'Kill Bill',
    artist: 'SZA',
    duration: '2:33',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/45/2b/ea/452bead6-c7f5-82d4-f5f7-ec876014b4cc/mzaf_2905911853279084717.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/kill-bill/1657869377?i=1657869393&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/bd/3b/a9/bd3ba9fb-9609-144f-bcfe-ead67b5f6ab3/196589564931.jpg/100x100bb.jpg',
    trackId: '1657869393',
  },
  '1673804556': {
    title: 'Eyes Closed',
    artist: 'Ed Sheeran',
    duration: '3:14',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/15/ea/17/15ea171d-169b-7ac9-a388-868f68b93a03/mzaf_18169731938001158680.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/eyes-closed/1673804537?i=1673804556&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/c2/4c/36/c24c3631-08b8-b576-345a-259b395f8dbd/5054197591464.jpg/100x100bb.jpg',
    trackId: '1673804556',
  },
  '1556175852': {
    title: 'Hold On',
    artist: 'Justin Bieber',
    duration: '2:50',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/51/cd/9f/51cd9f46-869b-ecec-c523-161d5bd7ce15/mzaf_11971956107966947364.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/hold-on/1556175419?i=1556175852&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f5/7a/9e/f57a9e6a-31c8-0784-dfbd-4a0120bfd4af/21UMGIM17517.rgb.jpg/100x100bb.jpg',
    trackId: '1556175852',
  },
  '1727526894': {
    title: 'Training Season',
    artist: 'Dua Lipa',
    duration: '3:29',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a8/87/16/a88716e2-9474-ec4e-06d6-d3a9a3ba96c8/mzaf_6258558385119267725.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/training-season/1727526670?i=1727526894&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/82/89/15/828915ea-d716-61c4-3de7-ef00c1f800fb/5054197853630.jpg/100x100bb.jpg',
    trackId: '1727526894',
  },
  '1447334978': {
    title: 'Dancing With A Stranger',
    artist: 'Sam Smith & Normani',
    duration: '2:51',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c3/30/69/c33069cc-5980-a257-d19d-3b7aff8ff6a6/mzaf_7297139468848368484.plus.aac.p.m4a',
    trackViewUrl: 'https://music.apple.com/us/album/dancing-with-a-stranger/1447334977?i=1447334978&uo=4',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/30/75/5b/30755bfd-3225-8a60-ac85-0cf74876f84e/18UMGIM84859.rgb.jpg/100x100bb.jpg',
    trackId: '1447334978',
  },
};

/** 心情歌单列表 */
export const moodPlaylists: MoodPlaylist[] = [
  {
    id: 1,
    title: '深夜电台',
    author: 'Jack Tan',
    desc: '适合凌晨两点，一个人戴着耳机听',
    cover: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/0e/c7/00/0ec7003e-6f85-60bc-848b-562c0c0b4361/cover.jpg/600x600bb.jpg',
    songs: ['6785856252', '1532252603', '1407107889', '1536994185', '1440838352', '1440838360', '281714129', '355038523', '1673917408', '1440868258'],
    songList: [],
    tag: 'Chill',
    avatarImage: '',
  },
  {
    id: 2,
    title: '公路旅行',
    author: 'Jack Tan',
    desc: '车窗打开，风灌进来，音量拉满',
    cover: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Features124/v4/0b/fb/b5/0bfbb592-e2ce-065a-a098-09f55cee22db/dj.iziroksp.jpg/600x600bb.jpg',
    songs: ['551515762', '159294814', '159294551', '1440868258', '1821303542', '279647290', '1532252603', '6781003715', '1894316978', '6785856252'],
    songList: [],
    tag: 'Rock',
    avatarImage: '',
  },
  {
    id: 3,
    title: '咖啡馆爵士',
    author: 'Jack Tan',
    desc: '下雨天的下午，一杯拿铁的时间',
    cover: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/50/f8/64/50f86432-2051-dcb6-c80c-26751db6c88a/mzi.nsvpouqk.jpg/600x600bb.jpg',
    songs: ['281714129', '355038523', '40284751', '279647290', '6781003715', '1440838352', '1536994185', '1440838360', '1407107889', '1717344136'],
    songList: [],
    tag: 'Jazz',
    avatarImage: '',
  },
  {
    id: 4,
    title: '电子脉冲',
    author: 'Jack Tan',
    desc: '跑步、健身、或者纯粹想蹦迪',
    cover: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4b/bf/5c/4bbf5c8a-f1d2-9c65-2218-fccc9a8555ad/196874313909.jpg/600x600bb.jpg',
    songs: ['1894316978', '1821303542', '6785856252', '1532252603', '6781003715', '551515762', '159294814', '159294551', '279647290', '1440868258'],
    songList: [],
    tag: 'Electronic',
    avatarImage: '',
  },
  {
    id: 5,
    title: '华语老歌新听',
    author: 'Jack Tan',
    desc: '那些被时间酿成酒的旋律',
    cover: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/71/ae/85/71ae85b0-ab1e-39ae-3786-e2152c723b0d/825646590650.jpg/600x600bb.jpg',
    songs: ['1273853452', '1071753634', '1071753630', '1717344136', '1646768617', '1732389398', '1874801993', '1407107889', '1673917408', '281714129'],
    songList: [],
    tag: 'Mandarin',
    avatarImage: '',
  },
  {
    id: 6,
    title: 'Lo-fi 工作流',
    author: 'Jack Tan',
    desc: '专注模式启动，世界与我无关',
    cover: 'linear-gradient(135deg, #2dd4bf 0%, #a7f3d0 100%)',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/0e/c7/00/0ec7003e-6f85-60bc-848b-562c0c0b4361/cover.jpg/600x600bb.jpg',
    songs: ['6785856252', '1532252603', '1440838352', '1440838360', '1673917408', '1440868258', '1536994185', '1407107889', '1646768617', '1732389398'],
    songList: [],
    tag: 'Lo-fi',
    avatarImage: '',
  },
];

/** 月度歌单列表 */
export const monthlyShares: MonthlyShare[] = [
  {
    id: 104,
    month: '2026年8月',
    title: '你的精选集',
    author: 'Jack Tan',
    desc: '来自 Apple Music 的个人精选推荐，融合流行、另类与 R&B，记录这个夏天的声音记忆。',
    cover: 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #818cf8 100%)',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/600x600bb.jpg',
    songs: ['1620358546', '1615585008', '1535667489', '1564530724', '1694386830', '1657869393', '1673804556', '1556175852', '1727526894', '1447334978'],
    songList: [],
    tag: 'Pop',
    avatarImage: '',
  },
  {
    id: 101,
    month: '2026年7月',
    title: '夏日气泡水',
    author: 'Jack Tan',
    desc: '这个月循环最多的歌，像冰镇汽水一样上头。合成器流行和City Pop的混搭，适合35度的午后。',
    cover: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #38bdf8 100%)',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d2/22/29/d2222908-217c-0114-c145-4b26005034dd/8033196531579.jpg/600x600bb.jpg',
    songs: ['1821303542', '1894316978', '279647290', '6781003715', '1532252603', '6785856252', '1440868258', '1273853452', '1732389398', '551515762'],
    songList: [],
    tag: 'Summer Pop',
    avatarImage: '',
  },
  {
    id: 102,
    month: '2026年6月',
    title: '梅雨季的窗',
    author: 'Jack Tan',
    desc: '连续下了两周的雨，这些歌是雨声的BGM。后摇、Ambient、一些安静的民谣。',
    cover: 'linear-gradient(135deg, #93c5fd 0%, #a5f3fc 100%)',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/f2/59/8a/f2598a7e-945a-3cb6-24e1-9c3ead873760/15UMGIM50961.rgb.jpg/600x600bb.jpg',
    songs: ['1536994185', '1440838352', '1440838360', '281714129', '355038523', '1407107889', '1673917408', '40284751', '1717344136', '1646768617'],
    songList: [],
    tag: 'Ambient',
    avatarImage: '',
  },
  {
    id: 103,
    month: '2026年5月',
    title: '五月躁动',
    author: 'Jack Tan',
    desc: '春天快结束的时候总想搞点事。朋克、车库、一些不太乖的独立摇滚。',
    cover: 'linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Features124/v4/0b/fb/b5/0bfbb592-e2ce-065a-a098-09f55cee22db/dj.iziroksp.jpg/600x600bb.jpg',
    songs: ['551515762', '159294814', '159294551', '1440868258', '1821303542', '1532252603', '1894316978', '6781003715', '279647290', '6785856252'],
    songList: [],
    tag: 'Indie Rock',
    avatarImage: '',
  },
];

/** 所有可用标签 */
export const allTags: string[] = [
  'Chill',
  'Rock',
  'Jazz',
  'Electronic',
  'Lo-fi',
  '华语',
  'R&B',
  'Pop',
  'Ambient',
  'Indie',
];

/**
 * 将 trackId 数组解析为 Song 对象数组
 * 兼容新结构（songs 为 trackId 数组）和旧结构（songList 为完整对象数组）
 */
export function normalizePlaylist<T extends { songs?: string[]; songList?: Song[] }>(
  playlist: T,
): T & { songList: Song[] } {
  // 新结构：songs 是 trackId 数组
  if (
    playlist.songs &&
    Array.isArray(playlist.songs) &&
    playlist.songs.length > 0 &&
    typeof playlist.songs[0] === 'string'
  ) {
    const songIds = playlist.songs.slice(0, MAX_SONGS);
    const songList = songIds
      .map((id) => songLibrary[id])
      .filter((s): s is Song => Boolean(s));
    return { ...playlist, songs: songIds, songList };
  }

  // 旧结构：songList 已是对象数组
  const existingList = playlist.songList ?? [];
  const songList = existingList.length > MAX_SONGS ? existingList.slice(0, MAX_SONGS) : existingList;
  return { ...playlist, songList };
}

/** 批量标准化歌单列表 */
export function normalizePlaylists<T extends { songs?: string[]; songList?: Song[] }>(
  playlists: T[],
): (T & { songList: Song[] })[] {
  return playlists.map(normalizePlaylist);
}

/** 把 iTunes 封面 URL 升级到更大尺寸（默认 600x600） */
export function upgradeArtwork(url: string | undefined, size = 600): string {
  if (!url) return '';
  return url.replace(/\d+x\d+bb/, `${size}x${size}bb`);
}

/**
 * 歌单封面自动获取：
 * 优先使用歌单自带 coverImage；否则从第一首有封面的歌曲自动派生（放大到 600x600）；
 * 都没有时返回空串，由组件走渐变/SVG 兜底。
 */
export function playlistCover(p: {
  coverImage?: string;
  songList?: Song[];
}): string {
  if (p.coverImage) return p.coverImage;
  const first = (p.songList || []).find((s) => s.artworkUrl100);
  return first ? upgradeArtwork(first.artworkUrl100) : '';
}

/** 按月份降序排列（最新月份在前） */
export function sortMonthly<T extends { month?: string }>(playlists: T[]): T[] {
  return [...playlists].sort((a, b) => (b.month ?? '').localeCompare(a.month ?? ''));
}

/** 初始化数据：标准化所有歌单 */
export const normalizedMoodPlaylists = normalizePlaylists(moodPlaylists);
export const normalizedMonthlyShares = sortMonthly(normalizePlaylists(monthlyShares));
