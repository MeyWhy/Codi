//DONE fix basic skull: gets 1 word clue + pattern
//DONE add synonym check
//TODO fix ui (better)
//TODO add loading (le temps de charger le dico)
//DONE might add transformer process for better res (process pattern as sentence)
//TODO find a way to make search more efficient
import { newStemmer } from "snowball-stemmers";
import {pipeline} from "@huggingface/transformers";

const stemmer=newStemmer('french');

const STOP_WORDS = new Set([
    "le","la","les","un","une","des","du","de","d","l",
    "au","aux","à","a",
    "et","ou","mais","donc","or","ni","car",
    "que","qui","quoi","dont","où","qu",
    "ce","cet","cette","ces","se","sa","son","ses",
    "mon","ma","mes","ton","ta","tes","notre","nos","votre","vos","leur","leurs",
    "je","tu","il","elle","on","nous","vous","ils","elles",
    "me","te","moi","toi","lui","eux",
    "dans","sur","sous","avec","sans","pour","par","chez","entre","vers",
    "est","sont","être","été","avoir","fait","faire",
    "ne","pas","plus","moins","comme","si","très"
]);

let dictionary = {};
let extractor;
const embeddingCache = new Map();

async function loadModel() {
    extractor = await pipeline(
        "feature-extraction",
        "Xenova/multilingual-e5-small"
    );

    console.log("Transformer loaded.");
}
async function loadDictionary() {
    //const status
    try{
       const response =
        await fetch("dictionary.json");
      if(!response.ok){
        throw new Error(`HTTP ${response.status}`);
      }
      dictionary= await response.json();
      const totalwords=Object.values(dictionary).reduce((sum, arr)=> sum+arr.length, 0);
      console.log("Dico loaded: ", totalwords, " words");
    // console.log(dictionary);
    // console.log(Object.keys(dictionary));
    // console.log(dictionary["4"]);

    }
    catch(error){
      console.error("Failed to load dictionary.json ", error);
    }   
}


function cosineSimilarity(a, b){

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for(let i=0;i<a.length;i++){

        dot += a[i] * b[i];

        normA += a[i] * a[i];

        normB += b[i] * b[i];
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
async function getQueryEmbedding(clue){

    const output = await extractor("query: "+clue,{
        pooling:"mean",
        normalize:true
    });

    return Array.from(output.data);

}
window.addEventListener("DOMContentLoaded",async() => { await loadDictionary();  await loadModel();});

function preprocess(text) {

    return stripAccent(text.toLowerCase())
        .match(/\p{L}+/gu)
        ?.filter(word => !STOP_WORDS.has(word))
        .map(word => stemmer.stem(word))
        || [];

}

//func to strip accent pour normaliser lors de la rechercherg => using regex
function stripAccent(lettre){
  return lettre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


//returns true si on a un mot qui suit le pattern (_ : wildcard)
function matches(word, pattern) {
  if (word.length != pattern.length){
    return false;
  }
    for(let i = 0; i<pattern.length; i++) {

        if(pattern[i] !== "_" && pattern[i] !== word[i]) {
            return false;
        }
    }

    return true;
}
async function getEntryEmbedding(entry) {

    if (embeddingCache.has(entry.word))
        return embeddingCache.get(entry.word);

    const text = "passage: "+[
        entry.word,
        entry.definition,
        ...(entry.synonyms || [])
    ].join(" ");

    const output = await extractor(text, {
        pooling: "mean",
        normalize: true
    });

    const embedding = Array.from(output.data);

    embeddingCache.set(entry.word, embedding);

    return embedding;
}
async function semanticScore(queryEmbedding, entry){

    const embedding = await getEntryEmbedding(entry);

    return cosineSimilarity(queryEmbedding, embedding);

}
function lexicalSearch(clue, pattern, length) {

    let candidates;

    if (length)
        candidates = dictionary[String(length)] || [];
    else if (pattern)
        candidates = dictionary[String(pattern.length)] || [];
    else
        candidates = Object.values(dictionary).flat();

    const results = [];

    for (const entry of candidates) {

        if (!candidateMatches(entry, pattern, length))
            continue;

        const lexical = clue
            ? scoreDefinition(clue, entry.definition, entry.synonyms)
            : 0;

        if (clue && lexical === 0)
            continue;

        results.push({
            ...entry,
            lexical
        });
    }

    results.sort((a, b) => b.lexical - a.lexical);

    return results.slice(0, 100);
}
async function semanticRerank(queryEmbedding, candidates, pattern, length) {

await Promise.all(
    candidates.map(async (entry) => {
        entry.semantic = await semanticScore(queryEmbedding, entry);

        entry.finalScore =
            entry.lexical * 0.35 +
            entry.semantic * 0.65 +
            (pattern ? 1 : 0) +
            (length && entry.word.length === length ? 1 : 0);
    })
);

    candidates.sort((a, b) => b.finalScore - a.finalScore);

    return candidates;
}
async function solve(clue, pattern, length) {
     const lexicalResults =
        lexicalSearch(clue, pattern, length);

    if (!clue){
      lexicalResults.forEach(entry=> {entry.finalScore=entry.lexical;});
      return lexicalResults;
    }

    const queryEmbedding =
        await getQueryEmbedding(clue);

    return await semanticRerank(
        queryEmbedding,
        lexicalResults,
        pattern,
        length
    );
}

function scoreDefinition(clue, definition, synonym){
  const clueWords= preprocess(clue);
  const defWords= new Set(preprocess(definition|| ""));
  preprocess((synonym || []).join(" ")).forEach(word => defWords.add(word));

  let score=0;
  for(const word of clueWords){

    if (defWords.has(word)){
      if(word.length>=8)
        score+=3;
      else if (word.length>=5)
        score+=2;
      else
        score+=1;
    }
  };
  return score;
}
function candidateMatches(entry, pattern, length) {
    if (length && entry.word.length !== length){
      return false;
    }
    if(!pattern){
      return true;
    }
  return matches(entry.word, pattern.toLowerCase());
}

document.getElementById("searchBtn").addEventListener("click",search);

    async function search() {
    if (!extractor) {
    alert("Model is still loading...");
    return;
}
    const button = document.getElementById("searchBtn");
    const loader= document.getElementById('loader');
    loader.style.display="block";
    button.disabled = true;
    try {
    await new Promise(requestAnimationFrame);

    const pattern =document.getElementById("pattern").value.trim();

    const clue =document.getElementById("clue").value.trim();

    const length=(document.getElementById("length").value) ? (Number(document.getElementById("length").value)) : 0;
    const results =await solve(clue,pattern,length);
    const ul =document.getElementById("results");

    ul.innerHTML = "";

    results.slice(0, 30).forEach(entry => {
            const li =document.createElement("li");
            const shown=(entry.display || entry.word);
            const synonyms = entry.synonyms && entry.synonyms.length ? `<br><em>Synonymes : ${entry.synonyms.join(", ")}</em>`: "";
            li.innerHTML = `
            <strong>${shown.toUpperCase()}</strong>
            <br>
            ${entry.definition}
            ${synonyms}
            <br>
            Score: ${entry.finalScore}
            `;

            ul.appendChild(li);
        });

    document.getElementById("count").textContent =`${results.length} résultat(s)`;
    }
    finally{
    loader.style.display="none";
    button.disabled = false;
}
}