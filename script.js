/*const input = document.querySelector(".result-box")
const button = document.querySelector('.button-search')

console.log("result is: ", input)
button.addEventListener('click', () => {
  console.log("starting the search")
  console.log("input is: ", input)
    // run ajax request
    //fetch('http://yoururlhere?query=' + input.value)
  })*/

    
const search = document.getElementById("search") 
const resultsBox= document.querySelector(".result-box")


search.addEventListener("input", (event)=>{
  const query= event.target.value
  handleSearchDefinitions(query)
})

const handleSearchDefinitions= (query)=>{
const searchQuery= query.trim().toLowerCase()
if(searchQuery.length<=1){
  resultsBox.innerHTML= "Loading..."
}
fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchQuery}`  
).then((response)=> response.json())
.then((data)=>{
  resultsBox.innerHTML=""
  if (Array.isArray(data) && data.length>0){
    const wordData=data[0]
  }
  if (wordData.shortdef) {
    // Display the first definition (you can loop through 
'wordData.shortdef'
    const partOfSpeech = wordData.fl; // Part of speech
    const definition = wordData.shortdef[0]; // First 
definition

    resultsBox.innerHTML = `
    <div class="word-content">
    <div class="text">
      <h1>${text}</h1>
    </div>
    <div class="play-logo">
      <i class="fa fa-play" aria-hidden="true"></i>
    </div>
  </div>
  <div class="speech">
    <p>${partOfSpeech}</p>
    <hr />
  </div>
  <div class="meaning">Meaning</div>

  <div class="meaning-text">
    <li>${definition}</li>
      `;
  } else {
    resultsBox.innerHTML = "No definition found for the word.";
  }
})
}
