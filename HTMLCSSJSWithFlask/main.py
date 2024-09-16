from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import finnhub
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta


app = Flask(__name__,static_url_path='/static')
CORS(app)

finnhub_client = finnhub.Client(api_key="cn1kqrhr01qvjam26fv0cn1kqrhr01qvjam26fvg")

@app.route("/", methods=['GET'])
def home_page():
    return app.send_static_file('index.html')

@app.route("/company_profile", methods=['GET'])
def company_profile():
    symbol = request.args.get("symbol")
    profile = finnhub_client.company_profile2(symbol=symbol)
    return jsonify(profile)

@app.route("/stock_summary", methods=['GET'])
def stock_summary():
    symbol = request.args.get("symbol")
    stock_summary = finnhub_client.quote(symbol=symbol)
    return jsonify(stock_summary)

@app.route("/recommendation_trend", methods=['GET'])
def recommendation_trend():
    symbol = request.args.get("symbol")
    recommendation = finnhub_client.recommendation_trends(symbol=symbol)
    return jsonify(recommendation)

@app.route("/charts", methods=['GET'])
def charts():
    stock_ticker = request.args.get('ticker')
    multiplier = '1'
    timespan = 'day'
    api_key = '_VKA4av7yBdRTF0krD7F0ZtwmXTJaZpJ'

    current_date = datetime.now()
    to_date = current_date.strftime('%Y-%m-%d')

    six_months_prior = current_date - relativedelta(months=6)
    from_date = six_months_prior.strftime('%Y-%m-%d')

    url = f'https://api.polygon.io/v2/aggs/ticker/{stock_ticker}/range/{multiplier}/{timespan}/{from_date}/{to_date}?adjusted=true&sort=asc&apiKey={api_key}'

    response = requests.get(url)
    data = response.json()

    if 'results' in data:
        return jsonify(data['results'])
    else:
        return jsonify({"error": "Results not found"}), 404


@app.route("/latest_news", methods=['GET'])
def latest_news():
    symbol = request.args.get("symbol")
    current_date = datetime.now()

    thirty_days_prior = current_date - timedelta(days=30)

    formatted_current_date = current_date.strftime('%Y-%m-%d')
    formatted_thirty_days_prior = thirty_days_prior.strftime('%Y-%m-%d')
    # latest_news = finnhub_client.company_news(symbol=symbol, from= from, to=to)
    latestnews = finnhub_client.company_news(symbol=symbol, _from=formatted_thirty_days_prior, to=formatted_current_date)
    return jsonify(latestnews)

if __name__ == '__main__':
    app.run(debug=True)
