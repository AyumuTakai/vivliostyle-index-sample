exports.replaces = () => {
  // 索引辞書
  const words = {};
  // 現在処理しているファイルのファイルパス([begin:]で指定)
  let filepath = "";

  return [
    {
      // ファイルパスの指定
      test: /^\[begin:(.*?)\]/,
      match: ([, fn], h) => {
        filepath = fn;
        console.log({ filepath });
      },
    },
    {
      // 索引の見出し語にしない [*!見出し語] | [*!見出し語,みだしご]
      // 同ページに複数の見出し語があった場合に自動で集約できないため手作業で修正する
      // タグを外してしまうと構成が変化した際に修正が大変なので!の付加で索引から除外できるようにしている
      test: /\[\*!((?:[^:]|(?<=\\):)*?)(?:(?<!\\):(.*?))?\]/g,
      match: ([, word, yomi], h) => {
        console.log("not heardword", { word, yomi });
        return h("span", { class: "nhw" }, word);
      },
    },
    {
      // 索引の見出し語 [*見出し語] | [*見出し語,みだしご]
      test: /\[\*((?:[^:]|(?<=\\):)*?)(?:(?<!\\):(.*?))?(?<!\\)\]/g,
      match: ([, word, yomi], h) => {
        word = word.replaceAll(/\\(:|!|\[|\])/g, "$1");
        // console.log({ word, yomi });
        yomi = yomi || word;
        if (!words[yomi]) {
          words[yomi] = [];
        }
        const id =
          "word-" + Object.keys(words).length + "-" + words[yomi].length;
        const href = filepath.replace(/.md$/, ".html") + "#" + id;
        // console.log({ href, yomi });
        words[yomi].push({ href, yomi, word });
        return h("span", { id, class: "hw" }, word);
      },
    },
    {
      // 索引出力 [index:あ,い,う,え,お]
      // 読みの辞書順で出力する
      // 頭文字を指定された順でも良いかも。あ,アだとあい、あう、アイ、アウになってしまうので(あ,ア),(い,イ)のような指定ができるようにする?
      test: /\[index:(.*?)(?<!\\)\]/,
      match: ([, headwords], h) => {
        // console.log(words);
        headwords = headwords.replaceAll(/\\(\[|\])/g, "$1").split(",");
        // console.log(headwords);
        const dict = [];
        const kanaToHira = (text) => {
          // カタカナを平仮名に変換
          return text.replace(/[ア-ン]/g, (m) =>
            String.fromCharCode(m.charCodeAt(0) - 96)
          );
        };
        // 見出し語を辞書順にソートする TODO:キャッシュ
        const keys = Object.keys(words).sort((a, b) => {
          // console.log({ a: words[a], b: words[b] });
          return kanaToHira(words[a][0].yomi.toLowerCase()) <
            kanaToHira(words[b][0].yomi.toLowerCase())
            ? -1
            : 1;
        });
        // 指定された頭文字から始まる見出し語だけ取り出す
        for (const yomi of keys) {
          // console.log(words[word][0].yomi.substring(0, 1));
          if (headwords.includes(words[yomi][0].yomi.substring(0, 1))) {
            dict[yomi] = words[yomi];
          }
        }
        // console.log({ dict });
        const divs = [];
        for (const yomi of Object.keys(dict)) {
          // console.log(dict[yomi]);
          const l = [h("dt", dict[yomi][0].word)];
          for (const ref of dict[yomi]) {
            l.push(h("dd", h("a", { href: ref.href }, ".")));
          }
          divs.push(h("div", l));
        }
        // console.log(divs);
        return h("dl", divs);
      },
    },
  ];
};
