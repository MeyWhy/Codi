const handleClick= async() =>{
  const input = document.querySelector("#input").value; 
  if (!input || input==""){
    alert("Please enter a valid input");
    return;
  }
  document.querySelector(".fa.fa-spinner.fa-spin").style.display="block";
  //document.querySelector(".fa.fa-search").style.display= "none";
  console.log(input);
  getWordDefinition(input);
 


const searchBox = document.getElementsByClassName("search-box") 
const listResult = document.getElementsByClassName("list-result") 
const wordTxt = document.getElementsByClassName("word-txt") 
const definitionTxt = document.getElementsByClassName("defintion-txt") 
const errorTxt = document.getElementsByClassName("error") 
const resultsBox= document.querySelector(".result-box")


}

async function getWordDefinition(word){// await fetch(appel à api)
  const url= "https://api.dictionaryapi.dev/api/v2/entries/en/"+ word;
  try{
    const response = await fetch(url);
    const result = await response.text();
    const responseObj= JSON.parse(result);
    document.querySelector(".fa.fa-spinner.fa-spin").style.display="none";
    document.querySelector(".result-box").style.display="block";
    document.querySelector("#word-txt").innerText=word;
    document.querySelector(".definition-txt").innerText=responseObj[0].meanings[0].definitions[0].definition;
    document.querySelector("#phonetic-txt").innerText=responseObj[0].phonetic;
    document.querySelector("#type-txt").innerText=responseObj[0].meanings[0].partOfSpeech;

  } catch (error){
    console.log(error);
    document.querySelector(".error").innerText=error;
    //document.querySelector("#word-text").style.display="none";
    //document.querySelector(".definition-txt").style.display="none";
  }
   
}