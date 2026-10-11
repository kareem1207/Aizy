// Original product illustrations, drawn as SVG and returned as data URIs, so the
// catalogue needs no photos or third-party images. Each product "kind" has its
// own drawing, tinted with its category colours.

const PALETTE = {
  "Ethnic Wear": { bg: ["#fde7c8", "#f8b99a"], c: "#b4442f", l: "#fff3e6", a: "#e8a33d" },
  "Western Wear": { bg: ["#d6e6fb", "#b7d3f2"], c: "#2f5a99", l: "#eef5ff", a: "#f0b429" },
  Footwear: { bg: ["#dcf5d0", "#a9e2b4"], c: "#2f7a4a", l: "#f1fff1", a: "#f2994a" },
  Accessories: { bg: ["#f9dcef", "#cbc4f2"], c: "#7a3b8f", l: "#fff0fb", a: "#e8b84a" },
  Electronics: { bg: ["#cdf3f8", "#a5c8f7"], c: "#27478f", l: "#edf8ff", a: "#41c9e2" },
  Stationery: { bg: ["#fdebd5", "#f7c4aa"], c: "#a14f2c", l: "#fff6ec", a: "#3c6ca8" },
  Arts: { bg: ["#e8d9fb", "#b9d6f8"], c: "#5b3ea3", l: "#f6f0ff", a: "#ef6c8b" },
  "Home & Living": { bg: ["#f6efe6", "#e1d0bd"], c: "#7a5a3a", l: "#fffaf3", a: "#5e9c76" },
  Sports: { bg: ["#cef8de", "#a6dcef"], c: "#1f7a6b", l: "#effffa", a: "#f2994a" },
};
const FALLBACK = { bg: ["#e5e7eb", "#cbd5e1"], c: "#475569", l: "#f8fafc", a: "#3c6ca8" };

// Each drawing fits roughly x 90..310, y 70..250 of a 400x300 canvas.
const DRAW = {
  tee: ({ c, l }) =>
    `<path d="M140 110L172 94Q200 118 228 94L260 110L284 152L252 164L246 142V234H154V142L148 164L116 152Z" fill="${c}"/><path d="M172 94Q200 118 228 94" fill="none" stroke="${l}" stroke-width="5" stroke-linecap="round"/>`,
  shirt: ({ c, l }) =>
    `<path d="M138 112L172 94L200 124L228 94L262 112L286 156L254 168L248 144V236H152V144L146 168L114 156Z" fill="${c}"/><path d="M172 94L200 124L228 94L214 90L200 104L186 90Z" fill="${l}"/><path d="M200 124V236" stroke="${l}" stroke-width="3" opacity=".7"/><g fill="${l}"><circle cx="200" cy="150" r="3"/><circle cx="200" cy="178" r="3"/><circle cx="200" cy="206" r="3"/></g>`,
  kurta: ({ c, l, a }) =>
    `<path d="M150 98L178 88Q200 108 222 88L250 98L276 164L250 174L246 152L252 262H148L154 152L150 174L124 164Z" fill="${c}"/><path d="M178 88Q200 108 222 88L214 128H186Z" fill="${l}" opacity=".9"/><path d="M200 108V190" stroke="${a}" stroke-width="3"/><g fill="${a}"><circle cx="200" cy="140" r="3.5"/><circle cx="200" cy="162" r="3.5"/><circle cx="200" cy="184" r="3.5"/></g><path d="M152 258H248" stroke="${a}" stroke-width="4"/>`,
  sherwani: ({ c, l, a }) =>
    `<path d="M150 96L180 86L200 96L220 86L250 96L278 168L250 178L246 156L254 266H146L154 156L150 178L122 168Z" fill="${c}"/><path d="M180 86L200 96L220 86L222 108H178Z" fill="${a}"/><path d="M200 96V266" stroke="${l}" stroke-width="3" opacity=".7"/><g fill="${a}"><circle cx="200" cy="128" r="4"/><circle cx="200" cy="156" r="4"/><circle cx="200" cy="184" r="4"/><circle cx="200" cy="212" r="4"/></g><path d="M150 252H250" stroke="${a}" stroke-width="5"/>`,
  jacket: ({ c, l, a }) =>
    `<path d="M136 108L170 92L200 128L230 92L264 108L290 170L256 182L250 154V240H150V154L144 182L110 170Z" fill="${c}"/><path d="M170 92L200 128L184 240H170Z" fill="${l}" opacity=".22"/><path d="M200 128V240" stroke="${l}" stroke-width="3"/><path d="M170 92L200 128L230 92L216 86L200 108L184 86Z" fill="${l}"/><g fill="${a}"><circle cx="190" cy="168" r="3.5"/><circle cx="190" cy="196" r="3.5"/></g>`,
  vest: ({ c, l, a }) =>
    `<path d="M156 92L180 88L200 118L220 88L244 92L252 140L246 246H154L148 140Z" fill="${c}"/><path d="M180 88L200 118L220 88" fill="none" stroke="${l}" stroke-width="5" stroke-linejoin="round"/><path d="M200 118V246" stroke="${l}" stroke-width="2.5"/><g fill="${a}"><circle cx="200" cy="150" r="3.5"/><circle cx="200" cy="178" r="3.5"/><circle cx="200" cy="206" r="3.5"/></g>`,
  dress: ({ c, l, a }) =>
    `<path d="M174 92H190L200 108L210 92H226L232 148Q272 196 288 252H112Q128 196 168 148Z" fill="${c}"/><path d="M168 148H232" stroke="${a}" stroke-width="7"/><path d="M174 92H190L200 108L210 92H226" fill="none" stroke="${l}" stroke-width="3"/><path d="M150 252Q180 200 190 160M250 252Q220 200 210 160" stroke="${l}" stroke-width="2" opacity=".35" fill="none"/>`,
  sequin: ({ c, l, a }) =>
    `<path d="M174 92H190L200 108L210 92H226L230 150L246 252H154L170 150Z" fill="${c}"/><g fill="${a}"><circle cx="190" cy="140" r="4"/><circle cx="212" cy="164" r="4"/><circle cx="180" cy="190" r="4"/><circle cx="220" cy="206" r="4"/><circle cx="196" cy="230" r="4"/><circle cx="170" cy="236" r="3"/><circle cx="232" cy="238" r="3"/></g><g fill="${l}"><circle cx="205" cy="128" r="3"/><circle cx="188" cy="168" r="3"/><circle cx="214" cy="190" r="3"/><circle cx="184" cy="214" r="3"/></g>`,
  lehenga: ({ c, l, a }) =>
    `<path d="M178 86H190L200 100L210 86H222L226 140H174Z" fill="${a}"/><path d="M174 140H226L292 252H108Z" fill="${c}"/><path d="M174 140H226" stroke="${l}" stroke-width="4"/><path d="M128 236H272M142 214H258M156 192H244" stroke="${a}" stroke-width="3" opacity=".8"/><path d="M200 140V252" stroke="${l}" stroke-width="2" opacity=".4"/>`,
  saree: ({ c, l, a }) =>
    `<path d="M160 90Q200 78 240 90L252 252H148Z" fill="${c}"/><path d="M160 90L252 252H226L150 100Z" fill="${a}"/><path d="M172 96Q196 150 244 150L246 168Q190 170 164 108Z" fill="${l}" opacity=".85"/><g stroke="${l}" stroke-width="2" opacity=".5"><path d="M176 190V252M192 186V252M208 184V252M224 180V252"/></g><path d="M148 248H252" stroke="${a}" stroke-width="6"/>`,
  palazzo: ({ c, l, a }) =>
    `<path d="M156 100H244L292 250H210L200 170L190 250H108Z" fill="${c}"/><path d="M156 100H244V114H156Z" fill="${a}"/><path d="M200 114V170" stroke="${l}" stroke-width="2.5"/><g stroke="${l}" stroke-width="2" opacity=".4"><path d="M150 150L128 240M250 150L272 240"/></g>`,
  pants: ({ c, l, a }) =>
    `<path d="M152 98H248L262 250H214L200 150L186 250H138Z" fill="${c}"/><path d="M152 98H248V114H152Z" fill="${a}"/><path d="M200 114V150" stroke="${l}" stroke-width="2.5"/><path d="M168 130H182M218 130H232" stroke="${l}" stroke-width="3" stroke-linecap="round"/><path d="M147 190H256" stroke="${l}" stroke-width="2" opacity=".35"/>`,
  jeans: ({ c, l, a }) =>
    `<path d="M152 98H248L262 252H214L200 152L186 252H138Z" fill="${c}"/><path d="M152 98H248V116H152Z" fill="${l}" opacity=".25"/><path d="M200 116V152" stroke="${l}" stroke-width="2.5"/><path d="M160 116Q172 140 186 126M240 116Q228 140 214 126" fill="none" stroke="${a}" stroke-width="2.5"/><path d="M142 232H196M206 232H258" stroke="${l}" stroke-width="2" opacity=".5"/>`,
  sneaker: ({ c, l, a }) =>
    `<path d="M92 218Q94 172 128 168L166 150Q186 178 216 180L258 184Q306 192 308 220V236H92Z" fill="${c}"/><path d="M92 226H308V240H92Z" fill="${l}"/><path d="M166 150L186 166M180 160L200 174M194 168L214 180" stroke="${l}" stroke-width="4" stroke-linecap="round"/><path d="M128 168Q150 190 170 212" stroke="${a}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  loafer: ({ c, l, a }) =>
    `<path d="M94 222Q98 180 146 178Q188 176 214 198Q288 200 304 224V238H94Z" fill="${c}"/><path d="M94 238H304V248H94Z" fill="${a}"/><path d="M150 196Q180 194 200 206L168 214Q148 214 150 196Z" fill="${l}" opacity=".35"/><path d="M148 180L182 178" stroke="${l}" stroke-width="3" opacity=".6"/>`,
  chappal: ({ c, l, a }) =>
    `<path d="M104 206Q200 140 296 206Q306 244 200 252Q94 246 104 206Z" fill="${a}"/><path d="M128 206Q200 168 272 206Q276 232 200 238Q124 232 128 206Z" fill="${c}"/><path d="M150 200Q200 150 250 200" stroke="${l}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="200" cy="162" r="6" fill="${l}"/>`,
  sandal: ({ c, l, a }) =>
    `<path d="M104 232H280L290 246H104Z" fill="${a}"/><path d="M104 232Q110 206 150 204L276 224L280 232Z" fill="${c}"/><rect x="246" y="222" width="30" height="40" rx="4" fill="${a}"/><path d="M150 204Q170 150 200 160Q214 170 200 210" stroke="${l}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M168 208Q172 170 188 166" stroke="${c}" stroke-width="3" fill="none"/>`,
  bag: ({ c, l, a }) =>
    `<path d="M128 136H272L286 252H114Z" fill="${c}"/><path d="M164 136Q164 92 200 92Q236 92 236 136" fill="none" stroke="${a}" stroke-width="9" stroke-linecap="round"/><path d="M128 136H272" stroke="${l}" stroke-width="3" opacity=".6"/><rect x="186" y="168" width="28" height="22" rx="4" fill="${a}"/><path d="M120 200H280" stroke="${l}" stroke-width="2" opacity=".3"/>`,
  sunglasses: ({ c, l, a }) =>
    `<path d="M92 150H308" stroke="${a}" stroke-width="7" stroke-linecap="round"/><path d="M110 150H190Q190 210 150 214Q110 214 110 150Z" fill="${c}"/><path d="M210 150H290Q290 214 250 214Q210 210 210 150Z" fill="${c}"/><path d="M190 158Q200 148 210 158" fill="none" stroke="${a}" stroke-width="6" stroke-linecap="round"/><path d="M124 164L146 190M224 164L246 190" stroke="${l}" stroke-width="4" stroke-linecap="round" opacity=".7"/>`,
  earrings: ({ c, l, a }) =>
    `<g><circle cx="150" cy="104" r="9" fill="${a}"/><path d="M150 113V128" stroke="${a}" stroke-width="4"/><path d="M122 214Q122 142 150 132Q178 142 178 214Z" fill="${c}"/><g fill="${a}"><circle cx="128" cy="222" r="5"/><circle cx="150" cy="226" r="5"/><circle cx="172" cy="222" r="5"/></g><circle cx="150" cy="168" r="8" fill="${l}"/></g><g><circle cx="250" cy="104" r="9" fill="${a}"/><path d="M250 113V128" stroke="${a}" stroke-width="4"/><path d="M222 214Q222 142 250 132Q278 142 278 214Z" fill="${c}"/><g fill="${a}"><circle cx="228" cy="222" r="5"/><circle cx="250" cy="226" r="5"/><circle cx="272" cy="222" r="5"/></g><circle cx="250" cy="168" r="8" fill="${l}"/></g>`,
  watch: ({ c, l, a }) =>
    `<rect x="170" y="76" width="60" height="50" rx="8" fill="${a}"/><rect x="170" y="190" width="60" height="50" rx="8" fill="${a}"/><circle cx="200" cy="158" r="52" fill="${c}"/><circle cx="200" cy="158" r="42" fill="${l}"/><path d="M200 158V128M200 158L222 170" stroke="${c}" stroke-width="5" stroke-linecap="round"/><circle cx="200" cy="158" r="4" fill="${c}"/><g stroke="${c}" stroke-width="3"><path d="M200 120V124M200 192V196M162 158H166M234 158H238"/></g>`,
  dupatta: ({ c, l, a }) =>
    `<path d="M104 120Q150 86 200 120T296 120V196Q250 232 200 196T104 196Z" fill="${c}"/><path d="M104 120Q150 86 200 120T296 120" fill="none" stroke="${a}" stroke-width="6"/><path d="M104 196Q150 232 200 196T296 196" fill="none" stroke="${a}" stroke-width="6"/><g fill="${l}" opacity=".8"><circle cx="150" cy="158" r="5"/><circle cx="200" cy="164" r="5"/><circle cx="250" cy="158" r="5"/></g>`,
  earbuds: ({ c, l, a }) =>
    `<rect x="116" y="166" width="168" height="80" rx="30" fill="${c}"/><path d="M116 206H284" stroke="${l}" stroke-width="2" opacity=".4"/><circle cx="200" cy="226" r="5" fill="${a}"/><g><circle cx="156" cy="118" r="24" fill="${l}"/><rect x="146" y="128" width="20" height="44" rx="10" fill="${l}"/><circle cx="156" cy="118" r="10" fill="${c}"/></g><g><circle cx="244" cy="118" r="24" fill="${l}"/><rect x="234" y="128" width="20" height="44" rx="10" fill="${l}"/><circle cx="244" cy="118" r="10" fill="${c}"/></g>`,
  laptop: ({ c, l, a }) =>
    `<rect x="124" y="96" width="152" height="104" rx="9" fill="${c}"/><rect x="134" y="106" width="132" height="84" rx="3" fill="${l}"/><path d="M146 168L170 140L188 156L212 124L254 170" fill="none" stroke="${a}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M96 208H304L292 230Q290 236 282 236H118Q110 236 108 230Z" fill="${c}"/><rect x="176" y="208" width="48" height="6" rx="3" fill="${l}" opacity=".6"/>`,
  speaker: ({ c, l, a }) =>
    `<rect x="136" y="92" width="128" height="156" rx="26" fill="${c}"/><circle cx="200" cy="152" r="38" fill="${l}"/><circle cx="200" cy="152" r="24" fill="${c}"/><circle cx="200" cy="152" r="8" fill="${a}"/><circle cx="200" cy="108" r="7" fill="${l}"/><circle cx="200" cy="210" r="14" fill="${l}" opacity=".85"/><path d="M168 228H232" stroke="${a}" stroke-width="4" stroke-linecap="round"/>`,
  powerbank: ({ c, l, a }) =>
    `<rect x="148" y="84" width="104" height="168" rx="18" fill="${c}"/><rect x="164" y="102" width="72" height="50" rx="6" fill="${l}"/><path d="M204 108L186 134H200L196 148L214 122H200Z" fill="${a}"/><g fill="${l}"><rect x="170" y="176" width="14" height="8" rx="2"/><rect x="170" y="196" width="14" height="8" rx="2"/><rect x="170" y="216" width="14" height="8" rx="2"/></g><rect x="206" y="176" width="26" height="14" rx="4" fill="${a}"/>`,
  keyboard: ({ c, l, a }) => {
    let k = "";
    for (let r = 0; r < 4; r++) for (let i = 0; i < 10; i++) k += `<rect x="${112 + i * 17.5}" y="${130 + r * 22}" width="14" height="17" rx="3" fill="${r === 0 && i % 4 === 0 ? a : l}"/>`;
    return `<rect x="96" y="112" width="208" height="112" rx="14" fill="${c}"/>${k}<rect x="146" y="198" width="108" height="14" rx="4" fill="${l}"/>`;
  },
  pen: ({ c, l, a }) =>
    `<g stroke-linecap="round"><path d="M128 230L262 98" stroke="${c}" stroke-width="22"/><path d="M262 98L282 78" stroke="${a}" stroke-width="22"/><path d="M128 230L116 244" stroke="${l}" stroke-width="12"/><path d="M148 238L286 110" stroke="${a}" stroke-width="16" opacity=".9"/><path d="M110 206L226 92" stroke="${l}" stroke-width="14" opacity=".9"/></g>`,
  notebook: ({ c, l, a }) =>
    `<rect x="132" y="82" width="140" height="172" rx="10" fill="${c}"/><rect x="132" y="82" width="22" height="172" rx="8" fill="${a}"/><rect x="170" y="114" width="84" height="46" rx="6" fill="${l}"/><g stroke="${l}" stroke-width="3" opacity=".7"><path d="M170 184H254M170 202H236M170 220H246"/></g><path d="M246 254V282L256 272L266 282V254" fill="${a}"/>`,
  sketchbook: ({ c, l, a }) =>
    `<rect x="126" y="88" width="148" height="164" rx="8" fill="${c}"/><rect x="142" y="104" width="116" height="132" rx="4" fill="${l}"/><g fill="none" stroke="${a}" stroke-width="5" stroke-linecap="round"><path d="M160 214Q182 140 206 176T244 130"/></g><g fill="${a}"><circle cx="126" cy="114" r="5"/><circle cx="126" cy="140" r="5"/><circle cx="126" cy="166" r="5"/><circle cx="126" cy="192" r="5"/><circle cx="126" cy="218" r="5"/></g>`,
  organiser: ({ c, l, a }) =>
    `<rect x="116" y="124" width="168" height="116" rx="12" fill="${c}"/><rect x="128" y="136" width="44" height="92" rx="6" fill="${l}"/><rect x="178" y="136" width="44" height="44" rx="6" fill="${l}"/><rect x="178" y="186" width="44" height="42" rx="6" fill="${l}" opacity=".8"/><rect x="228" y="136" width="44" height="92" rx="6" fill="${l}"/><path d="M142 136L150 90M158 136L168 96" stroke="${a}" stroke-width="6" stroke-linecap="round"/><path d="M240 136L236 100" stroke="${a}" stroke-width="7" stroke-linecap="round"/>`,
  notes: ({ c, l, a }) =>
    `<rect x="132" y="108" width="110" height="110" rx="6" fill="${a}" transform="rotate(-8 187 163)"/><rect x="156" y="120" width="110" height="110" rx="6" fill="${l}" transform="rotate(6 211 175)"/><rect x="146" y="116" width="110" height="110" rx="6" fill="${c}" opacity=".95"/><g stroke="${l}" stroke-width="4" stroke-linecap="round"><path d="M164 150H236M164 172H224M164 194H208"/></g>`,
  palette: ({ c, l, a }) =>
    `<path d="M200 82C128 82 92 130 96 176C100 222 144 244 178 240C204 236 190 212 210 204C226 198 232 222 262 222C292 222 308 190 304 160C298 114 262 82 200 82Z" fill="${l}"/><circle cx="148" cy="148" r="16" fill="${a}"/><circle cx="194" cy="120" r="16" fill="${c}"/><circle cx="248" cy="136" r="16" fill="#e5484d"/><circle cx="130" cy="196" r="14" fill="#3fa66b"/><circle cx="182" cy="206" r="10" fill="#f2c94c"/><path d="M262 232L298 268" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`,
  brush: ({ c, l, a }) =>
    `<path d="M280 88L170 198" stroke="${c}" stroke-width="14" stroke-linecap="round"/><path d="M180 188L150 218" stroke="${l}" stroke-width="18" stroke-linecap="round"/><path d="M150 218Q116 224 108 252Q150 254 160 226Z" fill="${a}"/><path d="M240 128L280 88" stroke="${a}" stroke-width="16" stroke-linecap="round" opacity=".7"/>`,
  nib: ({ c, l, a }) =>
    `<path d="M200 252L146 162Q142 120 200 84Q258 120 254 162Z" fill="${c}"/><path d="M200 252V156" stroke="${l}" stroke-width="4"/><circle cx="200" cy="146" r="9" fill="${l}"/><path d="M164 150Q200 130 236 150" stroke="${a}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M148 262H252" stroke="${a}" stroke-width="5" stroke-linecap="round"/>`,
  bed: ({ c, l, a }) =>
    `<rect x="96" y="150" width="208" height="72" rx="12" fill="${c}"/><rect x="96" y="132" width="26" height="124" rx="6" fill="${a}"/><rect x="278" y="168" width="26" height="88" rx="6" fill="${a}"/><rect x="132" y="120" width="62" height="38" rx="12" fill="${l}"/><rect x="204" y="124" width="62" height="34" rx="12" fill="${l}"/><path d="M122 186H278" stroke="${l}" stroke-width="3" opacity=".5"/><path d="M122 204H278" stroke="${l}" stroke-width="3" opacity=".3"/>`,
  mug: ({ c, l, a }) =>
    `<path d="M136 128H250V218Q250 250 218 250H168Q136 250 136 218Z" fill="${c}"/><path d="M250 148H268Q292 148 292 180T262 212H250" fill="none" stroke="${c}" stroke-width="14"/><rect x="136" y="128" width="114" height="14" rx="5" fill="${l}" opacity=".5"/><g stroke="${a}" stroke-width="5" fill="none" stroke-linecap="round"><path d="M168 108Q158 94 170 82M200 108Q190 94 202 82M232 108Q222 94 234 82"/></g>`,
  candle: ({ c, l, a }) =>
    `<rect x="140" y="146" width="120" height="100" rx="16" fill="${c}"/><rect x="140" y="146" width="120" height="18" rx="6" fill="${l}" opacity=".5"/><rect x="194" y="116" width="12" height="32" rx="3" fill="${l}"/><path d="M200 70Q226 98 200 116Q174 98 200 70Z" fill="${a}"/><path d="M200 90Q210 102 200 112Q190 102 200 90Z" fill="${l}"/><rect x="160" y="190" width="80" height="26" rx="6" fill="${l}" opacity=".85"/>`,
  clock: ({ c, l, a }) =>
    `<circle cx="200" cy="164" r="88" fill="${c}"/><circle cx="200" cy="164" r="74" fill="${l}"/><g stroke="${c}" stroke-width="5" stroke-linecap="round"><path d="M200 102V114M200 214V226M138 164H150M250 164H262"/></g><path d="M200 164V122" stroke="${c}" stroke-width="7" stroke-linecap="round"/><path d="M200 164L232 182" stroke="${a}" stroke-width="6" stroke-linecap="round"/><circle cx="200" cy="164" r="7" fill="${c}"/>`,
  plant: ({ c, l, a }) =>
    `<path d="M200 182Q164 150 170 100Q204 116 200 182Z" fill="${a}"/><path d="M200 182Q242 156 236 108Q196 124 200 182Z" fill="${a}" opacity=".85"/><path d="M200 190Q146 188 132 150Q176 148 200 190Z" fill="${a}" opacity=".7"/><path d="M200 190Q254 186 270 148Q224 146 200 190Z" fill="${a}" opacity=".9"/><path d="M148 190H252L238 252H162Z" fill="${c}"/><rect x="142" y="182" width="116" height="16" rx="6" fill="${l}" opacity=".6"/>`,
  yoga: ({ c, l, a }) =>
    `<rect x="110" y="150" width="180" height="46" rx="23" fill="${c}"/><circle cx="276" cy="173" r="23" fill="${a}"/><circle cx="276" cy="173" r="11" fill="${c}"/><path d="M110 173H258" stroke="${l}" stroke-width="3" opacity=".5"/><path d="M130 214H270" stroke="${a}" stroke-width="5" stroke-linecap="round"/>`,
  bat: ({ c, l, a }) =>
    `<path d="M278 82L304 108L196 216Q176 232 160 226L170 202Z" fill="${c}"/><path d="M286 90L300 104L292 112L278 98Z" fill="${a}"/><path d="M178 214L124 268" stroke="${l}" stroke-width="12" stroke-linecap="round"/><path d="M262 118L240 140" stroke="${l}" stroke-width="3" opacity=".6"/><circle cx="130" cy="130" r="22" fill="${a}"/><path d="M112 124Q130 116 148 136" stroke="${l}" stroke-width="3" fill="none"/>`,
  ball: ({ c, l, a }) =>
    `<circle cx="200" cy="164" r="84" fill="${l}"/><path d="M200 122L236 148L222 192H178L164 148Z" fill="${c}"/><g stroke="${c}" stroke-width="4" fill="none" stroke-linejoin="round"><path d="M200 122V80M236 148L274 134M222 192L248 224M178 192L152 224M164 148L126 134"/></g><circle cx="200" cy="164" r="84" fill="none" stroke="${c}" stroke-width="6"/><g fill="${a}" opacity=".9"><path d="M274 134L286 168L260 176Z"/><path d="M126 134L114 168L140 176Z"/></g>`,
  bottle: ({ c, l, a }) =>
    `<rect x="178" y="74" width="44" height="26" rx="8" fill="${a}"/><path d="M182 100H218V118Q244 128 244 160V236Q244 252 228 252H172Q156 252 156 236V160Q156 128 182 118Z" fill="${c}"/><rect x="156" y="170" width="88" height="46" fill="${l}" opacity=".85"/><path d="M172 186H228M172 200H212" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
  bag2: ({ c, l, a }) =>
    `<path d="M140 130H260L274 250H126Z" fill="${c}"/><path d="M168 130Q168 92 200 92Q232 92 232 130" fill="none" stroke="${a}" stroke-width="9"/><circle cx="200" cy="184" r="22" fill="${l}"/><path d="M190 184L198 192L212 176" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
};

// Ordered keyword rules: the first match picks the drawing.
const RULES = [
  [/sherwani/i, "sherwani"], [/lehenga/i, "lehenga"], [/saree|sari/i, "saree"], [/sequin/i, "sequin"],
  [/dupatta|stole|scarf/i, "dupatta"], [/anarkali|dress|gown|frock/i, "dress"], [/nehru|vest|waistcoat/i, "vest"],
  [/kurta|kurti|pathani|salwar|suit set|kameez/i, "kurta"], [/palazzo|skirt/i, "palazzo"],
  [/blazer|jacket|coat|hoodie|sweater/i, "jacket"], [/formal shirt|shirt/i, "shirt"], [/\btees?\b|t-shirt|\btops?\b/i, "tee"],
  [/jeans|denim/i, "jeans"], [/track|pants|trouser|shorts|jogger/i, "pants"],
  [/loafer|formal shoe|oxford/i, "loafer"], [/kolhapuri|chappal|slipper|flip/i, "chappal"], [/heel|sandal/i, "sandal"],
  [/shoe|sneaker|runner/i, "sneaker"], [/tote|bag|backpack|purse/i, "bag"], [/sunglass|aviator|glasses/i, "sunglasses"],
  [/earring|jhumka|jewel/i, "earrings"], [/watch|band|fitness/i, "watch"], [/earbud|headphone|earphone/i, "earbuds"],
  [/laptop|notebook pc|vivobook/i, "laptop"], [/speaker/i, "speaker"], [/power ?bank|charger/i, "powerbank"],
  [/keyboard/i, "keyboard"], [/gel pen|pen pack|marker|pencil/i, "pen"], [/sticky|post-it/i, "notes"],
  [/organi[sz]er|desk/i, "organiser"], [/sketchbook|sketch/i, "sketchbook"], [/notebook|diary|journal/i, "notebook"],
  [/paint|colou?r set|watercolou?r/i, "palette"], [/brush/i, "brush"], [/calligraphy|nib|fountain/i, "nib"],
  [/bedsheet|bed sheet|pillow|duvet/i, "bed"], [/mug|cup/i, "mug"], [/candle/i, "candle"], [/clock/i, "clock"],
  [/plant|pot|planter/i, "plant"], [/yoga|mat/i, "yoga"], [/cricket|bat/i, "bat"], [/football|soccer|ball/i, "ball"],
  [/bottle|flask/i, "bottle"],
];

export function kindFor(name = "", category = "") {
  for (const [re, kind] of RULES) if (re.test(name)) return kind;
  return /footwear/i.test(category) ? "sneaker" : /electronic/i.test(category) ? "laptop" : "bag2";
}

export function productArt(category, name = "") {
  const p = PALETTE[category] || FALLBACK;
  const kind = DRAW[name] ? name : kindFor(name, category);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg[0]}"/><stop offset="1" stop-color="${p.bg[1]}"/></linearGradient></defs>` +
    `<rect width="400" height="300" fill="url(#g)"/>` +
    `<circle cx="338" cy="46" r="92" fill="#fff" opacity=".2"/><circle cx="52" cy="272" r="74" fill="#fff" opacity=".16"/>` +
    `<ellipse cx="200" cy="262" rx="96" ry="9" fill="#000" opacity=".1"/>` +
    `<g>${DRAW[kind](p)}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const ART_PREFIX = "data:image/svg+xml;charset=utf-8,";
/** True for tiles produced by productArt(), which must never be saved as an uploaded image. */
export const isArt = (image) => typeof image === "string" && image.startsWith(ART_PREFIX);
/** Ensures a product always has something to show. */
export const withArt = (p) => (p && !p.image ? { ...p, image: productArt(p.category, p.name) } : p);
