//var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const urlMarket =
  "https://steamcommunity.com/market/listings/730/AWP%20%7C%20Asiimov%20%28Battle-Scarred%29/";
//const urlMarket = "https://steamcommunity.com/market/listings/730/%E2%98%85%20M9%20Bayonet%20%7C%20Doppler%20%28Factory%20New%29/";
//const urlMarket = "https://steamcommunity.com/market/listings/730/Dual%20Berettas%20%7C%20Colony%20%28Field-Tested%29/";
//const urlMarket = "https://steamcommunity.com/market/listings/730/MP7%20%7C%20Army%20Recon%20%28Field-Tested%29/";
const urlMarketJson = urlMarket + "render?currency=7&format=json&count=20";

var script = document.createElement("script");
script.textContent =
  "BuyMarketListing( sElementPrefix, listingid, appid, contextid, itemid )";
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

var listaFloats = [""];

var repetir = true;
var contador = 0;

pageLoad();
function pageLoad() {
  CreateDiv();
  requestExtension();
}

//Tabela inserida na pagina da skin que mostra os floats das skins listadas
function CreateDiv() {
  var divLogFloat = document.createElement("div");
  document
    .getElementsByClassName("responsive_page_template_content")[0]
    .appendChild(divLogFloat);
  divLogFloat.id = "divLogFloat";
  divLogFloat.style.position = "absolute";
  divLogFloat.style.marginTop = "-2300px";
  divLogFloat.style.marginLeft = "30px";
  divLogFloat.style.width = "200px";
  divLogFloat.style.height = "1500px";
  divLogFloat.style.backgroundColor = "#46602a";
  divLogFloat.style.borderStyle = "border-box";
  divLogFloat.style.padding = "10px";
  divLogFloat.style.color = "black";
  divLogFloat.style.fontWeight = "bold";
  divLogFloat.style.overflow = "hidden";
  divLogFloat.style.borderRadius = "10px";
  divLogFloat.style.fontSize = "20px";

  var divLogContagem = document.createElement("div");
  document
    .getElementsByClassName("responsive_page_template_content")[0]
    .appendChild(divLogContagem);
  divLogContagem.id = "divLogContagem";
  divLogContagem.style.position = "absolute";
  divLogContagem.style.marginTop = "-2300px";
  divLogContagem.style.marginLeft = "260px";
  divLogContagem.style.width = "35px";
  divLogContagem.style.height = "1500px";
  divLogContagem.style.backgroundColor = "#46602a";
  divLogContagem.style.borderStyle = "border-box";
  divLogContagem.style.padding = "10px";
  divLogContagem.style.color = "black";
  divLogContagem.style.fontWeight = "bold";
  divLogContagem.style.overflow = "hidden";
  divLogContagem.style.borderRadius = "10px";
  divLogContagem.style.fontSize = "20px";
}

function requestExtension() {
  try {
    var result = httpGetAsync();
  } catch (error) {
    console.log(error);
    window.location.replace(urlMarket);
  }
}

function requestAgain(time) {
  setTimeout(function () {
    requestExtension();
  }, time);
}

//requisição da da API da STEAM
function httpGetAsync(theUrl, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", urlMarketJson, false);
  xhr.setRequestHeader("responseType", "application/json");
  xhr.setRequestHeader("Access-Control-Allow-Credentials", "true");
  xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhr.setRequestHeader("Access-Control-Allow-Methods", "GET");
  xhr.setRequestHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status == 429) requestAgain(50000);

      var count = 0;
      var data = JSON.parse(xhr.responseText.toString());

      while (Object.keys(data.listinginfo)[count] != undefined) {
        var index = Object.keys(data.listinginfo)[count];
        var dados = data.listinginfo[index];
        var listingid = dados.listingid;
        var publisher_fee_app = dados.publisher_fee_app;
        var assetID = dados.asset.id;

        var linkParts = dados.asset.market_actions[0].link.split("%");
        var linkFinal = linkParts[linkParts.length - 1];

        if (listaFloats.indexOf(dados.listingid) < 0) {
          listaFloats.push(dados.listingid);
          var float = getFloatExtension(
            listingid,
            assetID,
            publisher_fee_app,
            linkFinal,
            dados
          );
        }

        count++;
      }
      contador++;

      var divLogContagem = document.getElementById("divLogContagem");
      divLogContagem.innerHTML = "<br />" + divLogContagem.innerHTML;
      divLogContagem.innerHTML = contador + divLogContagem.innerHTML;

      if (contador > 1000) location.reload();
    }
    requestAgain(1570);
  };
  xhr.send(null);
}

//Resquisição da API do CSGOFLOAT para verificar o float do item encontrado
function getFloatExtension(
  listingid,
  assetid,
  publisher_fee_app,
  linkFinal,
  dados
) {
  var url =
    "https://api.csgofloat.com/?url=steam://rungame/" +
    publisher_fee_app +
    "/76561202255233023/+csgo_econ_action_preview%20M" +
    listingid +
    "A" +
    assetid +
    linkFinal;

  var xhr1 = new XMLHttpRequest();
  xhr1.open("GET", url, true);
  xhr1.setRequestHeader("responseType", "application/json");
  xhr1.setRequestHeader("Access-Control-Allow-Credentials", "true");
  xhr1.setRequestHeader("Access-Control-Allow-Origin", "*");
  xhr1.setRequestHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT"
  );
  xhr1.setRequestHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  xhr1.onreadystatechange = function () {
    if (xhr1.readyState == 4) {
      try {
        var response = JSON.parse(xhr1.responseText);
        checkFloat(response.iteminfo.floatvalue, dados);
      } catch (error) {
        console.log(error);
      }
    }
  };
  xhr1.send();
}

//Cheackar se o float está adequado
function checkFloat(float, dados) {
  if (Number(float) > 0.9) {
    if (repetir) {
      repetir = false;
      BuyItemAjax(float, dados);
    }
  } else {
    var divLogFloat = document.getElementById("divLogFloat");
    divLogFloat.innerHTML = "<br />" + divLogFloat.innerHTML;
    divLogFloat.innerHTML = float + divLogFloat.innerHTML;
  }
}
function retrieveWindowVariables(variable) {
  var script = document.createElement("script");
  script.id = "tmpScript";
  script.textContent =
    'document.getElementById("tmpScript").textContent = JSON.stringify(' +
    variable +
    ")";
  document.documentElement.appendChild(script);
  let result = document.getElementById("tmpScript").textContent;
  script.remove();
  return JSON.parse(result);
}

//Requisição de compra no método POST da STEAM
function BuyItemAjax(float, dados) {
  var g_sessionID = retrieveWindowVariables("g_sessionID");
  $.ajax({
    url: "https://steamcommunity.com/market/buylisting/" + dados.listingid,
    type: "POST",
    data: {
      sessionid: g_sessionID,
      currency: 7,
      subtotal: dados.converted_price_per_unit,
      fee: dados.converted_fee_per_unit,
      total: +dados.converted_price_per_unit + +dados.converted_fee_per_unit,
      quantity: 1,
      first_name: undefined,
      last_name: undefined,
      billing_address: undefined,
      billing_address_two: undefined,
      billing_country: undefined,
      billing_city: undefined,
      billing_state: "",
      billing_postal_code: undefined,
      save_my_address: "0",
    },
    crossDomain: true,
    xhrFields: { withCredentials: true },
  })
    .done(function (data) {
      var myAudio = new Audio(chrome.runtime.getURL("alert.mp3"));
      myAudio.play();

      document.body.innerHTML +=
        "<a id='test' href='data:text;charset=utf-8," +
        encodeURIComponent(
          float.toString() +
            "-" +
            dados.converted_price_per_unit +
            +dados.converted_fee_per_unit
        ) +
        "' download=yourfilename>Your Download</a>";
      document.getElementById("test").click();
      requestAgain(50000);
    })
    .fail(function (jqxhr) {
      var myAudio = new Audio(chrome.runtime.getURL("alert.mp3"));
      myAudio.play();

      document.body.innerHTML +=
        "<a id='test' href='data:text;charset=utf-8," +
        encodeURIComponent(
          float.toString() +
            "-" +
            dados.converted_price_per_unit +
            +dados.converted_fee_per_unit +
            jqxhr
        ) +
        "' download=yourfilename>Your Download</a>";
      document.getElementById("test").click();
      requestAgain(50000);
    });
}
