import requests as r
from bs4 import BeautifulSoup
import base64
import sys

curr = {
    'PLN': 'zloty',
    'USD': 'dollar',
    'EUR': 'euro',
    'GBP': 'pound',
}


def get_currency(currency1, currency2):
    try:
        if currency1 == currency2:
            return 1.0, None

        if currency1 not in curr or currency2 not in curr:
            raise ValueError(f"Unsupported currency: {currency1} or {currency2}")

        url = f'https://www.google.com/finance/quote/{currency1}-{currency2}'
        if currency1 != 'PLN':
            url_chart = f'https://mybank.pl/kursy-walut/{currency1.lower()}-{curr[currency1].lower()}/'
        else:
            url_chart = f'https://mybank.pl/kursy-walut/{currency2.lower()}-{curr[currency2].lower()}/'

        page = r.get(url)
        page.raise_for_status()

        soup = BeautifulSoup(page.text, 'html.parser')
        res = soup.find_all('div', attrs={'class': 'YMlKec fxKbKc'})
        if not res:
            raise ValueError("No exchange rate found on the page")

        res = float(res[0].text.replace(',', ''))

        page_2 = r.get(url_chart)
        page_2.raise_for_status()

        soup_2 = BeautifulSoup(page_2.text, 'html.parser')
        img_tag = soup_2.find('img', id='wykres_sredni')
        if not img_tag:
            raise ValueError("No chart image found on the page")

        chart_url = img_tag['src']
        chart_img_response = r.get(chart_url)
        if chart_img_response.status_code != 200:
            raise Exception(f"Failed to download chart image, status code: {chart_img_response.status_code}")

        image_base64 = base64.b64encode(chart_img_response.content).decode('utf-8')

        return res, image_base64

    except ValueError as ve:
        print(f"Error: {ve}")
        return None

    except Exception as e:
        print(f"Error: {e}")
        return None


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: MoneyExchange.exe [Currency1] [Currency2]\nE.g MoneyExchange.py USD EUR")
    else:
        currency1 = sys.argv[1]
        currency2 = sys.argv[2]
        result = get_currency(currency1, currency2)
        if result:
            if result[1]:
                try:
                    print(result[0])
                    print(result[1])
                except Exception as e:
                    print(f"An error occurred: {e}")
            else:
                print("No chart found.")
        else:
            print("No data available.")
