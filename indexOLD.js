//var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const urlMarket = "https://steamcommunity.com/market/listings/730/AWP%20%7C%20Asiimov%20%28Battle-Scarred%29/";
//const urlMarket = "https://steamcommunity.com/market/listings/730/%E2%98%85%20M9%20Bayonet%20%7C%20Doppler%20%28Factory%20New%29/";
//const urlMarket = "https://steamcommunity.com/market/listings/730/Dual%20Berettas%20%7C%20Colony%20%28Field-Tested%29/";
//const urlMarket = "https://steamcommunity.com/market/listings/730/MP7%20%7C%20Army%20Recon%20%28Field-Tested%29/";
const urlMarketJson = urlMarket + "render?currency=7&format=json";

var script = document.createElement('script');
script.textContent = "BuyMarketListing( sElementPrefix, listingid, appid, contextid, itemid )";
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

var repetir = true;
var contador = 0;

pageLoad();
function pageLoad() {
    // if (window.location.href.toString().indexOf('?listingid=') >= 0) {
    //     var listingid = getURLParameter('listingid');
    //     var assetid = getURLParameter('assetid');
    //     var float = getURLParameter('float');
    //     console.log('hello');

    //     try {
    //         createBuyFunction(listingid, assetid);
    //     } catch (error) {
    //         console.log(error);
    //     }

    //     try {
    //         document.getElementById("market_buynow_dialog_accept_ssa").click();
    //         document.getElementById("market_buynow_dialog_purchase").click();

    //     } catch (error) {

    //     }

    //     var myAudio = new Audio(chrome.runtime.getURL("alert.mp3"));
    //     myAudio.play();

    //     document.body.innerHTML += "<a id='test' href='data:text;charset=utf-8," + encodeURIComponent(float.toString()) + "' download=yourfilename>Your Download</a>";
    //     document.getElementById('test').click();
    //     window.location.replace(urlMarket);
    //     requestAgain(10000)

    // }
    // else
    requestExtension();
}

// function getURLParameter(name) {
//     return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
// }

function requestExtension() {
    try {
        var result = httpGetAsync();
    } catch (error) {
        console.log(error);
        window.location.replace(urlMarket);
    }
}

function requestAgain(time) {
    setTimeout(function () { requestExtension(); }, time);
}

//requisição da da API da STEAM
function httpGetAsync(theUrl, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", urlMarketJson, false);
    xhr.setRequestHeader('responseType', 'application/json');
    xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true');
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET');
    xhr.setRequestHeader('Access-Control-Allow-Headers', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {

            if (xhr.status == 429)
                requestAgain(50000);

            var count = 0;
            var data = JSON.parse(xhr.responseText.toString());

            while (Object.keys(data.listinginfo)[count] != undefined) {

                var index = Object.keys(data.listinginfo)[count];
                var dados = data.listinginfo[index];
                var listingid = dados.listingid;
                var publisher_fee_app = dados.publisher_fee_app;
                var assetID = dados.asset.id;

                var linkParts = dados.asset.market_actions[0].link.split('%');
                var linkFinal = linkParts[linkParts.length - 1];

                var float = getFloatExtension(listingid, assetID, publisher_fee_app, linkFinal, dados);

                count++
            }
            contador++;
            console.log(contador);

            if (contador > 1000)
                location.reload();

        }
        requestAgain(1570);
    }
    xhr.send(null);
}

//Resquisição da API do CSGOFLOAT para verificar o float do item encontrado
function getFloatExtension(listingid, assetid, publisher_fee_app, linkFinal, dados) {

    var url = 'https://api.csgofloat.com/?url=steam://rungame/' + publisher_fee_app + '/76561202255233023/+csgo_econ_action_preview%20M' + listingid + 'A' + assetid + linkFinal;

    var xhr1 = new XMLHttpRequest();
    xhr1.open("GET", url, true);
    xhr1.setRequestHeader('responseType', 'application/json');
    xhr1.setRequestHeader('Access-Control-Allow-Credentials', 'true');
    xhr1.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr1.setRequestHeader('Access-Control-Allow-Methods', 'GET');
    xhr1.setRequestHeader('Access-Control-Allow-Headers', 'application/json');
    xhr1.onreadystatechange = function () {
        if (xhr1.readyState == 4) {
            try {
                var response = JSON.parse(xhr1.responseText);
                checkFloat(response.iteminfo.floatvalue, listingid, assetid, publisher_fee_app, linkFinal, dados);
            } catch (error) {
                console.log("falha ao fazer a requisição")
            }
        }
    }
    xhr1.send();
}

//Cheackar se o float está adequado
function checkFloat(float, listingid, assetid, publisher_fee_app, linkFinal, dados) {
    if (Number(float) > 0.90000000) {
        if (repetir) {
            repetir = false;
            BuyItemAjax(dados);
            //return CreateHtmlItem(float, listingid, assetid, publisher_fee_app, linkFinal, dados);
            //window.location.replace(urlMarket + '/?listingid=' + listingid + '&assetid=' + assetid + '&float=' + float);
        }
    }
    else {
        console.log(float);
    }
}

//Montar HTML com item encontrado
function CreateHtmlItem(float, listingid, assetid, publisher_fee_app, linkFinal, dados) {

    try {

        var html = GenerateHTML(float, listingid, assetid, publisher_fee_app);

        var node = document.createElement('div');
        node.innerHTML = html;

        document.getElementById('searchResultsRows').appendChild(node);

    } catch (error) {
        console.log(error)
    }

    dados = { [dados.listingid]: dados };

    createListingFunction(dados)
    createBuyFunction(listingid, assetid);

    setTimeout(function () { BuyItem(listingid, assetid); }, 100);
}

function createListingFunction(dados) {
    let newScript = document.createElement('script');
    newScript.innerHTML = 'MergeWithListingInfoArray(' + JSON.stringify(dados) + ')'; //'Object.assign(rgListing, ' + (dados).toString() + ')';
    document.head.appendChild(newScript);
}
function createBuyFunction(listingid, assetid) {
    let newScript = document.createElement('script');

    var item = { appid: 730, contextid: 2, itemid: assetid, name: 'AWP | Asiimov' };

    newScript.innerHTML = 'BuyItemDialog.Show("listing", "' + listingid + '", ' + JSON.stringify(item) + ');';
    document.head.appendChild(newScript);

    setTimeout(function () { window.location.replace(urlMarket); }, 10000);
    //newScript.remove(); //Can be removed, if desired.
}

//Compra o item que foi aberto no popup
function BuyItem(listingid, assetid) {

    document.getElementById("market_buynow_dialog_accept_ssa").click();
    document.getElementById("market_buynow_dialog_purchase").click();

    var myAudio = new Audio(chrome.runtime.getURL("alert.mp3"));
    myAudio.play();

    document.body.innerHTML += "<a id='test' href='data:text;charset=utf-8," + encodeURIComponent(float.toString()) + "' download=yourfilename>Your Download</a>";
    document.getElementById('test').click();

    window.location.replace(urlMarket);
}

//Gerar corpo do HTML do item encontrado
function GenerateHTML(float, listingid, assetid, publisher_fee_app) {
    var html = "";

    html = `<div class="market_listing_row market_recent_listing_row listing_` + listingid + `" id="listing_` + listingid + `">
                <div class="market_listing_item_img_container">		
                    <img id="listing_` + listingid + `_image" src="https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0n_L1JaKfzzoGuJJ02e2W8d6m2gztrkRoZmigItDGcgA_N1iFqwC-xr_m1J-57YOJlyVerprbwA/62fx62f" srcset="https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0n_L1JaKfzzoGuJJ02e2W8d6m2gztrkRoZmigItDGcgA_N1iFqwC-xr_m1J-57YOJlyVerprbwA/62fx62f 1x, https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0n_L1JaKfzzoGuJJ02e2W8d6m2gztrkRoZmigItDGcgA_N1iFqwC-xr_m1J-57YOJlyVerprbwA/62fx62fdpx2x 2x" style="border-color: #D2D2D2;" class="market_listing_item_img economy_item_hoverable" alt="">	
                    <a id="listing_` + listingid + `_actionmenu_button" class="market_actionmenu_button" href="javascript:void(0)"></a>
                </div>
                <div class="market_listing_price_listings_block">
                <div class="market_listing_right_cell market_listing_action_buttons">
                    <div class="market_listing_buy_button">
                        <a href="javascript:BuyMarketListing('listing', '` + listingid + `', ` + publisher_fee_app + `, '2', '` + assetid + `')" class="item_market_action_button btn_green_white_innerfade btn_small">
                        <span>
                        Buy Now								</span>
                        </a>
                    </div>
                </div>
                <div class="market_listing_right_cell market_listing_their_price">
                    <span class="market_table_value">
                    <span class="market_listing_price market_listing_price_with_fee">
                    R$ 0,00					</span>
                    <span class="market_listing_price market_listing_price_with_publisher_fee_only">
                    R$ 0,00					</span>
                    <span class="market_listing_price market_listing_price_without_fee">
                    R$ 0,00					</span>
                    <br>
                    </span>
                </div>
                </div>
                <div class="market_listing_right_cell market_listing_seller">
                <span class="market_listing_owner_avatar">
                <span class="playerAvatar online">
                <img src="https://community.cloudflare.steamstatic.com/market/image/_1cNNt-NJQ8NWcFMx1VA9Y8NIcCHCrLRLu6QrwTg3h8nrwDKNebz323eBe6H_KHvs3Vmyv6QYUE2UTRRTjF1JgfT-d-s646IFmRkGZSKoq0Hg2A-w8Qs7JnlZRIS68-McKjqiuBKhHMwnEMDmWvWepfop-6E33vMnyN_HVXp4xha4If-mQ/avatar.jpg" alt="">
                </span>
                </span>
                </div>
                <div class="market_listing_item_name_block">
                <span id="listing_` + listingid + `_name" class="market_listing_item_name economy_item_hoverable" style="color: #D2D2D2;">AWP | Asiimov (Battle-Scarred)</span>
                <br>
                <span class="market_listing_game_name">Counter-Strike: Global Offensive</span>
                </div>
                <div style="clear: both;"></div>
            </div>`;

    return html;
}

function BuyItemAjax(sessionid, listingid, price, fee, total) {

    $J.ajax({
        url: 'https://steamcommunity.com/market/buylisting/' + listingid,
        type: 'POST',
        data: {
            sessionid: sessionid,
            currency: 7,
            subtotal: price,
            fee: fee,
            total: total,
            quantity: 1,
            first_name: undefined,
            last_name: undefined,
            billing_address: undefined,
            billing_address_two: undefined,
            billing_country: undefined,
            billing_city: undefined,
            billing_state: "",
            billing_postal_code: undefined,
            save_my_address: '0'
        },
        crossDomain: true,
        xhrFields: { withCredentials: true }
    }).done(function (data) {
        
    }).fail(function (jqxhr) {
        var myAudio = new Audio(chrome.runtime.getURL("alert.mp3"));
        myAudio.play();

        document.body.innerHTML += "<a id='test' href='data:text;charset=utf-8," + encodeURIComponent(float.toString()) + "' download=yourfilename>Your Download</a>";
        document.getElementById('test').click();
        window.location.replace(urlMarket);
    })
}