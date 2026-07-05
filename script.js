//DONE fix basic skull: gets 1 word clue + pattern
//TODO add synonym check
//TODO fix ui (better)
//TODO add loading (le temps de charger le dico)
//TODO might add transformer process for better res (process pattern as sentence)
//TODO find a way to make search more efficient

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
  let finalScore=score;
  if(pattern){
    finalScore+=1;
  }
  if(entry.word.length == length){
    finalScore+=1;
  }
  if (clue && score===0){
    continue;
  }
  results.push({...entry, finalScore});

}
 results.sort((a, b) =>b.finalScore - a.finalScore);

  return results;
}

function scoreDefinition(clue, definition){
  const clueWords= stripAccent(clue.toLowerCase()).match(/\p{L}+/gu) || [];
  const defWords= new Set(stripAccent((definition|| "").toLowerCase()).match(/\p{L}+/gu) ||[]);

  let score=0;
  for(const word of clueWords){

    if (defWords.has(word)){
      score++;
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

    function search() {
    
    const pattern =document.getElementById("pattern").value.trim();

    const clue =document.getElementById("clue").value.trim();

    const length=(document.getElementById("length").value) ? (Number(document.getElementById("length").value)) : 0;
    const results =solve(clue,pattern,length);
    const ul =document.getElementById("results");

    ul.innerHTML = "";

    results.slice(0, 200).forEach(entry => {
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