//keywords o get from db
let availableKeywords=['Mot','Femme', 'Bon', 'Plat','Rustre', 'Soliciter', 'Aimer', 'Bouger','Tisane', 'bleu', 'il etait une fois', 'il faut parfois'];

const resultsBox= document.querySelector(".result-box")
const inputBox = document.getElementById("input-box")
const button = document.querySelector('.button-search')
let res;
inputBox.onkeyup=function(){
    let result=[];
    let input=inputBox.value;
    if (input.length){
        ree
        result=availableKeywords.filter((keyword)=>{
          return  keyword.toLowerCase().includes(input.toLowerCase())
        });
        console.log(result)
    }
    display(result)
    res=result
    if(!result.length){
        resultsBox.innerHTML = ''
    }
}

function display(result){
    const content= result.map((list)=>{
        return "<li onclick=selectInput(this)>"+list+"</li>";
    });
    resultsBox.innerHTML= "<ul>"+ content.join('') + "</ul>"
}

function selectInput(list){
    inputBox.value = list.innerHTML
    resultsBox.innerHTML = ''
}
button.addEventListener('click', () => {
    console.log("starting the search")
    console.log("input is: ", res.value)
      // run ajax request
      //fetch('http://yoururlhere?query=' + input.value)
    })

function getWordFromDB(){}

function displayDefs(){}