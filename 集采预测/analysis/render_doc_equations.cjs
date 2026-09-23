"use strict";

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const outputDir = process.argv[2];
if (!outputDir) throw new Error("Output directory is required");
fs.mkdirSync(outputDir, { recursive: true });

const sub = (base, value) => `<msub><mi>${base}</mi><mrow>${value}</mrow></msub>`;
const abs = value => `<mrow><mo>|</mo>${value}<mo>|</mo></mrow>`;
const frac = (top, bottom) => `<mfrac><mrow>${top}</mrow><mrow>${bottom}</mrow></mfrac>`;
const max = value => `<mrow><mi>max</mi><mo>(</mo>${value}<mo>)</mo></mrow>`;
const mean = value => `<mrow><mi>mean</mi><mo>[</mo>${value}<mo>]</mo></mrow>`;
const ln = value => `<mrow><mi>ln</mi><mo>(</mo>${value}<mo>)</mo></mrow>`;
const space = `<mspace width="1.2em"/>`;

const equations = {
  project_exposure: `${sub("E","o")}<mo>=</mo>${frac(ln(`<mn>1</mn><mo>+</mo>${sub("n","o")}`),ln(`<mn>1</mn><mo>+</mo>${sub("n","max")}`))}`,
  pair_score: `${sub("S","pair")}<mo>=</mo><mn>0.38</mn>${sub("S","item")}<mo>+</mo><mn>0.17</mn>${sub("S","org")}<mo>+</mo><mn>0.14</mn>${sub("S","region")}<mo>+</mo><mn>0.08</mn>${sub("I","type")}<mo>+</mo><mn>0.08</mn>${sub("I","method")}<mo>+</mo><mn>0.08</mn>${sub("S","time")}<mo>+</mo><mn>0.07</mn>${sub("S","amount")}`,
  precision_recall: `<mi>Precision</mi><mo>=</mo>${frac(`<mi>M</mi>`,sub("N","p"))}${space}<mi>Recall</mi><mo>=</mo>${frac(`<mi>M</mi>`,sub("N","a"))}${space}<mi>F1</mi><mo>=</mo>${frac(`<mn>2</mn><mi>Precision</mi><mi>Recall</mi>`,`<mi>Precision</mi><mo>+</mo><mi>Recall</mi>`)}`,
  composite: `${sub("S","overall")}<mo>=</mo><mn>0.50</mn><mi>F1</mi><mo>+</mo><mn>0.20</mn>${sub("S","field")}<mo>+</mo><mn>0.15</mn>${sub("A","amount")}<mo>+</mo><mn>0.10</mn>${sub("A","time")}<mo>+</mo><mn>0.05</mn>${sub("A","count")}`,
  accuracy_parts: `${sub("A","time")}<mo>=</mo>${mean(max(`<mn>0</mn><mo>,</mo><mn>1</mn><mo>−</mo>${frac(abs(`<mi>Δdays</mi>`),`<mn>180</mn>`)}`))}${space}${sub("A","count")}<mo>=</mo>${max(`<mn>0</mn><mo>,</mo><mn>1</mn><mo>−</mo>${frac(abs(`${sub("N","p")}<mo>−</mo>${sub("N","a")}`),sub("N","a"))}`)}`,
  ewma_score: `<mi>S</mi><mo>=</mo><mn>0.46</mn>${sub("P","25")}<mo>+</mo><mn>0.20</mn>${sub("P","24")}<mo>+</mo><mn>0.09</mn>${sub("P","23")}<mo>+</mo><mn>0.08</mn>${sub("H","item")}<mo>+</mo><mn>0.06</mn>${sub("H","org")}<mo>+</mo><mn>0.05</mn>${sub("T","org,cat")}<mo>+</mo><mn>0.04</mn>${sub("T","entity")}<mo>+</mo><mn>0.02</mn>${sub("E","o")}`,
  ewma_count: `${sub("N","2026")}<mo>=</mo><mi>round</mi><mo>(</mo><mn>0.60</mn>${sub("N","2025")}<mo>+</mo><mn>0.30</mn>${sub("N","2024")}<mo>+</mo><mn>0.10</mn>${sub("N","2023")}<mo>)</mo>`,
  rf: `<mi>RF</mi><mo>(</mo><mi>X</mi><mo>)</mo><mo>=</mo>${frac(`<mn>1</mn>`,`<mn>70</mn>`)}<munderover><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mn>70</mn></munderover>${sub("Tree","k")}<mo>(</mo><mi>X</mi><mo>)</mo>`,
  gbt: `${sub("r","t")}<mo>=</mo><mi>y</mi><mo>−</mo>${sub("ŷ","t")}${space}${sub("ŷ","t+1")}<mo>=</mo>${sub("ŷ","t")}<mo>+</mo><mn>0.06</mn>${sub("Tree","t")}<mo>(</mo><mi>X</mi><mo>)</mo>`,
  ensemble: `<mi>S</mi><mo>=</mo><mn>0.22</mn><mi>R</mi><mo>(</mo><mi>EWMA</mi><mo>)</mo><mo>+</mo><mn>0.18</mn><mi>Trend</mi><mo>+</mo><mn>0.25</mn><mi>R</mi><mo>(</mo><mi>RF</mi><mo>)</mo><mo>+</mo><mn>0.25</mn><mi>R</mi><mo>(</mo><mi>GBT</mi><mo>)</mo><mo>+</mo><mn>0.06</mn><mi>R</mi><mo>(</mo>${sub("T","entity")}<mo>)</mo><mo>+</mo><mn>0.04</mn>${sub("E","o")}`,
  trend: `${sub("Trend","raw")}<mo>=</mo>${max(`<mn>0</mn><mo>,</mo>${sub("C","25")}<mo>+</mo><mn>0.25</mn><mo>(</mo>${sub("C","25")}<mo>−</mo>${sub("C","24")}<mo>)</mo>`)}`,
  amount_similarity: `${sub("S","amount")}<mo>=</mo>${max(`<mn>0</mn><mo>,</mo><mn>1</mn><mo>−</mo>${frac(abs(`${ln(`<mn>1</mn><mo>+</mo><mi>P</mi>`)}<mo>−</mo>${ln(`<mn>1</mn><mo>+</mo><mi>A</mi>`)}`),ln(`<mn>5</mn>`))}`)}`,
  amount_example: `<mn>1</mn><mo>−</mo>${frac(abs(`${ln(`<mn>801</mn>`)}<mo>−</mo>${ln(`<mn>901</mn>`)}`),ln(`<mn>5</mn>`))}<mo>=</mo><mn>0.926903</mn><mo>≈</mo><mn>92.7</mn><mo>%</mo>`,
  smape: `<mi>SMAPE</mi><mo>=</mo>${frac(abs(`<mi>P</mi><mo>−</mo><mi>A</mi>`),`<mo>(</mo>${abs(`<mi>P</mi>`)}<mo>+</mo>${abs(`<mi>A</mi>`)}<mo>)</mo><mo>/</mo><mn>2</mn>`)}${space}${sub("A","amount")}<mo>=</mo>${max(`<mn>0</mn><mo>,</mo><mn>1</mn><mo>−</mo><mi>min</mi><mo>(</mo><mover><mi>SMAPE</mi><mo>¯</mo></mover><mo>,</mo><mn>1</mn><mo>)</mo>`)}`,
};

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 1900, height: 340 }, deviceScaleFactor: 3 });
    for (const [name, body] of Object.entries(equations)) {
      await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}body{display:inline-flex;padding:14px 18px;color:#182b3d}.formula{font-size:29px;line-height:1.2;white-space:nowrap;font-family:"STIX Two Math","Cambria Math","Times New Roman",serif}math{font-size:inherit}</style><div class="formula"><math display="block"><mrow>${body}</mrow></math></div>`);
      await page.locator(".formula").screenshot({ path: path.join(outputDir, `${name}.png`), omitBackground: true });
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
