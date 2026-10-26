export interface District {
  name: string;
  desc: string;
}

/** The 20 dzongkhags. `name` must match the `title` of the matching <path> in BhutanMap.astro. */
export const DISTRICTS: District[] = [
  { name: 'Ha', desc: 'A remote western valley of Bon-era shrines and high alpine trails, only opened to travelers in 2002.' },
  { name: 'Samtse', desc: "Bhutan's southernmost district, bordering India amid subtropical forest and tea gardens." },
  { name: 'Paro', desc: "Home to Bhutan's only international airport and the cliffside Taktsang, the Tiger's Nest monastery." },
  { name: 'Chhukha', desc: 'A gateway district of dramatic river gorges, hydropower dams and the border town of Phuentsholing.' },
  { name: 'Thimphu', desc: 'The capital, built around Tashichho Dzong and alive each autumn with the Thimphu Tshechu.' },
  { name: 'Gasa', desc: "Bhutan's most sparsely populated district — high alpine meadows, yak herders and natural hot springs." },
  { name: 'Punakha', desc: 'Former winter capital, where Punakha Dzong sits at the meeting of two rivers.' },
  { name: 'Dagana', desc: 'A subtropical southern district of forested hills and a hilltop dzong.' },
  { name: 'Wangdue Phodrang', desc: "Central Bhutan's river-carved valley, known for whitewater rapids and mountain-bike trails." },
  { name: 'Tsirang', desc: "A fertile district of terraced farms and citrus orchards in Bhutan's warm mid-hills." },
  { name: 'Sarpang', desc: "Southern lowlands bordering Royal Manas National Park, Bhutan's oldest protected area." },
  { name: 'Trongsa', desc: 'The ancestral seat of the monarchy, where Trongsa Dzong commands the east–west highway.' },
  { name: 'Bumthang', desc: "Bhutan's spiritual heartland — ancient temples, buckwheat valleys and apple orchards." },
  { name: 'Zhemgang', desc: 'A remote, densely forested district and wildlife corridor in central Bhutan.' },
  { name: 'Trashigang', desc: 'The largest eastern district, centered on the hilltop Trashigang Dzong.' },
  { name: 'Monggar', desc: 'An eastern crossroads town set among steep, terraced slopes.' },
  { name: 'Pemagatshel', desc: 'A quiet eastern district of pine forest and traditional weaving villages.' },
  { name: 'Lhuentse', desc: 'Ancestral home of the royal family, perched above the Kuri Chhu gorge.' },
  { name: 'Samdrup Jongkha', desc: 'A southeastern border district of lowland subtropical forest.' },
  { name: 'Trashi Yangtse', desc: 'A far-eastern valley where black-necked cranes winter in the Bumdeling sanctuary.' },
];
