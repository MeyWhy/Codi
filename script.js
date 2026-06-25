
let dictionary = {};

async function loadDictionary() {
    //const status
    try{
       const response =
        await fetch("dictionary.json");
      if(!response.ok){
        throw new Error(`HTTP ${response.status}`);
      }
      dictionary= await response.json();
      const totalwords=Object.values(dictionary).reduce((sum, arr)=> sum+arr.len, 0);
      console.log("Dico loaded: ", totalwords, " words");
    }
    catch(error){
      console.error("Failed to load dictionary.json ", error);
    }

   
}
window.addEventListener("DOMContentLoaded",loadDictionary);

//func to strip accent pour normaliser lors de la rechercherg => using regex
function stripAccent(lettre){
  return lettre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


function buildIndex() {

    wordsByLength = {};

    for(const word of words) {

        const len = word.length;

        if(!wordsByLength[len]) {

            wordsByLength[len] = [];

        }

        wordsByLength[len].push(word);
    }
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
function solve(clue, pattern, length) {
  let candidates=[];
  if (length){
    candidates=dictionary[String(length)] || [];
  }else if(pattern){
    candidates=dictionary[String(pattern.length)] || [];
  }
  else{
    candidates=Object.values(dictionary).flat();
  }
  const results=[];
  for (const entry of candidates){
    if (!candidateMatches(entry, pattern, length)){
      continue;
    }

  const score=clue ? scoreDefinition(clue, entry.definition) : 0;

  results.push({...entry, score});
}
 results.sort((a, b) =>b.score - a.score);

  return results;
}

function scoreDefinition(clue, definition){
  const clueWords= clue.toLowerCase().split(/\s+/).filter(Boolean);
  const defWords= (definition|| "").toLowerCase().split(/\s+/).filter(Boolean);
  let score=0;
  clueWords.forEach(word=>{
    if (defWords.includes(word)){
      score++;
    }
  });
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

    function search() {

    const pattern =document.getElementById("pattern").value.trim();

    const clue =document.getElementById("clue").value.trim();

    const length=(document.getElementById("length").value) ? (Number(document.getElementById("length").value)) : 0;

    const results =solve(clue,pattern,length);

    const ul =document.getElementById("results");

    ul.innerHTML = "";

    results.slice(0, 200).forEach(entry => {
            const li =document.createElement("li");
            const shown=entry.display || entry.word;
            const synonyms = entry.synonyms && entry.synonyms.length ? `<br><em>Synonymes : ${entry.synonyms.join(", ")}</em>`: "";
            li.innerHTML = `
            <strong>${shown.toUpperCase()}</strong>
            <br>
            ${entry.definition}
            ${synonyms}
            <br>
            Score: ${entry.score}
            `;

            ul.appendChild(li);
        });

    document.getElementById("count").textContent =`${results.length} résultat(s)`;
}