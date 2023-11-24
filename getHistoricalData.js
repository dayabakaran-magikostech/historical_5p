const axios = require('axios');
const { readData } = require("./gs_funcs");
const util = require('util');
const fs = require('fs');
const slugify = require('slugify');
const { format, parse } = require('date-fns');

const file_headers = ['Timestamp', 'Open', 'High', 'Low', 'Close', 'Volume', 'Expiry'];
const url_headers = {
	'Ocp-Apim-Subscription-Key': 'tuUWf7n8YtKcxhGuU7B4fycs8AccLrQJ',
	'x-clientcode': '51953588',
	'x-auth-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjUxOTUzNTg4Iiwicm9sZSI6IjczODgiLCJTdGF0ZSI6IiIsIlJlZGlyZWN0U2VydmVyIjoiQiIsIm5iZiI6MTcwMDgyODMyMSwiZXhwIjoxNzAwODUwNTk5LCJpYXQiOjE3MDA4MjgzMjF9.DKp6-ef42l5gx2HSnnUs3Mnj3L2DTkSsVCrDMxFmThA'
};


async function getHistoricalData() {
	const filters = [{ filterType: "simple" }];

	const scrip_code_data = await readData(
		'Filtered Data',
		filters,
		'https://script.google.com/macros/s/AKfycbxh5OR2_idR4yvdZoK51td94n3vPB6mjtiIlSwsV2x8Qu2AKxuaAS3WN84MEBAqOCXl/exec'
	);

	for await (const row of scrip_code_data) {
		const exch = row['Exch'];
		const exch_type = row['Exch Type'];
		const scrip_code = row['Scrip Code'];
		const symbol = row['Symbol'];
		const slugifiedText = slugify(symbol, { lower: true });
		const series = row['Series'];
		const start = convertDateFormat(row['Start']);
		const end = convertDateFormat(row['Expiry']);
		const cptype = row['CpType'];
		const strike_price = row['Strike Price'];

		const candles = await getQuotes(scrip_code, exch, exch_type, '1m', start, end);

		const file_name = 'logs2/' + slugifiedText + ".csv";
		let final_array = [];
		for (const row of candles) {
			row.push(end);
		}
		final_array.push(...candles);
		final_array.sort((a, b) => new Date(a[0]) - new Date(b[0]));
		const csvData = [file_headers, ...final_array].map(row => row.join(','));
		const csvContent = csvData.join('\n');
		fs.writeFileSync(file_name, csvContent, 'utf8');
		console.log('CSV file created: ', file_name);
	}

}


async function getQuotes(
	scripcode,
	exch,
	exchType,
	interval,
	fromDate,
	toDate
) {
	const url = `https://openapi.5paisa.com/historical/${exch}/${exchType}/${scripcode}/${interval}?from=${fromDate}&end=${toDate}`;
	const response = await axios.get(url, { headers: url_headers });
	// console.log(response.data);
	// console.log(response.data.data.candles);
	return response.data.data.candles;
}


function convertDateFormat(inputDate) {
	const parsedDate = parse(inputDate, 'MM/dd/yyyy', new Date());
	return format(parsedDate, 'yyyy-MM-dd');
}

getHistoricalData();