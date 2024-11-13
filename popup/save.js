document.getElementById('salvar').addEventListener('click', () => {
    const apiKey = document.getElementById('api-key').value;
    const idioma = document.getElementById('idioma').value;
    chrome.storage.sync.set({ apiKey, idioma }, () => { 

        console.log(apiKey, idioma); //teste aqui pode apagar
        
        window.close(); }),

    console.log(apiKey, idioma) //teste aqui pode apagar
    
    module.exports = {
        apiKey,
        idioma
     }
})