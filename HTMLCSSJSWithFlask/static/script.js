$(document).ready(function() {
    $('#search-input').val('');
});
$("#search-form").submit(async function(event) {
    event.preventDefault(); // Prevent the default form submission
    var symbol = $("#search-input").val().trim();
    if(symbol){
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            if (this.readyState == 4 && this.status == 200) {
                var responseObj = JSON.parse(this.responseText);
                if (Object.keys(responseObj).length === 0) {
                    $('.no-record-found').show(); // Symbol is invalid, call onInvalid callback
                    $(".search-container").hide();
                } else {
                        $('.no-record-found').hide();
                        $('.navbar a').removeClass('selected'); // Remove 'selected' from all nav links
                        $("a:contains('Company')").addClass('selected');
                        console.log(symbol)
                        Promise.all([
                            getCompanyProfile(symbol.toUpperCase()),
                            getRecommendationTrend(symbol.toUpperCase()),
                            getStockSummary(symbol.toUpperCase()),
                            getLatestNews(symbol.toUpperCase()),
                            getStockChart(symbol.toUpperCase())
                        ]).then(() => {
                            // Only show the search-container after all promises have resolved
                            $(".search-container").css("display", "flex");
                            $(".content").hide();
                            $(".active-content").show();
                            $(".search-container").show();
                        }).catch((error) => {
                            console.error(error);
                            $('.no-record-found').show(); // Show error or invalid symbol message
                        });
                }
            } else {
               $('.no-record-found').show(); // Request failed, call onInvalid callback
            }
        };
        xhttp.onerror = function() {
            $('.no-record-found').show(); // Handle network errors or other request failures
        };
        xhttp.open("GET", "/company_profile?symbol=" + encodeURIComponent(symbol), true);
        xhttp.send();

    }
});

$("#clear-button").click(function () {
    document.getElementById('search-input').value = '';
    $(".search-container").hide();
    $('.no-record-found').hide()

    $('.content').hide(); // Hide all content divs
    $('#company-profile').show(); // Show the clicked content div

    $('.navbar a').removeClass('selected'); // Remove 'selected' from all nav links
    $("a:contains('Company')").addClass('selected');

    $('.company-name').text("");
    $('.ticker-symbol').text("");
    $('.stock-exchange-code').text("");
    $('.company-start-date').text("");
    $('.category').text("");
    $('.company-logo').attr('src',"");
});

$('.navbar a').on('click', function(e) {
    e.preventDefault(); // Prevent the default anchor behavior

    var contentId = $(this).attr('href').substring(1); // Get the href attribute and remove the '#'

    $('.content').hide(); // Hide all content divs
    $('#' + contentId).show(); // Show the clicked content div

    $('.navbar a').removeClass('selected'); // Remove 'selected' from all nav links
    $(this).addClass('selected'); // Add 'selected' to the clicked nav link
  });


  function isSymbolValid(symbol, onValid, onInvalid) {
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        if (this.readyState == 4 && this.status == 200) {
            var responseObj = JSON.parse(this.responseText);
            if (Object.keys(responseObj).length === 0) {
                onInvalid(); // Symbol is invalid, call onInvalid callback
            } else {
                onValid(); // Symbol is valid, call onValid callback
            }
        } else {
            onInvalid(); // Request failed, call onInvalid callback
        }
    };
    xhttp.onerror = function() {
        onInvalid(); // Handle network errors or other request failures
    };
    xhttp.open("GET", "/company_profile?symbol=" + encodeURIComponent(symbol), true);
    xhttp.send();
}



function getCompanyProfile(symbol) {
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            console.log(response);
            $('.company-name').text(response.name);
            $('.ticker-symbol').text(response.ticker);
            $('.stock-exchange-code').text(response.exchange);
            $('.company-start-date').text(response.ipo);
            $('.category').text(response.finnhubIndustry);
            $('.company-logo').attr('src',response.logo);
        }
    };
    xhttp.open("GET", "/company_profile?symbol=" + encodeURIComponent(symbol), true);
    xhttp.send();
}

function getRecommendationTrend(symbol) {
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            console.log(response[0]);
            $('.strong-sell p').text(response[0].strongSell);
            $('.sell p').text(response[0].sell);
            $('.neutral p').text(response[0].hold);
            $('.buy p').text(response[0].buy);
            $('.strong-buy p').text(response[0].strongBuy);
        }
    };
    xhttp.open("GET", "/recommendation_trend?symbol=" + encodeURIComponent(symbol), true);
    xhttp.send();
}

function getStockSummary(symbol) {
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);

            const epochTime = response.t;

            const date = new Date(epochTime * 1000);


            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            const day = date.getDate();
            const month = months[date.getMonth()];
            const year = date.getFullYear();

            const formattedDate = `${day} ${month}, ${year}`;

            $('.ticker-symbol').text(symbol);
            $('.trading-day').text(formattedDate);
            $('.prv-closing-price').text(response.pc);
            $('.opening-price').text(response.o);
            $('.high-price').text(response.h);
            $('.low-price').text(response.l);

            if (response.d > 0) {
                $('.change-img').attr('src', 'static/images/GreenArrowUp.png');
            } else {
                $('.change-img').attr('src', 'static/images/RedArrowDown.png');
            }

            var $changeCell = $('.change');
            var $img1 = $changeCell.find('img.updown.change-img').detach();

            $changeCell.text(response.d).append($img1);

            if (response.dp > 0) {
                $('.change-percent-img').attr('src', 'static/images/GreenArrowUp.png');
            } else {
                $('.change-percent-img').attr('src', 'static/images/RedArrowDown.png');
            }

            var $changePercentCell = $('.change-percent');
            var $img2 = $changePercentCell.find('img.updown.change-percent-img').detach();

            $changePercentCell.text(response.dp).append($img2);
         }
    };
    xhttp.open("GET", "/stock_summary?symbol=" + encodeURIComponent(symbol), true);
    xhttp.send();
}


function getStockChart(symbol) {
    console.log("Inside function");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", '/charts?ticker='+encodeURIComponent(symbol), true);

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            var data = JSON.parse(xhr.responseText);
            console.log(data)

            var stockData = data.map(function(item) {
                // Convert timestamp to milliseconds if needed
                // Highcharts requires the time in milliseconds
                var timeInMilliseconds = item.t; // Assuming 't' is already in milliseconds
                var closingPrice = item.c;

                return [timeInMilliseconds, closingPrice];
            });
            var volumeData = data.map(function(item) {
                // Convert timestamp to milliseconds if needed
                // Highcharts requires the time in milliseconds
                var timeInMilliseconds = item.t; // Assuming 't' is already in milliseconds
                var closingVolume = item.v;

                return [timeInMilliseconds, closingVolume];
            });

            const today = new Date();
            const formattedToday = today.toISOString().slice(0, 10);
            var maxVolume = Math.max(...volumeData.map(item => item[1]));

            Highcharts.stockChart('chart-container', {
                chart: {
                    height: 550, // Set the height of the chart
                },
                rangeSelector: {
                    buttons: [{
                        type: 'day',
                        count: 7,
                        text: '7d'
                    }, {
                        type: 'day',
                        count: 15,
                        text: '15d'
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }],
                    inputEnabled: false,
                    selected: 0,
                },
                title: {
                    text: 'Stock Price ' + symbol + ' ' + formattedToday
                },
                subtitle: {
                    useHTML: true,
                    text: '<span style="color: blue; text-decoration: underline;"><a href="https://polygon.io" target="_blank" style="color: blue; text-decoration: none;">Source: Polygon.io</a></span>'
                },
                plotOptions: {
                    series: {
                      pointPlacement: "on",
                    },
                 },
                yAxis: [{
                    labels: {
                        align: 'right',
                        x: -10,
                    },
                    title: {
                        text: 'Stock Price',
                        rotation: 270,
                        x: -10,
                    },
                    opposite: false,
                }, {
                    labels: {
                        align: 'left',
                        x: 10,
                    },
                    title: {
                        text: 'Volume',
                        x: 10,
                    },
                    max: 2*maxVolume,
                    opposite: true,
                    gridLineWidth: 0,
                },
            ],
                tooltip: {
                    split: true
                },
                series: [{
                    name: symbol + ' Stock Price',
                    data: stockData,
                    type: 'area',
                    yAxis: 0, // Linked to the first Y-axis (Stock Price)
                    tooltip: {
                        valueDecimals: 2
                    },
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    threshold: null,
                }, {
                    type: 'column',
                    name: 'Volume',
                    data: volumeData,
                    yAxis: 1, // Linked to the second Y-axis (Volume)
                    pointWidth: 5,
                    // pointPadding: 0.9, // Increase the padding between points
                    // groupPadding: 0.5, // Increase the padding between groups
                    color: 'black',
                    tooltip: {
                        valueDecimals: 0
                    },
                    zIndex: 1, // Ensures the volume bars are behind the area chart
                }]
            });

        } else {
            console.error('Request failed with status:', xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error('Request failed');
    };

    xhr.send();
}

function getLatestNews(symbol) {
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        if (this.readyState == 4 && this.status == 200) {
            var latest_news = JSON.parse(this.responseText);
            var listContainer = document.getElementById('latest-news');
            listContainer.innerHTML = ""; // Clear existing content
            // Filter items with non-empty headline, image, and url
            var validItems = latest_news.filter(item => item.headline && item.image && item.url);

            // Get first five valid items
            var firstFiveValidItems = validItems.slice(0, 5);

            firstFiveValidItems.forEach(item => {
                // Check if item.headline, item.image, and item.url are truthy
                const listItem = document.createElement('div');
                listItem.className = 'list-item';
                const date = new Date(item.datetime * 1000);
                const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
                console.log(formattedDate)
                listItem.innerHTML = `
                <img src="${item.image}" alt="Article Image">
                <div class="list-item-content">
                    <h3>${item.headline}</h3>
                    <p class="date">${formattedDate}</p>
                    <a href="${item.url}" target="_blank">See Original Post</a>
                </div>
                `;
                listContainer.appendChild(listItem);
            });
        }
    };
    xhttp.open("GET", "/latest_news?symbol=" + encodeURIComponent(symbol), true);
    xhttp.send();
}
