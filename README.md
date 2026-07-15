# Codi   

---
Codi est un solveur de mots fléchés qui compte aussi comme un dictionnaire inversé. Il peut deviner les mots les plus pertinents par rapport à une taille donnée, un pattern ou des mots clés. Il combine une recherche lexicale classique avec une recherche sémantique basée sur un Transformer        

A "reverse dictionary" to find all the words from either a keyword, a word length or a pattern (with "_" as a wildcard)   

The objective is to help you find any word based on some keywords you'll input    

<img width="957" height="344" alt="codi" src="https://github.com/user-attachments/assets/638d747e-53d5-4e24-8d16-0df497e3e7cb" />


 
#### To start it:   
```bash
npm install
npm run dev
```
- open http://localhost:5173
- et input ce que vous voulez   

### Features
- Recherche par définition
- Recherche par longueur
- Recherche par pattern (`_` comme joker)
- Suppression des stop words
- French stemming (Snowball)
- Recherche dans les synonymes
- Classement par score lexical
- Reranking sémantique avec un Transformer (E5)


## Stack used
- JavaScript (ES Modules)
- Vite
- Snowball Stemmers (French stemming): a js library to improve lexical search (link the words with same root)
- HuggingFace Transformers.js
- multilingual-e5-small (semantic embeddings)


## Search pipeline

User query

↓

Pattern filtering

↓

Length filtering

↓

Lexical search
- stemming
- stop-word removal
- synonym matching

↓

Top 100 candidates

↓

Semantic reranking (Transformer)

↓

Final ranking
  


### Dictionary

The dictionary contains more than 1.6 million French words with definitions and synonyms.

### Future changes   
- Might add some pagination pour faciliter la navigation   
- Modifier le calcul de score pour que le script prenne en compte les mots les plus demandés en mots fléchés (car for now c'est pas le cas)    
- Better UI stuff   
